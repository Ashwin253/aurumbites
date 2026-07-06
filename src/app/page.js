// import Navbar from "@/components/Navbar";
// import Hero from "@/components/Hero";
// import ProductCategories from "@/components/ProductCategories";
// import QualityBadges from "@/components/QualityBadges";
// import Footer from "@/components/Footer";

"use client";

import Hero from "./component/Hero";
import Navbar from "./component/Navbar";
import dynamic from "next/dynamic";

const Brands = dynamic(() => import("./component/Brands"), { ssr: false });
const BusinessesTrustUs = dynamic(() => import("./component/BusinessesTrustUs"), { ssr: false });
const Footer = dynamic(() => import("./component/Footer"), { ssr: false });
const QualityBadges = dynamic(() => import("./component/QualtiyBadges"), { ssr: false });
const Sublistcategory = dynamic(() => import("./shop/ShopUi").then(m => m.Sublistcategory), { ssr: false });

export default function HomePage() {
  return (
    <>
      <Navbar />
      <link rel="icon" href="/favicon.ico" sizes="any" />
      <main>
        <Hero />
        <Sublistcategory />
        <Brands />
        <BusinessesTrustUs />
        <QualityBadges />
      </main>
      <Footer />
    </>
  );
}
