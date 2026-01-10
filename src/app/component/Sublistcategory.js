"use client";

import { useState } from "react";

const DATA = [
  {
    title: "Dairy Spreads & Cream",
    items: [
      "Salted Butter",
      "Unsalted Butter",
      "Fresh Cream",
      "Sour Cream",
      "Cooking Cream",
      "Whipping Cream",
    ],
    images: ["/categories/saltedbutter.jpg", "/categories/freshcream.jpg", "/categories/whippingcream.png"],
  },
  {
    title: "Cheese",
    items: [
      "Mozzarella",
      "Burrata",
      "Ricotta",
      "Mascarpone",
      "Scamorza",
      "Fiordilatte",
    ],
    images: ["/categories/mozerellacheese.jpg", "/categories/Mascarpone.png", "/categories/FreshCheese.png"],
  }, 
  {
     title: "Imported Cheese",
    items: [
      "Blue Cheese",
      "Parmesan",
      "Cheddar Mild White",
      "Cheddar Mild Coloured",
      "Brie",
      "Camembert",
      "Soft Goat Cheese",
      "Edam Mild Ball",
      "Feta Cheese",
      "Emmental",
    ],
    images: ["/categories/CREAMCHEESE.png", "/categories/dlectacheese.webp", "/categories/BriePresident.png"],
  },
  {title: "Dry",
    items: [
      "Fries",
      "Penne",
      "Spaghetti",
      "Farfalle",
      "Fusilli",
      "Pelati",
      "Olives",
      "Olive Oil",
    ],
    images: ["/img/fries.jpg", "/img/penne.jpg", "/img/spaghetti.jpg"],
  },{
    title: "Frozen Non-Veg",
    items: [
      "Chicken",
      "Mutton",
      "Pork",
      "Prawns",
      "Lobsters",
      "Octopus",
    ],
    images: ["/img/chicken.jpg", "/img/mutton.jpg", "/img/pork.jpg"],
  }
];

export default function ResponsiveCatalog() {
 const [active, setActive] = useState(0);
  const [openMobile, setOpenMobile] = useState(null);

  return (
    <section className="max-w-6xl mx-auto px-4 py-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* CATEGORY LIST */}
        <div className="space-y-4">
          {DATA.map((cat, i) => {
            const isOpen = openMobile === i;

            return (
              <div key={cat.title}>
                {/* CATEGORY CARD */}
                <div
                  onMouseEnter={() => setActive(i)}
                  onClick={() =>
                    setOpenMobile(isOpen ? null : i)
                  }
                  className={`h-24 rounded-2xl border p-4 flex items-center justify-between
                    cursor-pointer transition-all
                    border-gray-200 bg-white text-gray-900
                    hover:shadow-lg
                    dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:shadow-none
                    ${
                      active === i
                        ? "md:bg-[#0b1537] md:text-white md:border-[#0b1537]"
                        : ""
                    }`}
                >
                  <div>
                    <p className="text-xs uppercase tracking-wider opacity-70">
                      Category
                    </p>
                    <h3 className="text-lg font-semibold">
                      {cat.title}
                    </h3>
                  </div>

                  {/* PLUS / MINUS (MOBILE) */}
                  <span className="md:hidden text-2xl font-light">
                    {isOpen ? "−" : "+"}
                  </span>
                </div>

                {/* MOBILE DETAILS */}
                <div
                  className={`md:hidden overflow-hidden transition-all duration-300
                    ${isOpen ? "max-h-[700px] mt-4" : "max-h-0"}
                  `}
                >
                  <MobileDetails cat={cat} />
                </div>
              </div>
            );
          })}
        </div>

        {/* DESKTOP DETAILS */}
        <div className="hidden md:block md:col-span-2">
          <div className="min-h-[440px] rounded-3xl border p-8 shadow-lg
                          bg-white border-gray-200
                          dark:bg-slate-900 dark:border-slate-700 dark:shadow-none">
            <h2 className="text-2xl font-semibold mb-6 text-[#0b1537] dark:text-[#fde4bc]">
              {DATA[active].title}
            </h2>

            {/* ITEMS */}
            <div className="flex flex-wrap gap-3 mb-8">
              {DATA[active].items.map((item) => (
                <span
                  key={item}
                  className="px-4 py-2 text-sm rounded-full
                             bg-gray-100 text-gray-800
                             hover:bg-[#fde4bc]
                             dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700
                             transition"
                >
                  {item}
                </span>
              ))}
            </div>

            {/* IMAGE STRIP */}
            <div className="grid grid-cols-3 gap-4">
              {DATA[active].images.map((img, idx) => (
                <div
                  key={idx}
                  className="h-28 rounded-xl overflow-hidden bg-gray-100 dark:bg-slate-800"
                >
                  <img
                    src={img}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* MOBILE DETAILS */
function MobileDetails({ cat }) {
  return (
    <div className="rounded-2xl border p-5 shadow-sm
                    bg-white border-gray-200
                    dark:bg-slate-900 dark:border-slate-700 dark:shadow-none">
      <h4 className="font-semibold mb-4 text-[#0b1537] dark:text-[#fde4bc]">
        {cat.title}
      </h4>

      <div className="flex flex-wrap gap-2 mb-4">
        {cat.items.map((item) => (
          <span
            key={item}
            className="px-3 py-1.5 text-xs rounded-full
                       bg-gray-100 text-gray-800
                       dark:bg-slate-800 dark:text-slate-100"
          >
            {item}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {cat.images.map((img, i) => (
          <div
            key={i}
            className="h-20 rounded-lg overflow-hidden bg-gray-100 dark:bg-slate-800"
          >
            <img
              src={img}
              className="h-full w-full object-cover"
              alt=""
            />
          </div>
        ))}
      </div>
    </div>
  );
}
