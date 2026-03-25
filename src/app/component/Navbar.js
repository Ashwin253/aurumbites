"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

const navLinks = [
  { href: "/", label: "Home", variant: "ghost" },
  {
    href: "/shop",
    label: "Shop",
    variant: "solid",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
      >
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" x2="21" y1="6" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
  },
  {
    href: "/contact",
    label: "Enquire",
    variant: "solid",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
      >
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    ),
  },
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
    <header className="sticky top-0 z-50 border-b border-[#d8c39a] bg-[#0f0d09]/96 shadow-[0_18px_48px_rgba(15,13,9,0.38)] backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="overflow-hidden rounded-2xl border border-white/15 shadow-[0_12px_30px_rgba(0,0,0,0.24)]">
            <Image src="/logo.jpg" alt="logo" width={52} height={52} />
          </div>
          <Link
            href="/"
            className="text-base font-extrabold leading-tight tracking-[0.18em] text-white"
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
                  ? "flex items-center gap-2 rounded-md border border-[#0c1238] bg-[#ffe8c2] px-5 py-2.5 text-sm font-bold text-black shadow-[0_10px_24px_rgba(212,168,83,0.22)] transition hover:bg-[#f0ddb0]"
                  : "rounded-full px-4 py-2.5 text-sm font-bold tracking-[0.08em] text-white transition hover:bg-white/8 hover:text-[#f4e5bd]"
              }
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          aria-expanded={isOpen}
          aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#cfb57a]/60 bg-white/6 text-white transition hover:border-[#cfb57a] md:hidden"
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
        <div className="border-t border-[#d8c39a]/40 bg-[#16120d]/98 px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={
                  link.variant === "solid"
                    ? "flex items-center justify-center gap-2 rounded-2xl border border-[#cfb57a] bg-[#f4e5bd] px-5 py-3 text-center text-sm font-bold text-[#1d1810] transition hover:bg-[#f0ddb0]"
                    : "rounded-2xl border border-white/15 bg-white/4 px-5 py-3 text-center text-sm font-bold tracking-[0.08em] text-white transition hover:border-[#cfb57a]/60 hover:text-[#f4e5bd]"
                }
                onClick={() => setIsOpen(false)}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
