const DEFAULT_SUBSCRIPTION_URL = process.env.NEXT_PUBLIC_SHOPIFY_SUBSCRIPTION_URL || "";
const DEFAULT_SUBSCRIPTION_URL_TEMPLATE =
  process.env.NEXT_PUBLIC_SHOPIFY_SUBSCRIPTION_URL_TEMPLATE || "";
const DEFAULT_SUBSCRIPTION_MANAGEMENT_URL =
  process.env.NEXT_PUBLIC_SHOPIFY_SUBSCRIPTION_MANAGEMENT_URL || "";

export function getSubscriptionUrl({
  handle,
  variantId = "",
  quantity = 1,
} = {}) {
  const template = DEFAULT_SUBSCRIPTION_URL_TEMPLATE || DEFAULT_SUBSCRIPTION_URL;

  if (!template) {
    return null;
  }

  const url = template
    .replaceAll("{handle}", encodeURIComponent(handle || ""))
    .replaceAll("{variantId}", encodeURIComponent(variantId || ""))
    .replaceAll("{quantity}", encodeURIComponent(String(quantity || 1)));

  try {
    return new URL(url).toString();
  } catch {
    return url;
  }
}

export function getSubscriptionManagementUrl() {
  return DEFAULT_SUBSCRIPTION_MANAGEMENT_URL || null;
}
