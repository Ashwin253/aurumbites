"use client";

import React, { useState } from "react";

export default function Hero() {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/shop?q=${encodeURIComponent(searchQuery.trim())}`;
    } else {
      window.location.href = "/shop";
    }
  };

  const popularBrands = [
    { name: "Pasta Zara", handle: "pasta-zara" },
    { name: "President", handle: "president" },
    { name: "Cremeitalia", handle: "crme-italia" },
  ];

  return (
    <section className="relative h-[90vh] min-h-[520px] overflow-hidden">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src="/dairyproduct.mp4" type="video/mp4" />
      </video>

      {/* dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
        <h1 className="mt-4 text-5xl font-bold tracking-tight text-white sm:text-7xl">
          Finest Gourmet
        </h1>

        <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/70">
          Curated dairy sourced from the world&apos;s finest producers,<br/>
          delivered with uncompromising quality.
        </p>

        {/* Search Bar Form */}
        <form onSubmit={handleSearchSubmit} className="mt-10 w-full max-w-lg relative flex items-center px-4 sm:px-0">
          <input
            type="text"
            placeholder="Search butter, cheese, cream..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md border border-white/20 bg-white/10 px-6 py-4 pr-14 text-sm text-white placeholder-white/50 backdrop-blur-md outline-none focus:border-white/40 focus:bg-white/15 transition-all duration-300 shadow-lg"
          />
          <button
            type="submit"
            className="absolute right-6 sm:right-2 p-2.5 rounded-full bg-white text-neutral-900 transition hover:bg-neutral-100 shadow-md flex items-center justify-center"
            aria-label="Search"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </form>

        {/* Popular Brand Pills */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 px-4 sm:px-0">
          <span className="text-xs font-semibold uppercase tracking-wider text-white/60 mr-1">Popular Brands:</span>
          {popularBrands.map((brand) => (
            <a
              key={brand.handle}
              href={`/shop?brand=${brand.handle}`}
              className="rounded-md bg-black/10 px-4 py-1.5 text-xs font-medium text-white/90 border border-white/10 transition-all duration-200 hover:bg-white/25 hover:border-white/25 hover:scale-105 active:scale-95 shadow-sm"
            >
              {brand.name}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
