const categories = [
  {
    title: "Milk & Milk Derivatives",
    desc: "Fresh, UHT, skimmed and full-cream milk for bulk supply.",
  },
  {
    title: "Butter & Cream",
    desc: "Cooking, baking and industrial-grade dairy solutions.",
  },
  {
    title: "Cheese & Specialty Dairy",
    desc: "Mozzarella, cheddar, processed and imported cheeses.",
  },
  {
    title: "Paneer, Curd & Value-Added",
    desc: "Paneer, curd, yogurt and customized dairy products.",
  },
];

export default function ProductCategories() {
  return (
    <section className="bg-white border-t border-neutral-200">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <h2 className="text-2xl text-black font-semibold tracking-tight">
          Product Categories
        </h2>

        <p className="mt-4 max-w-2xl text-neutral-600">
          Categories we operate in for B2B distribution and selective
          consumer supply.
        </p>

        <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-neutral-200 p-6"
            >
              <h3 className="text-lg font-medium text-black">{item.title}</h3>
              <p className="mt-3 text-sm text-neutral-600">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
