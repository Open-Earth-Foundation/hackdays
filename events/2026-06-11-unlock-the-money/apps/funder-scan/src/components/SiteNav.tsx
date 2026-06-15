"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "national", label: "National" },
  { id: "region", label: "Los Ríos" },
  { id: "valdivia", label: "Valdivia" },
  { id: "gap", label: "Gap" },
  { id: "pool", label: "Pooling" },
] as const;

export default function SiteNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState<string>("overview");

  useEffect(() => {
    const ids = SECTIONS.map((s) => s.id);
    const observers: IntersectionObserver[] = [];

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActive(id);
        },
        { rootMargin: "-40% 0px -50% 0px", threshold: 0 }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="site-nav">
      <div className="site-nav-inner wrap">
        <Link href="/#overview" className="site-nav-brand" onClick={closeMenu}>
          <span className="site-nav-logo" aria-hidden="true">
            OE
          </span>
          <span>
            City ↔ Funder
            <small>Chile prototype</small>
          </span>
        </Link>

        <button
          type="button"
          className="site-nav-toggle"
          aria-expanded={menuOpen}
          aria-controls="site-nav-links"
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span className="sr-only">Menu</span>
          <i className={`site-nav-toggle-icon${menuOpen ? " open" : ""}`} />
        </button>

        <nav id="site-nav-links" className={`site-nav-links${menuOpen ? " open" : ""}`}>
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className={active === s.id ? "active" : undefined}
              onClick={closeMenu}
            >
              {s.label}
            </a>
          ))}
          <Link href="/tool" className="site-nav-cta" onClick={closeMenu}>
            Launch matcher
          </Link>
        </nav>
      </div>
    </header>
  );
}
