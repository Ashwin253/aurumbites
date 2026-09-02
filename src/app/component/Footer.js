import Image from "next/image";
import Link from "next/link";

const socialLinks = [
  {
    name: "Instagram",
    href: "https://www.instagram.com/aurumbitesindia/",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
      </svg>
    ),
  },
  {
    name: "Facebook",
    href: "https://www.facebook.com/profile.php?id=61577753794542",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
      </svg>
    ),
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/aurum-bites-2a7a6b371/",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>
      </svg>
    ),
  },
  {
    name: "WhatsApp",
    href: `https://wa.me/919654979085?text=${encodeURIComponent(`Hi, I'm interested in sourcing for products.`)}`,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
      </svg>
    ),
  },
];

const directoryCollections = [
  { title: "Cheese Slices", href: "/collection/cheese--slice" },
  { title: "Butter & Spreads", href: "/collection/butter" },
  { title: "Fresh Cheese & Paneer", href: "/collection/fresh-cheese" },
  { title: "Gourmet Cream", href: "/collection/cream" },
  { title: "Imported & Artisan Cheeses", href: "/collection/imported-cheese" },
  { title: "Fries & Frozen Snacks", href: "/collection/fries" },
  { title: "Cooking & Olive Oil", href: "/collection/oil" },
];

const directoryBrands = [
  { title: "President", href: "/brand/president" },
  { title: "Amul", href: "/brand/amul" },
  { title: "Cremeitalia", href: "/brand/cremeitalia" },
  { title: "D'lecta", href: "/brand/dlecta" },
  { title: "Dairy Craft", href: "/brand/dairycraft" },
  { title: "Modern Dairy", href: "/brand/modern-dairy" },
  { title: "Pasta Zara", href: "/brand/pasta-zara" },
  { title: "McCain", href: "/brand/mccain" },
  { title: "Jacks Cheese", href: "/brand/jacks-cheese" },
  { title: "Gran Mantovano", href: "/brand/gran-mantovano" },
  { title: "Elle & Vire", href: "/brand/elle-vire" },
  { title: "Emborg", href: "/brand/emborg" },
  { title: "Philadelphia", href: "/brand/philadelphia" },
  { title: "Arla", href: "/brand/arla" },
  { title: "Ybarra", href: "/brand/ybarra" },
  { title: "Rich's", href: "/brand/richs" },
];

export default function Footer() {
  return (
    <footer className="border-t border-[#e6dac5] bg-[#fcf8f1] text-neutral-800">
      {/* ========================================================================= */}
      {/* 1. SEPARATE SPACIOUS DIRECTORY SECTION: COLLECTIONS & BRANDS (LIGHT THEME) */}
      {/* ========================================================================= */}
      <div className="border-b border-[#e6dac5] bg-[#f8f3e8] py-14">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
            
            {/* Collections Block */}
            <div className="flex flex-col justify-between rounded-2xl border border-[#e6dac5] bg-white p-6 sm:p-8 shadow-sm">
              <div>
                <div className="flex items-center justify-between gap-4 border-b border-[#f0e6d6] pb-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#9a7a3f]">
                      Product Categories
                    </span>
                    <h3 className="mt-1 text-xl font-bold text-neutral-900">
                      Explore Collections
                    </h3>
                  </div>
                  <Link
                    href="/collections"
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#d8c39a] bg-[#fcf8f1] px-4 py-1.5 text-xs font-semibold text-[#84662d] transition hover:border-[#9a7a3f] hover:bg-[#f3e9d7]"
                  >
                    All Collections
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>

                <div className="mt-6 flex flex-wrap gap-2.5">
                  {directoryCollections.map((col) => (
                    <Link
                      key={col.href}
                      href={col.href}
                      className="inline-block rounded-xl border border-[#e9dfcf] bg-[#fcf8f1]/80 px-3.5 py-2 text-xs font-semibold text-neutral-700 transition hover:border-[#9a7a3f] hover:bg-[#f5ecdc] hover:text-[#7a5a26] shadow-xs"
                    >
                      {col.title}
                    </Link>
                  ))}
                </div>
              </div>

              <p className="mt-6 text-xs text-neutral-500">
                Direct wholesale and institutional supply across Delhi NCR &amp; pan-India.
              </p>
            </div>

            {/* Brands Block */}
            <div className="flex flex-col justify-between rounded-2xl border border-[#e6dac5] bg-white p-6 sm:p-8 shadow-sm">
              <div>
                <div className="flex items-center justify-between gap-4 border-b border-[#f0e6d6] pb-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#9a7a3f]">
                      Verified Partners
                    </span>
                    <h3 className="mt-1 text-xl font-bold text-neutral-900">
                      Partner Brands
                    </h3>
                  </div>
                  <Link
                    href="/brands"
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#d8c39a] bg-[#fcf8f1] px-4 py-1.5 text-xs font-semibold text-[#84662d] transition hover:border-[#9a7a3f] hover:bg-[#f3e9d7]"
                  >
                    All Brands
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>

                <div className="mt-6 flex flex-wrap gap-2.5">
                  {directoryBrands.map((brand) => (
                    <Link
                      key={brand.href}
                      href={brand.href}
                      className="inline-block rounded-xl border border-[#e9dfcf] bg-[#fcf8f1]/80 px-3.5 py-2 text-xs font-semibold text-neutral-700 transition hover:border-[#9a7a3f] hover:bg-[#f5ecdc] hover:text-[#7a5a26] shadow-xs"
                    >
                      {brand.title}
                    </Link>
                  ))}
                </div>
              </div>

              <p className="mt-6 text-xs text-neutral-500">
                100% authentic products sourced directly from authorized brand manufacturers.
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MAIN COMPANY & CONTACT FOOTER (LIGHT THEME) */}
      {/* ========================================================================= */}
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="border-b border-[#e6dac5] pb-10">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#9a7a3f]">
            Aurum Bites
          </p>
          <h2 className="mt-4 max-w-3xl text-2xl font-semibold tracking-tight text-neutral-900 md:text-4xl">
            Premium dairy sourcing for retail, horeca, and bulk enquiries.
          </h2>
        </div>

        <div className="mt-12 grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#9a7a3f]">
              Navigation
            </h3>
            <ul className="mt-6 space-y-3 text-sm text-neutral-600">
              <li>
                <Link href="/" className="hover:text-neutral-950 transition font-medium">Home</Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-neutral-950 transition font-medium">Shop Catalog</Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-neutral-950 transition font-medium">About Us</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-neutral-950 transition font-medium">Contact &amp; Enquiries</Link>
              </li>
              <li>
                <Link href="/quick-shipping" className="hover:text-neutral-950 transition font-medium">Quick Shipping</Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#9a7a3f]">
              Direct Contact
            </h3>
            <div className="mt-6 space-y-4 text-sm text-neutral-700">
              <p className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#9a7a3f] shrink-0">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                <a href="tel:+919711036369" className="text-neutral-700 transition hover:text-neutral-950 font-medium">
                  +91 97110 36369
                </a>
              </p>
              <p className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#9a7a3f] shrink-0">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                <a href="tel:+919654979085" className="text-neutral-700 transition hover:text-neutral-950 font-medium">
                  +91 96549 79085
                </a>
              </p>
              <p className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#9a7a3f] shrink-0">
                  <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
                <a href="mailto:info@aurumbites.co.in" className="text-neutral-700 transition hover:text-neutral-950 font-medium">
                  info@aurumbites.co.in
                </a>
              </p>
            </div>
          </div>

          {/* Address */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#9a7a3f]">
              Registered Address
            </h3>
            <div className="mt-6 flex gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-[#9a7a3f] mt-0.5">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              <a
                href="https://maps.app.goo.gl/DXYfqxWQf7QfGM349"
                target="_blank"
                rel="noreferrer"
                className="block max-w-md text-sm leading-relaxed text-neutral-700 transition hover:text-neutral-950"
              >
                B-189, Street No. 17, Chhatarpur Enclave Phase 2, Chhatarpur, New Delhi, Delhi 110074
              </a>
            </div>

            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
                Business Hours
              </p>
              <p className="mt-1 text-sm text-neutral-700 font-medium">
                Monday to Saturday &bull; 9:00 AM &ndash; 6:00 PM
              </p>
            </div>
          </div>
        </div>

        {/* Social and Copyright */}
        <div className="mt-12 border-t border-[#e6dac5] pt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="text-xs text-neutral-500">
            &copy; {new Date().getFullYear()} Aurum Bites. All rights reserved.
          </p>

          <div className="flex flex-wrap gap-3">
            {socialLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e6dac5] bg-white text-neutral-600 transition hover:border-[#9a7a3f] hover:bg-[#fcf8f1] hover:text-[#7a5a26] shadow-xs"
                aria-label={link.name}
              >
                {link.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
