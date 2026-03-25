import React from "react";

export default function Hero() {
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
        {/* <p className="text-xs font-extrabold uppercase tracking-[0.35em] text-[#0c1238]">
          Premium Dairy Collection
        </p> */}

        <h1 className="mt-4 text-5xl font-bold tracking-tight text-white sm:text-7xl">
          Finest Gourmet
        </h1>

        <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/70">
          Curated dairy sourced from the world&apos;s finest producers,
          delivered with uncompromising quality.
        </p>

        <div className="mt-10 flex gap-4">
          <a
            href="/shop"
            className="rounded-full bg-white/10 px-7 py-3 text-sm font-semibold text-white ring-1 ring-white/25 backdrop-blur transition hover:bg-white/20"
          >
            Shop Now
          </a>
          <a
            href="/contact"
            className="rounded-full bg-[#0c1238] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#0c1238]/90"
          >
            Get in Touch
          </a>
        </div>
      </div>
    </section>
  );
}
