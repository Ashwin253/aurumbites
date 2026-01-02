// components/Hero.tsx
import React from 'react';

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 py-28">
        <p className="text-sm font-medium text-neutral-500 uppercase tracking-wider">
          Dairy Distribution
        </p>

        <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
          Trusted Dairy Sourcing for Businesses & Consumers
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-neutral-600">
          We source high-quality dairy products from local and international
          partners, delivering consistency, reliability, and quality across
          B2B and select D2C channels.
        </p>

        <div className="mt-10 flex gap-4">
          <a
            href="/contact"
            className="rounded-full bg-neutral-900 px-6 py-3 text-sm font-medium text-white hover:bg-neutral-800 transition"
          >
            Get in Touch
          </a>
          <a
            href="/about"
            className="rounded-full border border-neutral-300 px-6 py-3 text-sm font-medium text-neutral-700 hover:border-neutral-400 transition"
          >
            Learn More
          </a>
        </div>
      </div>
    </section>
  );
}
