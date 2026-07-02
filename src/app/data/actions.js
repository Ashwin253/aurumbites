"use server";

import { cookies } from "next/headers";
import { supabase } from "../../lib/supabase";
import { revalidatePath } from "next/cache";

async function getAuthUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("sb-access-token")?.value;
  if (!token) return null;

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return null;
    return user;
  } catch (e) {
    return null;
  }
}

async function uploadImage(imageFile) {
  if (!imageFile || imageFile.size === 0) return null;
  try {
    const fileExt = imageFile.name.split('.').pop() || 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const buffer = await imageFile.arrayBuffer();
    
    const { error } = await supabase.storage
      .from('images')
      .upload(fileName, buffer, {
        contentType: imageFile.type,
        upsert: false
      });
      
    if (error) {
      console.error("Upload error:", error);
      return null;
    }
    
    const { data: publicUrlData } = supabase.storage.from('images').getPublicUrl(fileName);
    return publicUrlData.publicUrl;
  } catch (err) {
    console.error("Failed to upload image", err);
    return null;
  }
}

export async function getInventory() {
  const user = await getAuthUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching inventory:", error);
    return [];
  }
  return data;
}

export async function getMessages() {
  const user = await getAuthUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching messages:", error);
    return [];
  }
  return data;
}

export async function addProduct(formData) {
  const user = await getAuthUser();
  if (!user) return { error: "Unauthorized" };

  const handle = formData.get("handle");
  const title = formData.get("title");
  const vendor = formData.get("vendor");
  const productType = formData.get("productType");
  const description = formData.get("description");
  const ingredients = formData.get("ingredients") || "";
  const variantsData = formData.get("variantsData");
  const nutritionData = formData.get("nutritionData");
  const imageFiles = formData.getAll("imageFile");

  let images = [];
  let imageUrl = null;
  
  for (const file of imageFiles) {
    if (file && file.size > 0) {
      const url = await uploadImage(file);
      if (url) {
        images.push(url);
      }
    }
  }

  if (images.length > 0) {
    imageUrl = images[0]; // Keep primary image for backward compatibility
  }

  let parsedVariants = [];
  try {
     const rawVars = JSON.parse(variantsData || "[]");
      parsedVariants = rawVars.map((v, i) => {
        const stockRaw = v.stock;
        const stock = (stockRaw === "" || stockRaw === null || stockRaw === undefined) ? null : parseInt(stockRaw, 10);
        const callForInventory = !!v.callForInventory;
        const availableForSale = callForInventory || stock === null || isNaN(stock) || stock > 0;
        return {
           id: `var-${Date.now()}-${i}`,
           title: v.weight === "Custom" ? v.customWeight : v.weight,
           unit: v.unit || "g",
           price: { amount: parseFloat(v.sellingPrice || v.mrp) || 0, currencyCode: "INR" },
           compareAtPrice: (v.originalPrice || v.price) ? { amount: parseFloat(v.originalPrice || v.price), currencyCode: "INR" } : null,
           unitPrice: (v.sellingUnitPrice || v.unitPrice) ? { amount: parseFloat(v.sellingUnitPrice || v.unitPrice), currencyCode: "INR" } : null,
           originalUnitPrice: v.originalUnitPrice ? { amount: parseFloat(v.originalUnitPrice), currencyCode: "INR" } : null,
           availableForSale,
           askPrice: v.askPrice || false,
           stock: stock,
           callForInventory
        };
      });
  } catch (e) {
     console.error("Failed to parse variants", e);
  }

  const price = parsedVariants.length > 0 ? parsedVariants[0].price.amount : 0;
  const productAvailableForSale = parsedVariants.length === 0 || parsedVariants.some(v => v.availableForSale);

  // Auto-create category if it doesn't exist
  if (productType && productType.trim() !== "") {
    const categoryHandle = productType.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');
    const { data: existingCat } = await supabase.from("categories").select("id").eq("handle", categoryHandle).maybeSingle();
    if (!existingCat) {
      await supabase.from("categories").insert([{
        title: productType.trim(),
        handle: categoryHandle,
        image_url: null
      }]);
    }
  }

  // Auto-create brand if it doesn't exist
  if (vendor && vendor.trim() !== "") {
    const brandHandle = vendor.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');
    const { data: existingBrand } = await supabase.from("brands").select("id").eq("handle", brandHandle).maybeSingle();
    if (!existingBrand) {
      await supabase.from("brands").insert([{
        title: vendor.trim(),
        handle: brandHandle,
        image_url: null
      }]);
    }
  }

  let parsedNutrition = null;
  try {
    const raw = formData.get("nutritionData");
    if (raw) parsedNutrition = JSON.parse(raw);
  } catch {}

  let parsedFaq = null;
  try {
    const raw = formData.get("faqData");
    if (raw) parsedFaq = JSON.parse(raw);
  } catch {}

  const { error } = await supabase.from("products").insert([
    {
      handle,
      title,
      vendor,
      productType,
      price,
      image_url: imageUrl,
      images,
      descriptionHtml: description ? `<p>${description}</p>` : "",
      ingredients,
      availableForSale: productAvailableForSale,
      variants: parsedVariants,
      nutrition: parsedNutrition,
      faq: parsedFaq,
    },
  ]);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/shop");
  revalidatePath("/data");
  return { success: true };
}

export async function deleteProduct(id) {
  const user = await getAuthUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) {
    return { error: error.message };
  }
  revalidatePath("/shop");
  revalidatePath("/data");
  return { success: true };
}

export async function updateProduct(id, formData) {
  const user = await getAuthUser();
  if (!user) return { error: "Unauthorized" };

  const handle = formData.get("handle");
  const title = formData.get("title");
  const vendor = formData.get("vendor");
  const productType = formData.get("productType");
  const description = formData.get("description");
  const ingredients = formData.get("ingredients") || "";
  const variantsData = formData.get("variantsData");
  const nutritionData = formData.get("nutritionData");
  const existingImagesData = formData.get("existingImages");
  const imageFiles = formData.getAll("imageFile");

  let existingImages = [];
  try {
    existingImages = JSON.parse(existingImagesData || "[]");
  } catch (e) {
    console.error("Failed to parse existing images", e);
  }

  let newImages = [];
  for (const file of imageFiles) {
    if (file && file.size > 0) {
      const url = await uploadImage(file);
      if (url) {
        newImages.push(url);
      }
    }
  }

  const images = [...existingImages, ...newImages];
  const imageUrl = images.length > 0 ? images[0] : null;

  let parsedVariants = [];
  try {
     const rawVars = JSON.parse(variantsData || "[]");
      parsedVariants = rawVars.map((v, i) => {
        const stockRaw = v.stock;
        const stock = (stockRaw === "" || stockRaw === null || stockRaw === undefined) ? null : parseInt(stockRaw, 10);
        const callForInventory = !!v.callForInventory;
        const availableForSale = callForInventory || stock === null || isNaN(stock) || stock > 0;
        return {
           id: v.id || `var-${Date.now()}-${i}`,
           title: v.weight === "Custom" ? v.customWeight : v.weight,
           unit: v.unit || "g",
           price: { amount: parseFloat(v.sellingPrice || v.mrp) || 0, currencyCode: "INR" },
           compareAtPrice: (v.originalPrice || v.price) ? { amount: parseFloat(v.originalPrice || v.price), currencyCode: "INR" } : null,
           unitPrice: (v.sellingUnitPrice || v.unitPrice) ? { amount: parseFloat(v.sellingUnitPrice || v.unitPrice), currencyCode: "INR" } : null,
           originalUnitPrice: v.originalUnitPrice ? { amount: parseFloat(v.originalUnitPrice), currencyCode: "INR" } : null,
           availableForSale,
           askPrice: v.askPrice || false,
           stock: stock,
           callForInventory
        };
      });
  } catch (e) {
     console.error("Failed to parse variants", e);
  }

  const price = parsedVariants.length > 0 ? parsedVariants[0].price.amount : 0;
  const productAvailableForSale = parsedVariants.length === 0 || parsedVariants.some(v => v.availableForSale);

  // Auto-create category if it doesn't exist
  if (productType && productType.trim() !== "") {
    const categoryHandle = productType.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');
    const { data: existingCat } = await supabase.from("categories").select("id").eq("handle", categoryHandle).maybeSingle();
    if (!existingCat) {
      await supabase.from("categories").insert([{
        title: productType.trim(),
        handle: categoryHandle,
        image_url: null
      }]);
    }
  }

  // Auto-create brand if it doesn't exist
  if (vendor && vendor.trim() !== "") {
    const brandHandle = vendor.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');
    const { data: existingBrand } = await supabase.from("brands").select("id").eq("handle", brandHandle).maybeSingle();
    if (!existingBrand) {
      await supabase.from("brands").insert([{
        title: vendor.trim(),
        handle: brandHandle,
        image_url: null
      }]);
    }
  }

  let parsedNutrition = null;
  try {
    const raw = formData.get("nutritionData");
    if (raw) parsedNutrition = JSON.parse(raw);
  } catch {}

  let parsedFaq = null;
  try {
    const raw = formData.get("faqData");
    if (raw) parsedFaq = JSON.parse(raw);
  } catch {}

  const { error } = await supabase.from("products").update({
    handle,
    title,
    vendor,
    productType,
    price,
    image_url: imageUrl,
    images,
    descriptionHtml: description ? `<p>${description}</p>` : "",
    ingredients,
    variants: parsedVariants,
    availableForSale: productAvailableForSale,
    nutrition: parsedNutrition,
    faq: parsedFaq,
  }).eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/shop");
  revalidatePath("/data");
  return { success: true };
}

export async function updateMessageStatus(id, status) {
  const user = await getAuthUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("contact_messages")
    .update({ status })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }
  revalidatePath("/data");
  return { success: true };
}

export async function getCategories() {
  const user = await getAuthUser();
  if (!user) return [];

  const { data, error } = await supabase.from("categories").select("*").order("created_at", { ascending: false });
  if (error) { console.error("Error fetching categories:", error); return []; }
  return data;
}

export async function addCategory(formData) {
  const user = await getAuthUser();
  if (!user) return { error: "Unauthorized" };

  const title = formData.get("title");
  const handle = formData.get("handle");
  const imageFile = formData.get("imageFile");

  let imageUrl = null;
  if (imageFile && imageFile.size > 0) {
    imageUrl = await uploadImage(imageFile);
  }

  const { error } = await supabase.from("categories").insert([{ title, handle, image_url: imageUrl }]);
  if (error) return { error: error.message };

  revalidatePath("/shop");
  revalidatePath("/data");
  return { success: true };
}

export async function deleteCategory(id) {
  const user = await getAuthUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/shop");
  revalidatePath("/data");
  return { success: true };
}

export async function getBrands() {
  const user = await getAuthUser();
  if (!user) return [];

  const { data, error } = await supabase.from("brands").select("*").order("created_at", { ascending: false });
  if (error) { console.error("Error fetching brands:", error); return []; }
  return data;
}

export async function addBrand(formData) {
  const user = await getAuthUser();
  if (!user) return { error: "Unauthorized" };

  const title = formData.get("title");
  const handle = formData.get("handle");
  const imageFile = formData.get("imageFile");

  let imageUrl = null;
  if (imageFile && imageFile.size > 0) {
    imageUrl = await uploadImage(imageFile);
  }

  const { error } = await supabase.from("brands").insert([{ title, handle, image_url: imageUrl }]);
  if (error) return { error: error.message };

  revalidatePath("/shop");
  revalidatePath("/data");
  return { success: true };
}

export async function updateBrand(id, formData) {
  const user = await getAuthUser();
  if (!user) return { error: "Unauthorized" };

  const title = formData.get("title");
  const handle = formData.get("handle");
  const imageFile = formData.get("imageFile");
  const existingImageUrl = formData.get("existingImageUrl");

  let imageUrl = existingImageUrl || null;
  if (imageFile && imageFile.size > 0) {
    imageUrl = await uploadImage(imageFile);
  }

  const { error } = await supabase
    .from("brands")
    .update({ title, handle, image_url: imageUrl })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/shop");
  revalidatePath("/data");
  return { success: true };
}

export async function deleteBrand(id) {
  const user = await getAuthUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase.from("brands").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/shop");
  revalidatePath("/data");
  return { success: true };
}

export async function getOrders() {
  const user = await getAuthUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
  return data;
}

export async function toggleTopProduct(productId, isTop) {
  const user = await getAuthUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const { error } = await supabase
    .from("products")
    .update({ is_top_searched: isTop })
    .eq("id", productId);

  if (error) {
    console.error("Error toggling top product status:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/shop");
  revalidatePath("/data");
  return { success: true };
}
