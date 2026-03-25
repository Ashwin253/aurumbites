// import Navbar from "@/components/Navbar";
// import Hero from "@/components/Hero";
// import ProductCategories from "@/components/ProductCategories";
// import QualityBadges from "@/components/QualityBadges";
// import Footer from "@/components/Footer";

import Brands from "./component/Brands";
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

      <main>
        <Hero />
        {/* <HoverListView/> */}
        {/* <ProductCategories /> */}
        <Sublistcategory />
        <Brands/>

        <QualityBadges />

      </main>

      <Footer />
    </>
  );
}
