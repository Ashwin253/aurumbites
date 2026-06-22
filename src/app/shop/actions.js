"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getProductByHandle } from "../../lib/catalog";

const CART_COOKIE = "aurum_cart";

function cookieOpts(maxAge = 60 * 60 * 24 * 7) {
  return { httpOnly: true, sameSite: "lax", path: "/", maxAge };
}

function appendStatus(path, status) {
  const url = new URL(path, "http://localhost");
  url.searchParams.set("cart", status);
  const search = url.searchParams.toString();
  return `${url.pathname}${search ? `?${search}` : ""}`;
}

function getCart(store) {
  const cookieValue = store.get(CART_COOKIE)?.value;
  if (!cookieValue) return { totalQuantity: 0, subtotal: null, subtotalAmount: null, lines: [] };
  try {
    return JSON.parse(cookieValue);
  } catch {
    return { totalQuantity: 0, subtotal: null, subtotalAmount: null, lines: [] };
  }
}

function saveCart(store, cart) {
  if (cart.lines.length === 0) {
    store.delete(CART_COOKIE);
  } else {
    store.set(CART_COOKIE, JSON.stringify(cart), cookieOpts());
  }
}

function buildCartItem(product, quantity) {
  return {
    id: `line-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    productHandle: product.handle,
    title: product.title,
    quantity,
    price: product.price,
    variantTitle: product.variants?.[0]?.title || "Default Title",
    image: product.image
  };
}

function recalculateCart(cart) {
  cart.totalQuantity = cart.lines.reduce((sum, line) => sum + line.quantity, 0);
  let totalAmount = 0;
  cart.lines.forEach(line => {
    if (line.price) {
      const priceNum = parseFloat(line.price.replace(/[^\d.]/g, ''));
      if (!isNaN(priceNum)) {
        totalAmount += priceNum * line.quantity;
      }
    }
  });
  cart.subtotalAmount = totalAmount;
  cart.subtotal = totalAmount > 0 ? `₹${totalAmount.toFixed(2)}` : null;
  return cart;
}

export async function getCartState() {
  const store = await cookies();
  return { isConfigured: false, cart: getCart(store) };
}

export async function addToCartAction(formData) {
  const handle = formData.get("handle");
  const redirectTo = formData.get("redirectTo") || "/shop";
  const quantity = Number(formData.get("quantity") || "1");
  const store = await cookies();

  if (!handle) redirect(appendStatus(redirectTo, "missing-product"));

  const { product } = await getProductByHandle(handle);
  if (!product) redirect(appendStatus(redirectTo, "missing-product"));

  const cart = getCart(store);
  const existingLine = cart.lines.find(line => line.productHandle === product.handle);
  if (existingLine) {
    existingLine.quantity += quantity;
  } else {
    cart.lines.push(buildCartItem(product, quantity));
  }

  saveCart(store, recalculateCart(cart));
  redirect(appendStatus(redirectTo, "added"));
}

export async function addToCart({ handle, quantity = 1 }) {
  const store = await cookies();
  if (!handle) return { status: "missing-product", cart: getCart(store) };

  const { product } = await getProductByHandle(handle);
  if (!product) return { status: "missing-product", cart: getCart(store) };

  const cart = getCart(store);
  const existingLine = cart.lines.find(line => line.productHandle === product.handle);
  if (existingLine) {
    existingLine.quantity += quantity;
  } else {
    cart.lines.push(buildCartItem(product, quantity));
  }

  const nextCart = recalculateCart(cart);
  saveCart(store, nextCart);
  return { status: "added", isConfigured: false, cart: nextCart };
}

export async function removeFromCart({ handle, lineId }) {
  const store = await cookies();
  const cart = getCart(store);

  if (handle) {
    cart.lines = cart.lines.filter(line => line.productHandle !== handle);
  } else if (lineId) {
    cart.lines = cart.lines.filter(line => line.id !== lineId);
  }

  const nextCart = recalculateCart(cart);
  saveCart(store, nextCart);
  return { status: "removed", isConfigured: false, cart: nextCart };
}

export async function decreaseCartQuantity({ handle, lineId, currentQuantity }) {
  const store = await cookies();
  const cart = getCart(store);

  const line = cart.lines.find(l => (handle ? l.productHandle === handle : l.id === lineId));
  if (line) {
    line.quantity -= 1;
    if (line.quantity <= 0) {
      cart.lines = cart.lines.filter(l => l.id !== line.id);
    }
  }

  const nextCart = recalculateCart(cart);
  saveCart(store, nextCart);
  return { status: "updated", isConfigured: false, cart: nextCart };
}
