"use server";

import { supabase } from "../../lib/supabase";

export async function submitContactMessage(formData) {
  const name = formData.get("name");
  const email = formData.get("email");
  const message = formData.get("message");

  if (!name || !email || !message) {
    return { error: "Please fill out all required fields." };
  }

  const { error } = await supabase
    .from("contact_messages")
    .insert([
      {
        name,
        email,
        message,
        status: "new",
      },
    ]);

  if (error) {
    console.error("Supabase insert error:", error);
    return { error: "Failed to send message. Please try again later." };
  }

  return { success: true };
}
