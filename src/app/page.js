// import Navbar from "@/components/Navbar";
// import Hero from "@/components/Hero";
// import ProductCategories from "@/components/ProductCategories";
// import QualityBadges from "@/components/QualityBadges";
// import Footer from "@/components/Footer";

import Brands from "./component/Brands";
import Hero from "./component/Hero";
import Navbar from "./component/Navbar";
import ProductCategories from "./component/ProductCategories";
// import ProductCategories from "./component/ProductCategories";
import QualityBadges from "./component/QualtiyBadges";

export default function HomePage() {
  return (
    <>
      <Navbar />

      <main>
        <Hero />
        <ProductCategories />
        <Brands/>
        <QualityBadges />
      </main>

      {/* <Footer /> */}
    </>
  );
}
