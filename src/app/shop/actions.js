"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  addLinesToCart,
  buildFallbackCartItem,
  getFallbackCart,
  getFallbackProduct,
  getShopifySetup,
  removeLinesFromCart,
  serializeFallbackCart,
} from "../../lib/shopify";

const SHOPIFY_CART_COOKIE = "aurum_shopify_cart_id";
const PREVIEW_CART_COOKIE = "aurum_preview_cart";

function appendStatus(path, status) {
  const url = new URL(path, "http://localhost");
  url.searchParams.set("cart", status);
  const search = url.searchParams.toString();
  return `${url.pathname}${search ? `?${search}` : ""}`;
}

export async function addToCartAction(formData) {
  const handle = formData.get("handle");
  const variantId = formData.get("variantId");
  const redirectTo = formData.get("redirectTo") || "/shop";
  const quantity = Number(formData.get("quantity") || "1");
  const store = await cookies();
  const setup = getShopifySetup();

  if (!handle) {
    redirect(appendStatus(redirectTo, "missing-product"));
  }

  if (!setup.isConfigured) {
    const product = getFallbackProduct(handle);
    const currentCart = getFallbackCart(store.get(PREVIEW_CART_COOKIE)?.value);

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

    currentCart.totalQuantity = currentCart.lines.reduce(
      (sum, line) => sum + line.quantity,
      0
    );

    store.set(PREVIEW_CART_COOKIE, serializeFallbackCart(currentCart), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    redirect(appendStatus(redirectTo, "preview-added"));
  }

  if (!variantId) {
    redirect(appendStatus(redirectTo, "missing-variant"));
  }

  try {
    const cartId = store.get(SHOPIFY_CART_COOKIE)?.value || null;
    const nextCartId = await addLinesToCart({
      cartId,
      lines: [{ merchandiseId: variantId, quantity }],
    });

    store.set(SHOPIFY_CART_COOKIE, nextCartId, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    redirect(appendStatus(redirectTo, "added"));
  } catch {
    redirect(appendStatus(redirectTo, "error"));
  }
}

export async function removeFromCartAction(formData) {
  const lineId = formData.get("lineId");
  const handle = formData.get("handle");
  const redirectTo = formData.get("redirectTo") || "/shop";
  const store = await cookies();
  const setup = getShopifySetup();

  if (!setup.isConfigured) {
    const currentCart = getFallbackCart(store.get(PREVIEW_CART_COOKIE)?.value);
    currentCart.lines = currentCart.lines.filter(
      (line) => line.productHandle !== handle
    );
    currentCart.totalQuantity = currentCart.lines.reduce(
      (sum, line) => sum + line.quantity,
      0
    );

    if (currentCart.lines.length === 0) {
      store.delete(PREVIEW_CART_COOKIE);
    } else {
      store.set(PREVIEW_CART_COOKIE, serializeFallbackCart(currentCart), {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    redirect(appendStatus(redirectTo, "preview-removed"));
  }

  if (!lineId) {
    redirect(appendStatus(redirectTo, "missing-line"));
  }

  try {
    const cartId = store.get(SHOPIFY_CART_COOKIE)?.value || null;
    await removeLinesFromCart({ cartId, lineIds: [lineId] });
    redirect(appendStatus(redirectTo, "removed"));
  } catch {
    redirect(appendStatus(redirectTo, "error"));
  }
}

export async function getCartState() {
  const store = await cookies();
  const setup = getShopifySetup();

  if (!setup.isConfigured) {
    return {
      isConfigured: false,
      cart: getFallbackCart(store.get(PREVIEW_CART_COOKIE)?.value),
    };
  }

  const cartId = store.get(SHOPIFY_CART_COOKIE)?.value || null;

  if (!cartId) {
    return {
      isConfigured: true,
      cart: {
        id: null,
        checkoutUrl: null,
        totalQuantity: 0,
        subtotal: null,
        lines: [],
      },
    };
  }

  try {
    const { getCart } = await import("../../lib/shopify");
    return {
      isConfigured: true,
      cart: await getCart(cartId),
    };
  } catch {
    return {
      isConfigured: true,
      cart: {
        id: null,
        checkoutUrl: null,
        totalQuantity: 0,
        subtotal: null,
        lines: [],
      },
    };
  }
}
