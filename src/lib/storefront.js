export const ENABLE_ONLINE_ORDERS =
  process.env.ENABLE_ONLINE_ORDERS?.toLowerCase() === "true";

export function getStorefrontMode() {
  return {
    enableOnlineOrders: ENABLE_ONLINE_ORDERS,
    isEnquiryOnly: !ENABLE_ONLINE_ORDERS,
  };
}
