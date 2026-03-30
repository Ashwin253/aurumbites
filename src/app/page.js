// import Navbar from "@/components/Navbar";
// import Hero from "@/components/Hero";
// import ProductCategories from "@/components/ProductCategories";
// import QualityBadges from "@/components/QualityBadges";
// import Footer from "@/components/Footer";

import Brands from "./component/Brands";
import BusinessesTrustUs from "./component/BusinessesTrustUs";
import Footer from "./component/Footer";
import Hero from "./component/Hero";
import Navbar from "./component/Navbar";
import ProductCategories from "./component/ProductCategories";
// import ProductCategories from "./component/ProductCategories";
import QualityBadges from "./component/QualtiyBadges";
import { Sublistcategory } from "./shop/ShopUi";
// import HoverListView from "./component/Sublistcategory";

export default function HomePage() {
  return (
    <>
      <Navbar />
<link rel="icon" href="/favicon.ico" sizes="any" />
      <main>
        <Hero />
        {/* <HoverListView/> */}
        {/* <ProductCategories /> */}
        <Sublistcategory />
        <Brands/>
        <BusinessesTrustUs />

        <QualityBadges />

      </main>

      <Footer />
    </>
  );
}
