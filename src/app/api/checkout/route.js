import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const { items, customerName, customerEmail, customerPhone } = await request.json();
    
    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items in checkout." }, { status: 400 });
    }

    const provider = process.env.PAYMENT_GATEWAY_PROVIDER || "none";
    if (provider === "none") {
      return NextResponse.json({ error: "Online ordering is not enabled." }, { status: 400 });
    }

    // 1. Calculate totals and check stock availability
    let totalAmount = 0;
    
    // Fetch active holds from DB in parallel
    const { data: activeHolds, error: holdsError } = await supabase
      .from("inventory_holds")
      .select("variant_id, quantity")
      .gt("expires_at", new Date().toISOString());

    if (holdsError) {
      console.error("Holds check error:", holdsError);
    }

    const heldQuantities = new Map();
    (activeHolds || []).forEach((hold) => {
      const current = heldQuantities.get(hold.variant_id) || 0;
      heldQuantities.set(hold.variant_id, current + (hold.quantity || 1));
    });

    const parsedItems = [];
    for (const item of items) {
      const { data: product, error: prodError } = await supabase
        .from("products")
        .select("*")
        .eq("id", item.productId || item.id)
        .maybeSingle();

      if (prodError || !product) {
        return NextResponse.json({ error: `Product not found: ${item.title}` }, { status: 400 });
      }

      const variant = (product.variants || []).find((v) => v.id === item.variantId);
      if (!variant) {
        return NextResponse.json({ error: `Variant not found for: ${item.title}` }, { status: 400 });
      }

      const rawStock = variant.stock !== undefined && variant.stock !== null ? parseInt(variant.stock, 10) : null;
      const callForInventory = !!variant.callForInventory;

      if (!callForInventory && rawStock !== null) {
        const held = heldQuantities.get(item.variantId) || 0;
        const availableStock = Math.max(0, rawStock - held);

        if (item.quantity > availableStock) {
          return NextResponse.json({ 
            error: `Insufficient stock for ${item.title} (${variant.title || "Default"}). Only ${availableStock} remaining.` 
          }, { status: 400 });
        }
      }

      const itemPrice = parseFloat(variant.price?.amount || product.price || 0);
      totalAmount += itemPrice * item.quantity;

      parsedItems.push({
        product_id: product.id,
        variant_id: variant.id,
        title: product.title,
        variantTitle: variant.title || "Default",
        price: itemPrice,
        quantity: item.quantity
      });
    }

    let orderId = "";
    let paymentData = {};

    // 2. Contact Payment Gateway APIs
    if (provider === "razorpay") {
      const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
      const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;
      const authHeader = "Basic " + Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString("base64");

      const response = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          "Authorization": authHeader,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          amount: Math.round(totalAmount * 100), // paise
          currency: "INR",
          receipt: `rcpt_${Date.now()}`
        })
      });

      const orderData = await response.json();
      if (!response.ok) {
        return NextResponse.json({ error: orderData.error?.description || "Razorpay order creation failed." }, { status: 500 });
      }

      orderId = orderData.id;
      paymentData = {
        provider: "razorpay",
        key: razorpayKeyId,
        orderId: orderData.id,
        amount: orderData.amount,
        currency: orderData.currency
      };

    } else if (provider === "cashfree") {
      const cfAppId = process.env.CASHFREE_APP_ID;
      const cfSecretKey = process.env.CASHFREE_SECRET_KEY;
      const cfEnv = process.env.CASHFREE_ENV || "sandbox";
      const cfBaseUrl = cfEnv === "production" ? "https://api.cashfree.com/pg" : "https://sandbox.cashfree.com/pg";

      orderId = `order_${Date.now()}`;

      const response = await fetch(`${cfBaseUrl}/orders`, {
        method: "POST",
        headers: {
          "x-client-id": cfAppId,
          "x-client-secret": cfSecretKey,
          "x-api-version": "2023-08-01",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          order_id: orderId,
          order_amount: totalAmount,
          order_currency: "INR",
          customer_details: {
            customer_id: customerPhone || "cust_anon",
            customer_email: customerEmail || "anon@aurumbites.co.in",
            customer_phone: customerPhone || "9999999999",
            customer_name: customerName || "Guest User"
          }
        })
      });

      const orderData = await response.json();
      if (!response.ok) {
        return NextResponse.json({ error: orderData.message || "Cashfree order creation failed." }, { status: 500 });
      }

      paymentData = {
        provider: "cashfree",
        paymentSessionId: orderData.payment_session_id,
        orderId: orderData.order_id,
        amount: totalAmount
      };
    } else {
      return NextResponse.json({ error: "Invalid payment provider." }, { status: 400 });
    }

    // 3. Create the inventory holds associated with the Order ID
    const holdsToCreate = parsedItems.map(item => ({
      product_id: item.product_id,
      variant_id: item.variant_id,
      quantity: item.quantity,
      expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 mins hold
      order_id: orderId
    }));

    const { error: holdsWriteError } = await supabase
      .from("inventory_holds")
      .insert(holdsToCreate);

    if (holdsWriteError) {
      console.error("Failed to create inventory holds:", holdsWriteError);
    }

    // 4. Create pending order log in Supabase
    const { error: orderError } = await supabase.from("orders").insert([
      {
        customer_name: customerName || "Guest User",
        customer_email: customerEmail || "anon@aurumbites.co.in",
        customer_phone: customerPhone || "",
        order_items: parsedItems.map(i => ({
          id: i.product_id,
          title: i.title,
          variantId: i.variant_id,
          variantTitle: i.variantTitle,
          price: i.price,
          quantity: i.quantity
        })),
        total_amount: totalAmount,
        payment_provider: provider,
        payment_id: orderId,
        payment_status: "pending"
      }
    ]);

    if (orderError) {
      console.error("Failed to insert pending order:", orderError);
    }

    return NextResponse.json(paymentData);

  } catch (error) {
    console.error("Checkout route error:", error);
    return NextResponse.json({ error: "Server error occurred during checkout setup." }, { status: 500 });
  }
}
