import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabase } from "../../../../lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      provider, 
      // Razorpay params
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      // Cashfree params
      cf_order_id,
      cf_payment_id
    } = body;

    const targetOrderId = razorpay_order_id || cf_order_id;
    if (!targetOrderId) {
      return NextResponse.json({ error: "Missing order transaction identifier." }, { status: 400 });
    }

    // 1. Fetch pending order details from Supabase
    const { data: order, error: orderFetchError } = await supabase
      .from("orders")
      .select("*")
      .eq("payment_id", targetOrderId)
      .maybeSingle();

    if (orderFetchError || !order) {
      return NextResponse.json({ error: "Order record not found." }, { status: 404 });
    }

    // If order is already processed, return success immediately to prevent double stock deduction
    if (order.payment_status === "paid") {
      return NextResponse.json({ success: true, paymentId: order.payment_id });
    }

    let isVerified = false;
    let paymentGatewayId = "";

    // 2. Verify payment authenticity depending on provider
    if (provider === "razorpay") {
      const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;
      
      const hmac = crypto.createHmac("sha256", razorpayKeySecret);
      hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
      const generatedSignature = hmac.digest("hex");
      
      isVerified = generatedSignature === razorpay_signature;
      paymentGatewayId = razorpay_payment_id;

    } else if (provider === "cashfree") {
      const cfAppId = process.env.CASHFREE_APP_ID;
      const cfSecretKey = process.env.CASHFREE_SECRET_KEY;
      const cfEnv = process.env.CASHFREE_ENV || "sandbox";
      const cfBaseUrl = cfEnv === "production" ? "https://api.cashfree.com/pg" : "https://sandbox.cashfree.com/pg";

      // Query Cashfree API to verify order status
      const response = await fetch(`${cfBaseUrl}/orders/${cf_order_id}`, {
        method: "GET",
        headers: {
          "x-client-id": cfAppId,
          "x-client-secret": cfSecretKey,
          "x-api-version": "2023-08-01"
        }
      });

      const orderData = await response.json();
      
      if (response.ok && orderData.order_status === "PAID") {
        isVerified = true;
        paymentGatewayId = cf_payment_id || orderData.cf_order_id || cf_order_id;
      }
    }

    if (!isVerified) {
      return NextResponse.json({ error: "Payment verification failed." }, { status: 400 });
    }

    // 3. Deduct inventory from products table in Supabase
    for (const item of order.order_items) {
      const { data: product, error: fetchErr } = await supabase
        .from("products")
        .select("*")
        .eq("id", item.id || item.productId)
        .maybeSingle();

      if (product) {
        let stockUpdated = false;
        const updatedVariants = (product.variants || []).map((v) => {
          if (v.id === item.variantId) {
            const rawStock = v.stock !== undefined && v.stock !== null ? parseInt(v.stock, 10) : null;
            if (rawStock !== null) {
              v.stock = Math.max(0, rawStock - item.quantity);
              v.availableForSale = !!v.callForInventory || v.stock > 0;
              stockUpdated = true;
            }
          }
          return v;
        });

        if (stockUpdated) {
          const productAvailableForSale = updatedVariants.some((v) => v.availableForSale);
          
          await supabase
            .from("products")
            .update({
              variants: updatedVariants,
              availableForSale: productAvailableForSale
            })
            .eq("id", product.id);
        }
      }
    }

    // 4. Delete inventory holds associated with this Order ID
    await supabase.from("inventory_holds").delete().eq("order_id", targetOrderId);

    // 5. Update order record status to "paid" in database
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        payment_id: paymentGatewayId,
        payment_status: "paid"
      })
      .eq("id", order.id);

    if (updateError) {
      console.error("Failed to update order status to paid:", updateError);
      return NextResponse.json({ error: "Failed to update order status." }, { status: 500 });
    }

    return NextResponse.json({ success: true, paymentId: paymentGatewayId });

  } catch (error) {
    console.error("Verification route error:", error);
    return NextResponse.json({ error: "Server error occurred during payment verification." }, { status: 500 });
  }
}
