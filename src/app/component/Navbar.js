import Image from "next/image";

// components/Navbar.tsx
export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-neutral-200">
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
       <div className="flex items-center gap-2">
       <Image src="/logo.jpg" alt="logo" width={50} height={50} />
        <div className="text-base font-bold   text-black ">
          AURUM <br/> BITES
        </div>
</div>
        {/* <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-700">
          <a href="/" className="hover:text-neutral-900">Home</a>
          <a href="/about" className="hover:text-neutral-900">About</a>
          <a href="/contact" className="hover:text-neutral-900">Contact</a>
        </nav> */}
<div>
  <a href="/" className="mr-6 text-sm font-medium text-neutral-700 hover:text-neutral-900">
    Home
  </a>
        <a
          href="/contact"
          className="rounded-full bg-neutral-900 px-5 py-2 text-sm font-medium text-white hover:bg-neutral-800 transition"
        >
          Enquire
        </a>
        </div>
      </div>
    </header>
  );
}
