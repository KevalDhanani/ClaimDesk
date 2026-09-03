"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const HEADER_SCROLL_PX = 28;

export function SiteHeader() {
  const pathname = usePathname();
  const overlaysHero = pathname === "/" || pathname === "/report";
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > HEADER_SCROLL_PX);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const solid = !overlaysHero || scrolled;

  return (
    <header
      className={`site-header sticky top-0 z-40 text-white transition-[background-color,border-color,box-shadow] duration-300 ${
        solid ? "site-header--solid" : "site-header--clear"
      }`}
    >
      <div className="shell flex items-center justify-between gap-4 py-3.5">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          {/* Monogram badge */}
          <span className="logo-badge flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[15px] font-extrabold leading-none tracking-tighter text-[var(--navy-900)]">
            AO
          </span>
          <span className="min-w-0">
            <span className="block text-[15px] leading-tight tracking-tight">
              <span className="font-light opacity-90">Claim</span><span className="font-bold">Desk</span>
            </span>
            <span className="block text-[10px] font-medium tracking-[0.1em] text-white/50">
              AEROONE LOST PROPERTY
            </span>
          </span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/"
            className="hidden rounded px-3 py-2 text-sm text-white/75 hover:bg-white/10 hover:text-white sm:inline-flex"
          >
            Home
          </Link>
          <Link
            href="/claims"
            className="hidden rounded px-3 py-2 text-sm text-white/75 hover:bg-white/10 hover:text-white sm:inline-flex"
          >
            My claims
          </Link>
          <Link href="/report" className="btn btn-on-dark !px-4 !py-2">
            Report an item
          </Link>
        </nav>
      </div>
    </header>
  );
}
