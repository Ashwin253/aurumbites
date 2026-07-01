export const ENABLE_ONLINE_ORDERS = process.env.NEXT_PUBLIC_ENABLE_ONLINE_ORDERS === 'true';

export function getStorefrontMode() {
  const mode = process.env.PAYMENT_GATEWAY_PROVIDER || "none";
  return {
    enableOnlineOrders: ENABLE_ONLINE_ORDERS && mode !== "none",
    isEnquiryOnly: !ENABLE_ONLINE_ORDERS || mode === "none",
    gatewayProvider: mode,
  };
}
