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

const carouselBrands = [...brands, ...brands];

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

        <div className="relative mt-12 overflow-hidden">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-white to-transparent" />
          {/* <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-white to-transparent" /> */}

          <div className="brands-carousel-track flex w-max items-center gap-4">
            {carouselBrands.map((brand, index) => (
              <div
                key={`${brand.name}-${index}`}
                className="flex h-28 w-40  items-center justify-center  bg-white p-4  hover:shadow-xl"
              >
                <Image
                  src={brand.src}
                  alt={`${brand.name} logo`}
                  width={140}
                  height={80}
                  className="max-h-16 w-auto object-contain opacity-90 transition hover:opacity-100"
                />
              </div>
            ))}
          </div>
        </div>

        <p className="mt-8 text-xs text-neutral-500">
          *Brand availability may vary by region and product category.
        </p>
      </div>
    </section>
  );
}
