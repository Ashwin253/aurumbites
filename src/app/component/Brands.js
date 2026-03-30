import Image from "next/image";
import InfiniteCarousel from "./InfiniteCarousel";

export const brandsData = [
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
    <InfiniteCarousel
      title="Brands We Work With"
      description="We collaborate with established dairy brands and regional producers to ensure consistent quality and reliable supply."
      items={brandsData}
      trackClassName="brands-carousel-track"
      footerNote="*Brand availability may vary by region and product category."
      renderItem={(brand) => (
        <div className="flex h-28 w-40 items-center justify-center bg-white p-4 hover:shadow-xl">
          <Image
            src={brand.src}
            alt={`${brand.name} logo`}
            width={140}
            height={80}
            className="max-h-16 w-auto object-contain opacity-90 transition hover:opacity-100"
          />
        </div>
      )}
    />
  );
}
