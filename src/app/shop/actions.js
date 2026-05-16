"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  addLinesToCart,
  buildFallbackCartItem,
  getCart,
  getFallbackCart,
  getFallbackProduct,
  getProductByHandle,
  getShopifySetup,
  recalculateFallbackCart,
  removeLinesFromCart,
  serializeFallbackCart,
  updateCartLines,
} from "../../lib/shopify";
import { getStorefrontMode } from "../../lib/storefront";

const SHOPIFY_CART_COOKIE = "aurum_shopify_cart_id";
const PREVIEW_CART_COOKIE = "aurum_preview_cart";

function cookieOpts(maxAge = 60 * 60 * 24 * 7) {
  return { httpOnly: true, sameSite: "lax", path: "/", maxAge };
}

function appendStatus(path, status) {
  const url = new URL(path, "http://localhost");
  url.searchParams.set("cart", status);
  const search = url.searchParams.toString();
  return `${url.pathname}${search ? `?${search}` : ""}`;
}

function previewCartState(store) {
  return {
    isConfigured: false,
    cart: getFallbackCart(store.get(PREVIEW_CART_COOKIE)?.value),
  };
}

async function shopifyCartState(store) {
  const cartId = store.get(SHOPIFY_CART_COOKIE)?.value || null;
  const empty = { id: null, checkoutUrl: null, totalQuantity: 0, subtotal: null, subtotalAmount: null, lines: [] };
  if (!cartId) return { isConfigured: true, cart: empty };
  try {
    return { isConfigured: true, cart: await getCart(cartId) };
  } catch {
    return { isConfigured: true, cart: empty };
  }
}

// ─── Redirect-based actions (used by product card forms) ───

export async function addToCartAction(formData) {
  const handle = formData.get("handle");
  const variantId = formData.get("variantId");
  const redirectTo = formData.get("redirectTo") || "/shop";
  const quantity = Number(formData.get("quantity") || "1");
  const store = await cookies();
  const setup = getShopifySetup();
  const storefrontMode = getStorefrontMode();

  if (!handle) {
    redirect(appendStatus(redirectTo, "missing-product"));
  }

  if (!setup.isConfigured || storefrontMode.isEnquiryOnly) {
    const currentCart = getFallbackCart(store.get(PREVIEW_CART_COOKIE)?.value);
    const { product: liveProduct } =
      setup.isConfigured && storefrontMode.isEnquiryOnly
        ? await getProductByHandle(handle)
        : { product: null };
    const product = liveProduct || getFallbackProduct(handle);

    if (!product) {
      redirect(appendStatus(redirectTo, "missing-product"));
    }

    const existingLine = currentCart.lines.find(
      (line) => line.productHandle === product.handle
    );
    if (existingLine) {
      existingLine.quantity += quantity;
    } else {
      currentCart.lines.push(buildFallbackCartItem(product, quantity));
    }

    const nextCart = recalculateFallbackCart(currentCart);
    store.set(PREVIEW_CART_COOKIE, serializeFallbackCart(nextCart), cookieOpts());
    redirect(appendStatus(redirectTo, "preview-added"));
  }

  if (!variantId) {
    redirect(appendStatus(redirectTo, "missing-variant"));
  }

  let status = "error";
  try {
    const cartId = store.get(SHOPIFY_CART_COOKIE)?.value || null;
    const nextCartId = await addLinesToCart({
      cartId,
      lines: [{ merchandiseId: variantId, quantity }],
    });
    store.set(SHOPIFY_CART_COOKIE, nextCartId, cookieOpts(60 * 60 * 24 * 30));
    status = "added";
  } catch {
    status = "error";
  }

  redirect(appendStatus(redirectTo, status));
}

// ─── Return-based actions (used by CartPanel for instant UI updates) ───

export async function addToCart({ handle, variantId, quantity = 1, sellingPlanId = "" }) {
  const store = await cookies();
  const setup = getShopifySetup();
  const storefrontMode = getStorefrontMode();

  if (!handle) return { status: "missing-product", ...previewCartState(store) };

  if (!setup.isConfigured || storefrontMode.isEnquiryOnly) {
    const currentCart = getFallbackCart(store.get(PREVIEW_CART_COOKIE)?.value);
    const { product: liveProduct } =
      setup.isConfigured && storefrontMode.isEnquiryOnly
        ? await getProductByHandle(handle)
        : { product: null };
    const product = liveProduct || getFallbackProduct(handle);

    if (!product) return { status: "missing-product", ...previewCartState(store) };

    const existingLine = currentCart.lines.find(
      (line) => line.productHandle === product.handle
    );
    if (existingLine) {
      existingLine.quantity += quantity;
    } else {
      currentCart.lines.push(buildFallbackCartItem(product, quantity));
    }

    const nextCart = recalculateFallbackCart(currentCart);
    store.set(PREVIEW_CART_COOKIE, serializeFallbackCart(nextCart), cookieOpts());
    return { status: "added", isConfigured: false, cart: nextCart };
  }

  if (!variantId) return { status: "missing-variant", ...(await shopifyCartState(store)) };

  try {
    const cartId = store.get(SHOPIFY_CART_COOKIE)?.value || null;
    const nextCartId = await addLinesToCart({
      cartId,
      lines: [{ merchandiseId: variantId, quantity, sellingPlanId: sellingPlanId || undefined }],
    });
    store.set(SHOPIFY_CART_COOKIE, nextCartId, cookieOpts(60 * 60 * 24 * 30));
    return { status: "added", isConfigured: true, cart: await getCart(nextCartId) };
  } catch {
    return { status: "error", ...(await shopifyCartState(store)) };
  }
}

export async function removeFromCart({ lineId, handle }) {
  const store = await cookies();
  const setup = getShopifySetup();
  const storefrontMode = getStorefrontMode();

  if (!setup.isConfigured || storefrontMode.isEnquiryOnly) {
    const currentCart = getFallbackCart(store.get(PREVIEW_CART_COOKIE)?.value);
    currentCart.lines = currentCart.lines.filter(
      (line) => line.productHandle !== handle
    );
    const nextCart = recalculateFallbackCart(currentCart);

    if (nextCart.lines.length === 0) {
      store.delete(PREVIEW_CART_COOKIE);
    } else {
      store.set(PREVIEW_CART_COOKIE, serializeFallbackCart(nextCart), cookieOpts());
    }
    return { status: "removed", isConfigured: false, cart: nextCart };
  }

  if (!lineId) return { status: "missing-line", ...(await shopifyCartState(store)) };

  try {
    const cartId = store.get(SHOPIFY_CART_COOKIE)?.value || null;
    await removeLinesFromCart({ cartId, lineIds: [lineId] });
    return { status: "removed", ...(await shopifyCartState(store)) };
  } catch {
    return { status: "error", ...(await shopifyCartState(store)) };
  }
}

export async function decreaseCartQuantity({ lineId, handle, currentQuantity }) {
  const store = await cookies();
  const setup = getShopifySetup();
  const storefrontMode = getStorefrontMode();

  if (!setup.isConfigured || storefrontMode.isEnquiryOnly) {
    const currentCart = getFallbackCart(store.get(PREVIEW_CART_COOKIE)?.value);
    const line = currentCart.lines.find((l) => l.productHandle === handle);

    if (line) {
      line.quantity -= 1;
      if (line.quantity <= 0) {
        currentCart.lines = currentCart.lines.filter((l) => l.productHandle !== handle);
      }
    }

    const nextCart = recalculateFallbackCart(currentCart);
    if (nextCart.lines.length === 0) {
      store.delete(PREVIEW_CART_COOKIE);
    } else {
      store.set(PREVIEW_CART_COOKIE, serializeFallbackCart(nextCart), cookieOpts());
    }
    return { status: "updated", isConfigured: false, cart: nextCart };
  }

  if (!lineId) return { status: "missing-line", ...(await shopifyCartState(store)) };

  try {
    const cartId = store.get(SHOPIFY_CART_COOKIE)?.value || null;
    const newQty = (currentQuantity || 1) - 1;

    if (newQty <= 0) {
      await removeLinesFromCart({ cartId, lineIds: [lineId] });
    } else {
      await updateCartLines({ cartId, lines: [{ id: lineId, quantity: newQty }] });
    }
    return { status: "updated", ...(await shopifyCartState(store)) };
  } catch {
    return { status: "error", ...(await shopifyCartState(store)) };
  }
}

export async function getCartState() {
  const store = await cookies();
  const setup = getShopifySetup();
  const storefrontMode = getStorefrontMode();

  if (!setup.isConfigured || storefrontMode.isEnquiryOnly) {
    return previewCartState(store);
  }
  return shopifyCartState(store);
}
