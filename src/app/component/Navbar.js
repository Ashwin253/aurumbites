"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

const navLinks = [
  { href: "/", label: "Home", variant: "ghost" },
  { href: "/shop", label: "Shop", variant: "solid" },
  { href: "/contact", label: "Enquire", variant: "solid" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <Image src="/logo.jpg" alt="logo" width={50} height={50} />
          <Link
            href="/"
            className="text-base font-bold leading-tight text-black"
            onClick={() => setIsOpen(false)}
          >
            AURUM <br /> BITES
          </Link>
        </div>

        <nav className="hidden items-center gap-2 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={
                link.variant === "solid"
                  ? "rounded-md bg-neutral-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
                  : "px-3 py-2 text-sm font-bold text-neutral-800 transition hover:text-neutral-900"
              }
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          aria-expanded={isOpen}
          aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-neutral-300 text-neutral-900 transition hover:border-neutral-400 md:hidden"
          onClick={() => setIsOpen((open) => !open)}
        >
          <span className="flex h-4 w-5 flex-col justify-between">
            <span
              className={`block h-0.5 w-full bg-current transition ${
                isOpen ? "translate-y-[7px] rotate-45" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-full bg-current transition ${
                isOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-full bg-current transition ${
                isOpen ? "-translate-y-[7px] -rotate-45" : ""
              }`}
            />
          </span>
        </button>
      </div>

      {isOpen ? (
        <div className="border-t border-neutral-200 bg-white px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={
                  link.variant === "solid"
                    ? "rounded-2xl bg-neutral-900 px-5 py-3 text-center text-sm font-medium text-white transition hover:bg-neutral-800"
                    : "rounded-2xl border border-neutral-200 px-5 py-3 text-center text-sm font-semibold text-neutral-900 transition hover:border-neutral-300"
                }
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
