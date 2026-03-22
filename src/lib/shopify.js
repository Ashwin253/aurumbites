const DEFAULT_API_VERSION = "2026-01";

const FALLBACK_COLLECTIONS = [
  {
    id: "fallback-collection-all",
    handle: "all",
    title: "All products",
    description: "Browse the full Aurum Bites preview catalog.",
  },
  {
    id: "fallback-collection-cheese",
    handle: "cheese",
    title: "Cheese",
    description: "Fresh and aged cheeses for horeca, retail, and distribution.",
  },
  {
    id: "fallback-collection-essentials",
    handle: "essentials",
    title: "Essentials",
    description: "Kitchen staples and dairy essentials for professional buyers.",
  },
  {
    id: "fallback-collection-specialty",
    handle: "specialty",
    title: "Specialty",
    description: "Distinctive products for premium menus and curated shelves.",
  },
];

const FALLBACK_PRODUCTS = [
  {
    id: "fallback-butter",
    handle: "cultured-butter",
    title: "Cultured Butter",
    description:
      "Creamy, premium butter for retail shelves, food service, and bulk distribution.",
    longDescription:
      "Our cultured butter is designed for kitchens and shelves that need dependable quality, rich aroma, and a clean finish. It works well for laminated pastry, finishing sauces, and elevated table service.",
    image: null,
    price: "Request quote",
    amount: null,
    currencyCode: "",
    availableForSale: true,
    collectionHandles: ["all", "essentials"],
    tags: ["butter", "food-service", "retail"],
    featured: "Smooth texture with strong dairy flavor.",
    variantId: "fallback-variant-butter",
  },
  {
    id: "fallback-mozzarella",
    handle: "fresh-mozzarella",
    title: "Fresh Mozzarella",
    description:
      "Soft, clean-flavored mozzarella suited for horeca, deli, and consumer packs.",
    longDescription:
      "Fresh mozzarella with balanced moisture and clean flavor, suited for salads, pizzas, deli counters, and premium packaged assortments. Offered as a flexible product for both B2B supply and selective consumer-facing formats.",
    image: null,
    price: "Request quote",
    amount: null,
    currencyCode: "",
    availableForSale: true,
    collectionHandles: ["all", "cheese"],
    tags: ["mozzarella", "fresh-cheese", "pizza"],
    featured: "Ideal melt, stretch, and freshness profile.",
    variantId: "fallback-variant-mozzarella",
  },
  {
    id: "fallback-parmesan",
    handle: "aged-parmesan",
    title: "Aged Parmesan",
    description:
      "Hard cheese with reliable quality and strong flavor for B2B supply needs.",
    longDescription:
      "Aged parmesan with a firm texture and concentrated savory profile. It is suited for grating programs, premium pantry offerings, and menu finishing in professional kitchens.",
    image: null,
    price: "Request quote",
    amount: null,
    currencyCode: "",
    availableForSale: true,
    collectionHandles: ["all", "cheese", "specialty"],
    tags: ["parmesan", "aged-cheese", "gourmet"],
    featured: "Sharp finish with excellent grating texture.",
    variantId: "fallback-variant-parmesan",
  },
  {
    id: "fallback-burrata",
    handle: "artisan-burrata",
    title: "Artisan Burrata",
    description:
      "A creamy specialty cheese for premium menus, platters, and retail showcases.",
    longDescription:
      "Artisan burrata built for standout presentations. Its creamy center and delicate shell make it a fit for chef-driven menus, curated platters, and high-value retail displays.",
    image: null,
    price: "Request quote",
    amount: null,
    currencyCode: "",
    availableForSale: true,
    collectionHandles: ["all", "cheese", "specialty"],
    tags: ["burrata", "specialty", "chef"],
    featured: "Best suited for premium presentation-led dishes.",
    variantId: "fallback-variant-burrata",
  },
];

const SHOP_PAGE_QUERY = `#graphql
  query ShopPageData($first: Int!) {
    shop {
      name
      description
      primaryDomain {
        url
      }
    }
    collections(first: 12, sortKey: TITLE) {
      edges {
        node {
          id
          handle
          title
          description
        }
      }
    }
    products(first: $first, sortKey: BEST_SELLING) {
      edges {
        node {
          id
          handle
          title
          description
          availableForSale
          tags
          featuredImage {
            url
            altText
            width
            height
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          variants(first: 1) {
            edges {
              node {
                id
              }
            }
          }
          collections(first: 10) {
            edges {
              node {
                handle
              }
            }
          }
        }
      }
    }
  }
`;

const COLLECTION_PRODUCTS_QUERY = `#graphql
  query CollectionProducts($first: Int!, $handle: String!) {
    shop {
      name
      description
      primaryDomain {
        url
      }
    }
    collections(first: 12, sortKey: TITLE) {
      edges {
        node {
          id
          handle
          title
          description
        }
      }
    }
    collection(handle: $handle) {
      id
      handle
      title
      description
      products(first: $first, sortKey: BEST_SELLING) {
        edges {
          node {
            id
            handle
            title
            description
            availableForSale
            tags
            featuredImage {
              url
              altText
              width
              height
            }
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            variants(first: 1) {
              edges {
                node {
                  id
                }
              }
            }
            collections(first: 10) {
              edges {
                node {
                  handle
                }
              }
            }
          }
        }
      }
    }
  }
`;

const PRODUCT_QUERY = `#graphql
  query ProductPageData($handle: String!) {
    shop {
      name
      primaryDomain {
        url
      }
    }
    product(handle: $handle) {
      id
      handle
      title
      description
      tags
      availableForSale
      featuredImage {
        url
        altText
        width
        height
      }
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      variants(first: 1) {
        edges {
          node {
            id
            title
          }
        }
      }
      collections(first: 10) {
        edges {
          node {
            handle
            title
          }
        }
      }
    }
  }
`;

const CART_QUERY = `#graphql
  query CartData($cartId: ID!) {
    cart(id: $cartId) {
      id
      checkoutUrl
      totalQuantity
      cost {
        subtotalAmount {
          amount
          currencyCode
        }
      }
      lines(first: 20) {
        edges {
          node {
            id
            quantity
            merchandise {
              ... on ProductVariant {
                id
                title
                product {
                  handle
                  title
                  featuredImage {
                    url
                    altText
                    width
                    height
                  }
                }
                price {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
    }
  }
`;

const CART_CREATE_MUTATION = `#graphql
  mutation CartCreate($lines: [CartLineInput!]) {
    cartCreate(input: { lines: $lines }) {
      cart {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const CART_LINES_ADD_MUTATION = `#graphql
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const CART_LINES_REMOVE_MUTATION = `#graphql
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`;

function getShopifyConfig() {
  const storeDomain =
    process.env.SHOPIFY_STORE_DOMAIN || process.env.PUBLIC_STORE_DOMAIN;
  const storefrontToken =
    process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN ||
    process.env.PUBLIC_STOREFRONT_API_TOKEN;
  const apiVersion =
    process.env.SHOPIFY_STOREFRONT_API_VERSION || DEFAULT_API_VERSION;

  return {
    apiVersion,
    isConfigured: Boolean(storeDomain && storefrontToken),
    storeDomain,
    storefrontToken,
  };
}

function formatMoney(amount, currencyCode) {
  if (!amount || !currencyCode) {
    return "Request quote";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
  }).format(Number(amount));
}

function normalizeCollection(collection) {
  return {
    id: collection.id,
    handle: collection.handle,
    title: collection.title,
    description: collection.description || "",
  };
}

function normalizeProduct(node) {
  const amount = node.priceRange?.minVariantPrice?.amount || null;
  const currencyCode = node.priceRange?.minVariantPrice?.currencyCode || "";

  return {
    id: node.id,
    handle: node.handle,
    title: node.title,
    description: node.description,
    longDescription: node.description,
    availableForSale: node.availableForSale,
    image: node.featuredImage
      ? {
          url: node.featuredImage.url,
          altText: node.featuredImage.altText || node.title,
          width: node.featuredImage.width || 800,
          height: node.featuredImage.height || 800,
        }
      : null,
    price: formatMoney(amount, currencyCode),
    amount,
    currencyCode,
    tags: node.tags || [],
    collectionHandles:
      node.collections?.edges?.map(({ node: collection }) => collection.handle) || [],
    featured: node.tags?.slice(0, 2).join(" | ") || "Shopify storefront item",
    variantId: node.variants?.edges?.[0]?.node?.id || null,
  };
}

async function storefrontRequest(query, variables = {}, cacheOptions = {}) {
  const config = getShopifyConfig();

  if (!config.isConfigured) {
    throw new Error("Shopify storefront is not configured.");
  }

  const response = await fetch(
    `https://${config.storeDomain}/api/${config.apiVersion}/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": config.storefrontToken,
      },
      body: JSON.stringify({ query, variables }),
      ...cacheOptions,
    }
  );

  const payload = await response.json();

  if (!response.ok || payload.errors) {
    throw new Error(
      payload.errors?.[0]?.message || "Unable to reach Shopify storefront."
    );
  }

  return payload.data;
}

function getFallbackCollections() {
  return FALLBACK_COLLECTIONS;
}

function getFallbackProducts(collectionHandle = "all") {
  if (!collectionHandle || collectionHandle === "all") {
    return FALLBACK_PRODUCTS;
  }

  return FALLBACK_PRODUCTS.filter((product) =>
    product.collectionHandles.includes(collectionHandle)
  );
}

function normalizeCart(cart) {
  if (!cart) {
    return {
      id: null,
      checkoutUrl: null,
      totalQuantity: 0,
      subtotal: null,
      lines: [],
    };
  }

  return {
    id: cart.id,
    checkoutUrl: cart.checkoutUrl,
    totalQuantity: cart.totalQuantity || 0,
    subtotal: cart.cost?.subtotalAmount
      ? formatMoney(
          cart.cost.subtotalAmount.amount,
          cart.cost.subtotalAmount.currencyCode
        )
      : null,
    lines:
      cart.lines?.edges?.map(({ node }) => ({
        id: node.id,
        quantity: node.quantity,
        merchandiseId: node.merchandise?.id || null,
        productHandle: node.merchandise?.product?.handle || "",
        title: node.merchandise?.product?.title || "Cart item",
        variantTitle: node.merchandise?.title || "",
        price: formatMoney(
          node.merchandise?.price?.amount,
          node.merchandise?.price?.currencyCode
        ),
        image: node.merchandise?.product?.featuredImage
          ? {
              url: node.merchandise.product.featuredImage.url,
              altText:
                node.merchandise.product.featuredImage.altText ||
                node.merchandise.product.title,
              width: node.merchandise.product.featuredImage.width || 320,
              height: node.merchandise.product.featuredImage.height || 320,
            }
          : null,
      })) || [],
  };
}

export async function getShopPageData({ first = 6, collectionHandle = "all" } = {}) {
  const config = getShopifyConfig();

  if (!config.isConfigured) {
    const collections = getFallbackCollections();
    return {
      isConfigured: false,
      shop: null,
      error: null,
      collections,
      activeCollection:
        collections.find((collection) => collection.handle === collectionHandle) ||
        collections[0],
      products: getFallbackProducts(collectionHandle),
    };
  }

  try {
    const data =
      collectionHandle && collectionHandle !== "all"
        ? await storefrontRequest(
            COLLECTION_PRODUCTS_QUERY,
            { first, handle: collectionHandle },
            { next: { revalidate: 300 } }
          )
        : await storefrontRequest(
            SHOP_PAGE_QUERY,
            { first },
            { next: { revalidate: 300 } }
          );

    const collections = [
      { id: "all", handle: "all", title: "All products", description: "" },
      ...data.collections.edges.map(({ node }) => normalizeCollection(node)),
    ];
    const selectedCollection = data.collection
      ? normalizeCollection(data.collection)
      : null;
    const productEdges =
      selectedCollection?.handle && collectionHandle !== "all"
        ? data.collection.products.edges
        : data.products.edges;

    return {
      isConfigured: true,
      shop: data.shop,
      error: null,
      collections,
      activeCollection:
        selectedCollection ||
        collections.find((collection) => collection.handle === collectionHandle) ||
        collections[0],
      products: productEdges.map(({ node }) => normalizeProduct(node)),
    };
  } catch (error) {
    const collections = getFallbackCollections();
    return {
      isConfigured: true,
      shop: null,
      error:
        error instanceof Error
          ? error.message
          : "Unable to load products from Shopify.",
      collections,
      activeCollection:
        collections.find((collection) => collection.handle === collectionHandle) ||
        collections[0],
      products: getFallbackProducts(collectionHandle),
    };
  }
}

export async function getProductByHandle(handle) {
  const config = getShopifyConfig();

  if (!config.isConfigured) {
    const product = FALLBACK_PRODUCTS.find((item) => item.handle === handle);
    return {
      isConfigured: false,
      shop: null,
      error: null,
      product: product || null,
    };
  }

  try {
    const data = await storefrontRequest(
      PRODUCT_QUERY,
      { handle },
      { next: { revalidate: 300 } }
    );

    return {
      isConfigured: true,
      shop: data.shop,
      error: null,
      product: data.product ? normalizeProduct(data.product) : null,
    };
  } catch (error) {
    const product = FALLBACK_PRODUCTS.find((item) => item.handle === handle);
    return {
      isConfigured: true,
      shop: null,
      error:
        error instanceof Error
          ? error.message
          : "Unable to load the product from Shopify.",
      product: product || null,
    };
  }
}

export function getFallbackProduct(handle) {
  return FALLBACK_PRODUCTS.find((item) => item.handle === handle) || null;
}

export function getFallbackCart(cookieValue) {
  if (!cookieValue) {
    return {
      id: "preview-cart",
      checkoutUrl: null,
      totalQuantity: 0,
      subtotal: null,
      lines: [],
    };
  }

  try {
    const parsed = JSON.parse(cookieValue);
    return {
      id: "preview-cart",
      checkoutUrl: null,
      totalQuantity: parsed.totalQuantity || 0,
      subtotal: parsed.subtotal || null,
      lines: parsed.lines || [],
    };
  } catch {
    return {
      id: "preview-cart",
      checkoutUrl: null,
      totalQuantity: 0,
      subtotal: null,
      lines: [],
    };
  }
}

export function serializeFallbackCart(cart) {
  return JSON.stringify({
    totalQuantity: cart.totalQuantity,
    subtotal: cart.subtotal,
    lines: cart.lines,
  });
}

export function buildFallbackCartItem(product, quantity = 1) {
  return {
    id: `preview-${product.handle}`,
    quantity,
    merchandiseId: product.variantId,
    productHandle: product.handle,
    title: product.title,
    variantTitle: "Preview item",
    price: product.price,
    image: product.image,
  };
}

export async function getCart(cartId) {
  if (!cartId) {
    return normalizeCart(null);
  }

  const data = await storefrontRequest(
    CART_QUERY,
    { cartId },
    { cache: "no-store" }
  );
  return normalizeCart(data.cart);
}

export async function addLinesToCart({ cartId, lines }) {
  if (!cartId) {
    const created = await storefrontRequest(
      CART_CREATE_MUTATION,
      { lines },
      { cache: "no-store" }
    );
    const cartErrors = created.cartCreate.userErrors || [];
    if (cartErrors.length > 0) {
      throw new Error(cartErrors[0].message);
    }

    return created.cartCreate.cart.id;
  }

  const added = await storefrontRequest(
    CART_LINES_ADD_MUTATION,
    { cartId, lines },
    { cache: "no-store" }
  );
  const cartErrors = added.cartLinesAdd.userErrors || [];
  if (cartErrors.length > 0) {
    throw new Error(cartErrors[0].message);
  }

  return added.cartLinesAdd.cart.id;
}

export async function removeLinesFromCart({ cartId, lineIds }) {
  if (!cartId || lineIds.length === 0) {
    return cartId;
  }

  const removed = await storefrontRequest(
    CART_LINES_REMOVE_MUTATION,
    { cartId, lineIds },
    { cache: "no-store" }
  );
  const cartErrors = removed.cartLinesRemove.userErrors || [];
  if (cartErrors.length > 0) {
    throw new Error(cartErrors[0].message);
  }

  return removed.cartLinesRemove.cart.id;
}

export function getShopifySetup() {
  return getShopifyConfig();
}
