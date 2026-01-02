// import ProductCategories from "../components/ProductCategories";
// import QualityBadges from "../component/QualtiyBadges";
// import QualityBadges from "@/components/QualityBadges";

import Navbar from "../component/Navbar";
import ProductCategories from "../component/ProductCategories";
import QualityBadges from "../component/QualtiyBadges";

export default function AboutPage() {
  return (
    <main>
      <section className="bg-white">
        <Navbar/>
        <div className="mx-auto max-w-3xl px-6 py-24">
          <h1 className="text-3xl font-semibold tracking-tight">
            About Us
          </h1>

          <p className="mt-6 text-lg text-neutral-600">
            We source high-quality dairy products from trusted local and
            international partners.
          </p>

          <p className="mt-6 text-neutral-600">
            Our focus is B2B distribution across food service, retail and
            institutional segments.
          </p>
        </div>
      </section>

      <ProductCategories />
      <QualityBadges />
    </main>
  );
}
