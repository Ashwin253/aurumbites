// components/Navbar.tsx
export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-neutral-200">
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
        <div className="text-xl font-semibold tracking-tight">
          AURUM BITES
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-700">
          <a href="/" className="hover:text-neutral-900">Home</a>
          <a href="/about" className="hover:text-neutral-900">About</a>
          <a href="/contact" className="hover:text-neutral-900">Contact</a>
        </nav>

        <a
          href="/contact"
          className="rounded-full bg-neutral-900 px-5 py-2 text-sm font-medium text-white hover:bg-neutral-800 transition"
        >
          Enquire
        </a>
      </div>
    </header>
  );
}
