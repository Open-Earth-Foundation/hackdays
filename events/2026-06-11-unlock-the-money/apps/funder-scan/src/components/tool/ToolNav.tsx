"use client";

import Link from "next/link";
import type { ReactNode } from "react";

export function ToolNav({
  homeHref = "/tool",
  right,
}: {
  homeHref?: string;
  right?: ReactNode;
}) {
  return (
    <nav>
      <div className="container nav-inner">
        <Link href={homeHref} className="logo" style={{ textDecoration: "none" }}>
          <div className="logo-icon">
            <i className="ti ti-leaf" />
          </div>
          Unlock Funding
        </Link>
        {right}
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
