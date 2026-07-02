import fs from 'fs/promises';
import path from 'path';
import { supabase } from './supabase';

const CATALOG_PATH = path.join(process.cwd(), 'public', 'catalog.json');

function slugify(text) {
  if (!text) return '';
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

function normalizeCategory(category) {
  const title = category?.title || category?.name || category?.label || "Untitled";
  const handle = category?.handle || slugify(title);

  return {
    id: category?.id || handle,
    handle,
    title,
    image: category?.image_url || category?.image || null,
    description: category?.description || "",
    raw: category,
  };
}

function getProductCategoryValue(product) {
  return (
    product?.category_handle ||
    product?.categoryHandle ||
    product?.category_slug ||
    product?.category ||
    product?.productType ||
    product?.product_type ||
    product?.collection ||
    product?.collectionHandle ||
    ""
  );
}

function buildCategoryLookup(categories = []) {
  const lookup = new Map();

  categories.forEach((category) => {
    const normalized = normalizeCategory(category);
    lookup.set(normalized.handle, normalized);
    lookup.set(slugify(normalized.title), normalized);
    lookup.set(normalized.title.toLowerCase(), normalized);
  });

  return lookup;
}

function resolveProductCategory(product, categoryLookup) {
  const rawCategory = getProductCategoryValue(product);
  if (!rawCategory) {
    return null;
  }

  const keys = [rawCategory, slugify(rawCategory), rawCategory.toString().toLowerCase()];

  for (const key of keys) {
    if (categoryLookup.has(key)) {
      return categoryLookup.get(key);
    }
  }

  return null;
}

export async function getLocalCatalog() {
  try {
    const data = await fs.readFile(CATALOG_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading catalog.json:", error);
    return [];
  }
}

export async function getShopPageData({ collectionHandle = "all", brandHandle = "all", productTypeHandle = "all" } = {}) {
  let rawProducts = [];
  let dbCategories = [];
  let dbBrands = [];
  
  let activeHolds = [];
  // Try fetching from Supabase first
  try {
    const [productsRes, categoriesRes, brandsRes, holdsRes] = await Promise.all([
      supabase.from('products').select('*'),
      supabase.from('categories').select('*'),
      supabase.from('brands').select('*'),
      supabase.from('inventory_holds').select('variant_id, quantity').gt('expires_at', new Date().toISOString())
    ]);

    if (productsRes.error) {
      console.warn("Supabase products fetch error, falling back to local catalog:", productsRes.error.message);
      rawProducts = await getLocalCatalog();
    } else if (Array.isArray(productsRes.data) && productsRes.data.length > 0) {
      rawProducts = productsRes.data;
    } else {
      rawProducts = await getLocalCatalog();
    }

    if (categoriesRes.data) dbCategories = categoriesRes.data;
    if (brandsRes.data) dbBrands = brandsRes.data;
    if (holdsRes && holdsRes.data) activeHolds = holdsRes.data;

  } catch (error) {
    console.warn("Supabase fetch failed or not configured, falling back to local catalog:", error.message);
    rawProducts = await getLocalCatalog();
  }

  const heldQuantities = new Map();
  activeHolds.forEach((hold) => {
    const current = heldQuantities.get(hold.variant_id) || 0;
    heldQuantities.set(hold.variant_id, current + (hold.quantity || 1));
  });
  
  const categoriesSet = new Set();
  const brandsSet = new Set();
  const categoryLookup = buildCategoryLookup(dbCategories);

  let products = rawProducts.map(p => {
    // Check if it's from local JSON (has sno) or Supabase (has id)
    const id = p.id || p.sno?.toString();
    const handle = p.handle || (slugify(p.productName || p.title) + '-' + id);
    const title = p.title || p.productName;
    const vendor = p.vendor || p.brand || '';
    const productType = getProductCategoryValue(p);
    const resolvedCategory = resolveProductCategory(p, categoryLookup);
    const categoryHandle = resolvedCategory?.handle || slugify(productType);
    
    let parsedVariants = p.variants;
    const weight = p.weight || p.packSize || '';

    // Extract values based on new rules
    const firstVar = parsedVariants && parsedVariants.length > 0 ? parsedVariants[0] : null;
    
    // Selling price: Price.perPcs (price)
    const rawSellingPrice = firstVar?.price?.amount || p.Price?.perPcs || p.price || 0;
    // Original price: MRP.perPcs (compareAtPrice)
    const rawOriginalPrice = firstVar?.compareAtPrice?.amount || p.MRP?.perPcs || p.compare_at_price || 0;
    
    const sellingPrice = parseFloat(rawSellingPrice) || 0;
    const originalPrice = parseFloat(rawOriginalPrice) || 0;
    
    const hasAskPrice = !!(firstVar?.askPrice || p.askPrice);
    const showDiscount = !hasAskPrice && originalPrice > sellingPrice;
    const discountPercent = showDiscount ? Math.round(((originalPrice - sellingPrice) / originalPrice) * 100) : 0;
    const savedAmount = showDiscount ? (originalPrice - sellingPrice) : 0;
    
    const unitPrice = firstVar?.unitPrice?.amount || p.Price?.perKg || null;
    const packSize = parsedVariants && parsedVariants.length === 1 ? firstVar.title : weight;

    categoriesSet.add(productType || 'Uncategorized');
    brandsSet.add(vendor || 'No Brand');

    return {
      id,
      handle,
      title,
      vendor,
      productType,
      categoryHandle,
      collectionHandles: categoryHandle ? [categoryHandle] : [],
      
      // New Pricing Data
      sellingPrice,
      originalPrice,
      discountPercent,
      savedAmount,
      unitPrice,
      packSize,
      showDiscount,
      askPrice: hasAskPrice,
      
      // Legacy formatted properties
      price: (firstVar?.askPrice || p.askPrice) ? "Ask Price" : `₹${sellingPrice}`,
      compareAtPrice: showDiscount ? `₹${originalPrice}` : null,
      
      variants: (parsedVariants || []).map(v => {
        const rawAmount = v.price?.amount ?? v.price ?? 0;
        const currency = v.price?.currencyCode ?? "INR";
        const amount = parseFloat(rawAmount) || 0;
        
        const rawCompareAmount = v.compareAtPrice?.amount ?? v.compareAtPrice ?? v.compare_at_price ?? null;
        const compareAmount = rawCompareAmount ? parseFloat(rawCompareAmount) : null;

        const weight = v.title || v.weight || "";

        const variantId = v.id || `var-${Date.now()}-${Math.random()}`;
        const held = heldQuantities.get(variantId) || 0;
        const rawStock = v.stock !== undefined && v.stock !== null ? parseInt(v.stock, 10) : null;
        const stock = rawStock !== null ? Math.max(0, rawStock - held) : null;

        const callForInventory = v.callForInventory || false;
        const availableForSale = callForInventory || stock === null || stock > 0;

        return {
          id: variantId,
          title: v.title || "Default Title",
          availableForSale,
          price: v.askPrice ? "Ask Price" : `₹${amount}`,
          compareAtPrice: v.askPrice ? null : (compareAmount ? `₹${compareAmount}` : null),
          amount: amount,
          compareAtAmount: compareAmount,
          currencyCode: currency,
          weight: weight,
          askPrice: v.askPrice || false,
          selectedOptions: v.selectedOptions || [{ name: "Size", value: v.title || "Default" }],
          stock,
          callForInventory
        };
      }),
      availableForSale: p.availableForSale !== false && p.available_for_sale !== false && ((parsedVariants || []).length === 0 || (parsedVariants || []).some(v => {
        const variantId = v.id;
        const held = heldQuantities.get(variantId) || 0;
        const rawStock = v.stock !== undefined && v.stock !== null ? parseInt(v.stock, 10) : null;
        const stock = rawStock !== null ? Math.max(0, rawStock - held) : null;
        return v.callForInventory || stock === null || stock > 0;
      })),
      weight: packSize,
      image: p.image_url ? { url: p.image_url, altText: title } : (p.image?.url ? p.image : null),
      images: (p.images && p.images.length > 0)
        ? p.images.map(url => ({ url, altText: title }))
        : (p.image_url ? [{ url: p.image_url, altText: title }] : (p.image?.url ? [p.image] : [])),
      variantId: firstVar?.id || handle + '-variant',
      description: p.descriptionHtml || p.description || "",
      ingredients: p.ingredients || "",
      nutrition: p.nutrition || null,
      faq: p.faq || null,
      is_top_searched: !!(p.is_top_searched),
      raw: p
    };
  });

  const markedTopSearched = products.filter((p) => p.is_top_searched);
  const topSearchedProducts =
    markedTopSearched.length > 0 ? markedTopSearched : products.slice(0, 4);

  // Extract filters
  let collections = [{ id: 'all', handle: 'all', title: 'All', image: null }];
  if (dbCategories.length > 0) {
    collections.push(...dbCategories.map(normalizeCategory));
  } else {
    collections.push(...Array.from(categoriesSet).map(c => ({
      id: slugify(c),
      handle: slugify(c),
      title: c,
      image: null,
      description: ''
    })));
  }

  let brands = [{ handle: 'all', title: 'All', image: null }];
  if (dbBrands.length > 0) {
    brands.push(...dbBrands.map(b => ({
      handle: b.handle,
      title: b.title,
      image: b.image_url || null
    })));
  } else {
    brands.push(...Array.from(brandsSet).map(b => ({
      handle: slugify(b),
      title: b,
      image: null
    })));
  }

  const productTypes = [{ handle: 'all', title: 'All' }];

  // Apply filters
  if (collectionHandle && collectionHandle !== "all") {
    const handles = collectionHandle.split(",").map(h => h.trim());
    // Match against canonical Supabase category handles first, then legacy product fields.
    products = products.filter(p => {
      return handles.some(handle => {
        if (handle === "all") {
          return true;
        }

        const matchingCategory = categoryLookup.get(handle) || categoryLookup.get(slugify(handle));
        const productCategoryValue = p.categoryHandle || p.productType || "";
        const productCategoryHandle = slugify(productCategoryValue);

        if (matchingCategory) {
          return (
            productCategoryHandle === matchingCategory.handle ||
            productCategoryValue.toString().toLowerCase() === matchingCategory.title.toLowerCase() ||
            p.collectionHandles?.includes(matchingCategory.handle)
          );
        }

        return productCategoryHandle === handle;
      });
    });
  }

  if (brandHandle && brandHandle !== "all") {
    products = products.filter(p => {
      if (dbBrands.length > 0) {
        const dbBrand = dbBrands.find(b => b.handle === brandHandle);
        return dbBrand && (p.vendor === dbBrand.title || slugify(p.vendor) === brandHandle);
      }
      return slugify(p.vendor) === brandHandle;
    });
  }

  const firstHandle = collectionHandle ? collectionHandle.split(",")[0].trim() : "all";
  const activeCollection = collections.find(c => c.handle === firstHandle) || collections[0];

  return {
    isConfigured: true,
    error: null,
    collections,
    activeCollection,
    brands,
    activeBrand: brandHandle,
    productTypes,
    activeProductType: productTypeHandle,
    products,
    topSearchedProducts,
    shop: { description: "Curated dairy, cheese, and pantry essentials." }
  };
}

export async function getProductByHandle(handle) {
  const { products } = await getShopPageData();
  const product = products.find(p => p.handle === handle);
  
  if (product) {
    product.collectionHandles = product.collectionHandles?.length
      ? product.collectionHandles
      : [slugify(product.productType)];
  }

  return { product };
}
