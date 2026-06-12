import Link from "next/link";

export default function TopBar({ active }: { active: "city" | "pipeline" }) {
  return (
    <div className="topbar">
      <div className="brand">
        City<span>Catalyst</span> · Readiness Navigator
      </div>
      <span className="pill-tag">IDB SFP</span>
      <div className="spacer" />
      <nav>
        <Link href="/" className={active === "city" ? "active" : ""}>
          City journey
        </Link>
        <Link href="/pipeline" className={active === "pipeline" ? "active" : ""}>
          Funder pipeline →
        </Link>
      </nav>
    </div>
  );
}
