"use client";

import Image from "next/image";

const categories = [
  { title: "Butter" },
  { title: "Mozzarella" },
  { title: "Parmesan" },
  { title: "Burrata" },
  { title: "Pasta" },
  { title: "Cheddar" },
];

export default function ProductCategories() {
  return (
    <section className="bg-white border-t border-neutral-200">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <h2 className="text-2xl font-semibold text-black tracking-tight">
          Product Categories
        </h2>

        <p className="mt-4 max-w-2xl text-neutral-600">
          Categories we operate in for B2B distribution and selective
          consumer supply.
        </p>

        <div className="mt-14 grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((item, index) => {
            const isZigZagRow = Math.floor(index / 3) % 2 !== 0;
            const imageName = item.title.toLowerCase();

            return (
              <div
                key={item.title}
                className={`relative h-44 overflow-hidden rounded-2xl flex items-center justify-center
                  transition-transform duration-300 hover:scale-[1.02]
                  ${isZigZagRow ? "lg:translate-y-6" : ""}
                `}
              >
                {/* Background image with fallback */}
                <Image
                  src={`/product/${imageName}.jpg`}
                  alt={item.title}
                  width={140}
                height={80}
              
                  className="absolute inset-0 h-full w-full object-cover scale-110"
                 />

                {/* Soft overlay */}
                <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px]" />

                {/* Title */}
                <h3 className="relative z-10 text-3xl font-extrabold tracking-wide text-neutral-900">
                  {item.title}
                </h3>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
