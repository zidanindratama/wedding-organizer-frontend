"use client";

import Link from "next/link";
import { Facebook, Instagram, Twitter } from "lucide-react";
import { NAV_LINKS } from "./site-navbar";

export default function SiteFooter() {
  return (
    <footer className="w-full bg-[#4E5A40] text-[#E6E6E6]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 py-8 md:flex-row">
          <Link
            href="/"
            className="flex items-center font-display text-2xl font-semibold text-white"
          >
            <span className="grid h-10 w-10 place-items-center rounded-full border border-white/40 text-lg font-bold">
              WO
            </span>
          </Link>

          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-sans text-[#C4CCBC]">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="transition hover:text-white"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="#"
              aria-label="Facebook"
              className="text-[#C4CCBC] transition hover:text-white"
            >
              <Facebook className="h-5 w-5" />
            </Link>
            <Link
              href="#"
              aria-label="Instagram"
              className="text-[#C4CCBC] transition hover:text-white"
            >
              <Instagram className="h-5 w-5" />
            </Link>
            <Link
              href="#"
              aria-label="Twitter"
              className="text-[#C4CCBC] transition hover:text-white"
            >
              <Twitter className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
