import Image from "next/image";
import InfiniteCarousel from "./InfiniteCarousel";

const clientsData = [
  {
    name: "Colocal choco",
    src: "/clients/colocalchoco.jpg",
  },
  {
    name: "Grillardin",
    src: "/clients/grillardin.jpg",
  },
  {
    name: "Hotel City Park",
    src: "/clients/hotelcitypark.jpg",
  },
  {
    name: "Masala Synergy",
    src: "/clients/masalasynergy.jpg",
  },
  {
    name: "The Claridges",
    src: "/clients/theclaridges.jpg",
  },
];

export default function BusinessesTrustUs() {
  return (
    <InfiniteCarousel
      title="Businesses That Trust Us"
      description="From cafes and cloud kitchens to hotels and retail counters, we support businesses that depend on consistent dairy supply and dependable service."
      items={clientsData}
      trackClassName="businesses-carousel-track"
      gapClass="gap-5"
      renderItem={(brand) => (
        <div className="flex h-32 w-48 shrink-0 flex-col items-center justify-center rounded-3xl border border-neutral-200 bg-white px-5 py-4 shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
          <Image
            src={brand.src}
            alt={`${brand.name} logo`}
            width={132}
            height={72}
            className="max-h-14 w-auto object-contain"
          />
          <p className="mt-4 text-center text-sm font-medium text-neutral-700">
            {brand.name}
          </p>
        </div>
      )}
    />
  );
}
