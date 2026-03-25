import Image from "next/image";

const brands = [
  {
    name: "President",
    src: "/brands/president.jpg",
  },
  {
    name: "Cremeitalia",
    src: "/brands/cremeitalia.jpg",
  },
  {
    name: "Pasta Zara",
    src: "/brands/pastazara.jpg",
  },
  {
    name:"dairycraft",
    src:"/brands/dairycraft.jpg",
  },
  {
    name:"dlecta",
    src:"/brands/dlecta.jpg",
  },
  {
    name:"amul",
    src:"/brands/amul.jpg",
  }
];

export default function Brands() {
  return (
    <section className="bg-white border-t border-neutral-200">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">
          Brands We Work With
        </h2>

        <p className="mt-4 max-w-2xl text-neutral-600">
          We collaborate with established dairy brands and regional producers
          to ensure consistent quality and reliable supply.
        </p>

        <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
          {brands.map((brand) => (
            <div
              key={brand.name}
              className="flex items-center justify-center rounded-2xl  border-neutral-200 bg-white p-2 transition-shadow hover:shadow-xl"
            >
              <Image
                src={brand.src}
                alt={`${brand.name} logo`}
                width={140}
                height={80}
                className="object-contain opacity-80 hover:opacity-100 transition"
              />
            </div>
          ))}
        </div>

        <p className="mt-8 text-xs text-neutral-500">
          *Brand availability may vary by region and product category.
        </p>
      </div>
    </section>
  );
}
