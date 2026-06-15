"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";

const QUICK_LINKS = [
  { href: "/tool", label: "Home", match: (p: string) => p === "/tool" },
  { href: "/tool/role", label: "Choose role", match: (p: string) => p === "/tool/role" },
  { href: "/tool/city/wizard/1", label: "City matcher", match: (p: string) => p.startsWith("/tool/city") },
  { href: "/tool/funder/search", label: "Funder browse", match: (p: string) => p.startsWith("/tool/funder") },
  { href: "/", label: "Chile demo", match: (p: string) => p === "/" },
] as const;

export function ToolNav({
  homeHref = "/tool",
  right,
  showQuickLinks = true,
}: {
  homeHref?: string;
  right?: ReactNode;
  showQuickLinks?: boolean;
}) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav>
      <div className="container nav-inner">
        <Link href={homeHref} className="logo" style={{ textDecoration: "none" }} onClick={closeMenu}>
          <div className="logo-icon">
            <i className="ti ti-leaf" />
          </div>
          <span>
            Unlock Funding
            <small>Climate finance matcher</small>
          </span>
        </Link>

        {showQuickLinks && (
          <>
            <button
              type="button"
              className="nav-menu-toggle"
              aria-expanded={menuOpen}
              aria-controls="tool-nav-links"
              onClick={() => setMenuOpen((o) => !o)}
            >
              <span className="sr-only">Menu</span>
              <i className={`ti ${menuOpen ? "ti-x" : "ti-menu-2"}`} />
            </button>

            <div id="tool-nav-links" className={`nav-quick-links${menuOpen ? " open" : ""}`}>
              {QUICK_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`nav-quick-link${link.match(pathname) ? " active" : ""}`}
                  onClick={closeMenu}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </>
        )}

        {right && <div className="nav-right">{right}</div>}
      </div>
    </nav>
  );
}

export function NavBack({ href, label = "Back" }: { href: string; label?: string }) {
  return (
    <Link href={href} className="nav-back" style={{ textDecoration: "none" }}>
      <i className="ti ti-arrow-left" /> {label}
    </Link>
  );
}
