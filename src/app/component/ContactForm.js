"use client";

import { useForm, ValidationError } from "@formspree/react";

export default function ContactForm() {
  const [state, handleSubmit] = useForm("meeogqqd");

  if (state.succeeded) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-8 text-center">
        <h2 className="text-lg font-semibold">Thank you</h2>
        <p className="mt-2 text-sm text-neutral-600">
          Your enquiry has been submitted. We’ll get back to you shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 rounded-2xl bg-neutral-50 border border-neutral-200">
      {/* Name */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-neutral-700"
        >
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="mt-2 w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
        />
      </div>

      {/* Email */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-neutral-700"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          name="email"
          required
          className="mt-2 w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
        />
        <ValidationError
          prefix="Email"
          field="email"
          errors={state.errors}
        />
      </div>

      {/* Message */}
      <div>
        <label
          htmlFor="message"
          className="block text-sm font-medium text-neutral-700"
        >
          Requirement / Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          required
          className="mt-2 w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
        />
        <ValidationError
          prefix="Message"
          field="message"
          errors={state.errors}
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={state.submitting}
        className="w-full rounded-full bg-neutral-900 px-6 py-3 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50 transition"
      >
        {state.submitting ? "Sending..." : "Send Enquiry"}
      </button>
    </form>
  );
}
