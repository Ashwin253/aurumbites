export const ENABLE_ONLINE_ORDERS = false;

export function getStorefrontMode() {
  return {
    enableOnlineOrders: ENABLE_ONLINE_ORDERS,
    isEnquiryOnly: true,
  };
}
