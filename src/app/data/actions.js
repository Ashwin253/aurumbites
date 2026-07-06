"use server";

import { cookies } from "next/headers";
import { supabase } from "../../lib/supabase";
import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

async function getSupabaseClient() {
  const cookieStore = await cookies();
  const token = cookieStore.get("sb-access-token")?.value;
  
  if (token) {
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }
    );
  }
  return supabase;
}

export async function getAuthUser() {
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

  const client = await getSupabaseClient();
  const { data, error } = await client
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

  const client = await getSupabaseClient();
  const { data, error } = await client
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

export async function getTeamMembers() {
  const user = await getAuthUser();
  if (!user) return [];

  const client = await getSupabaseClient();
  const { data, error } = await client
    .from("team_members")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching team members:", error);
    return [];
  }
  return data;
}

export async function deleteTeammate(id) {
  const user = await getAuthUser();
  if (!user) return { error: "Unauthorized" };

  const client = await getSupabaseClient();
  const { error } = await client
    .from("team_members")
    .delete()
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/data");
  return { success: true };
}

export async function getAllowedEmails() {
  const user = await getAuthUser();
  if (!user) return [];

  const client = await getSupabaseClient();
  const { data, error } = await client
    .from("allowed_emails")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching allowed emails:", error);
    return [];
  }
  return data;
}

export async function addAllowedEmail(email) {
  const user = await getAuthUser();
  if (!user) return { error: "Unauthorized" };

  if (!email || !email.trim()) {
    return { error: "Email is required" };
  }

  const client = await getSupabaseClient();
  const { data, error } = await client
    .from("allowed_emails")
    .insert([{ email: email.toLowerCase().trim() }])
    .select();

  if (error) {
    if (error.code === "23505") {
      return { error: "This email is already whitelisted." };
    }
    return { error: error.message };
  }

  revalidatePath("/data");
  return { success: true, data: data[0] };
}

export async function deleteAllowedEmail(id) {
  const user = await getAuthUser();
  if (!user) return { error: "Unauthorized" };

  const client = await getSupabaseClient();
  const { error } = await client
    .from("allowed_emails")
    .delete()
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/data");
  return { success: true };
}

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete("sb-access-token");
  cookieStore.delete("sb-refresh-token");

  try {
    const client = await getSupabaseClient();
    await client.auth.signOut();
  } catch (e) {
    console.error("Sign out error:", e);
  }

  revalidatePath("/");
  return { success: true };
}

export async function registerTeammateDirect(formData) {
  const email = formData.get("email");
  const password = formData.get("password");
  const name = formData.get("name") || "";

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  // Check if the email is allowed via the RPC function
  const { data: isAllowed, error: rpcError } = await supabase.rpc("is_email_allowed", {
    check_email: email.toLowerCase().trim()
  });

  if (rpcError) {
    console.error("Error checking whitelist:", rpcError);
    return { error: "Error verifying registration permissions. Please make sure the Supabase database functions are correctly configured." };
  }

  if (!isAllowed) {
    return { error: "This email is not authorized to register. Only whitelisted emails can create an account." };
  }

  // Register user in Supabase Auth (store name in metadata)
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name
      }
    }
  });

  if (signUpError) {
    return { error: signUpError.message };
  }

  if (!signUpData?.user) {
    return { error: "Failed to create user in Auth system" };
  }

  return { success: true, session: signUpData.session };
}

export async function getOffers() {
  try {
    const { data, error } = await supabase
      .from("offers")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Table public.offers might not exist yet:", error.message);
      return [];
    }
    return data || [];
  } catch (e) {
    console.error("Failed to fetch offers", e);
    return [];
  }
}

export async function addOffer(formData) {
  const description = formData.get("description");
  const code = formData.get("code") || null;
  const type = formData.get("type"); // 'product', 'brand', 'category', 'volume'
  const target_id = formData.get("target_id");
  const discount_type = formData.get("discount_type"); // 'percent', 'amount', 'volume_price'
  const discount_value = parseFloat(formData.get("discount_value")) || 0;
  const min_qty = parseInt(formData.get("min_qty")) || null;

  if (!description || !type || !target_id || !discount_type) {
    return { error: "Missing required fields for offer" };
  }

  const { data, error } = await supabase
    .from("offers")
    .insert([{
      description,
      code,
      type,
      target_id,
      discount_type,
      discount_value,
      min_qty
    }])
    .select();

  if (error) {
    console.error("Failed to add offer:", error);
    return { error: error.message };
  }

  revalidatePath("/data");
  return { success: true, offer: data?.[0] };
}

export async function deleteOffer(id) {
  const { error } = await supabase
    .from("offers")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Failed to delete offer:", error);
    return { error: error.message };
  }

  revalidatePath("/data");
  return { success: true };
}

export async function toggleProductArchive(id, isArchived) {
  const user = await getAuthUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("products")
    .update({ is_archived: isArchived })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/shop");
  revalidatePath("/data");
  return { success: true };
}

export async function toggleCategoryArchive(id, isArchived) {
  const user = await getAuthUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("categories")
    .update({ is_archived: isArchived })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/shop");
  revalidatePath("/data");
  return { success: true };
}

export async function toggleBrandArchive(id, isArchived) {
  const user = await getAuthUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("brands")
    .update({ is_archived: isArchived })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/shop");
  revalidatePath("/data");
  return { success: true };
}

export async function updateProductVariants(productId, updatedVariants) {
  const user = await getAuthUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const client = await getSupabaseClient();
  const { error } = await client
    .from("products")
    .update({ variants: updatedVariants })
    .eq("id", productId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/data");
  revalidatePath("/shop");
  return { success: true };
}

export async function addOfflineOrder(orderData) {
  const user = await getAuthUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const { customer_name, customer_email, customer_phone, items, total_amount, payment_id } = orderData;

  const client = await getSupabaseClient();

  // 1. Insert order
  const { data: orderResult, error: orderError } = await client
    .from("orders")
    .insert([
      {
        customer_name: customer_name || "Offline Guest",
        customer_email: customer_email || "offline@aurumbites.co.in",
        customer_phone: customer_phone || "",
        order_items: items.map(i => ({
          id: i.product_id,
          title: i.title,
          variantId: i.variant_id,
          variantTitle: i.variantTitle,
          price: parseFloat(i.price) || 0,
          quantity: parseInt(i.quantity, 10) || 1
        })),
        total_amount: parseFloat(total_amount) || 0,
        payment_provider: "Offline / CRM",
        payment_id: payment_id || `OFF-${Date.now()}`,
        payment_status: "paid"
      }
    ])
    .select();

  if (orderError) {
    return { success: false, error: orderError.message };
  }

  // 2. Deduct inventory for each item
  for (const item of items) {
    const { data: productData, error: fetchError } = await client
      .from("products")
      .select("variants")
      .eq("id", item.product_id)
      .single();

    if (!fetchError && productData?.variants) {
      let variants = productData.variants;
      let updated = false;
      variants = variants.map(v => {
        if (v.id === item.variant_id) {
          if (v.stock !== null && !isNaN(v.stock)) {
            v.stock = Math.max(0, v.stock - item.quantity);
            // Update availability based on stock
            v.availableForSale = v.callForInventory || v.stock > 0;
            updated = true;
          }
        }
        return v;
      });

      if (updated) {
        await client
          .from("products")
          .update({ variants })
          .eq("id", item.product_id);
      }
    }
  }

  revalidatePath("/data");
  revalidatePath("/shop");
  return { success: true, order: orderResult ? orderResult[0] : null };
}

