import Link from "next/link";
import { ToolNav } from "@/components/tool/ToolNav";

export default function ToolLandingPage() {
  return (
    <>
      <ToolNav />
      <div className="hero">
        <div className="container">
          <h1>
            Connect cities with
            <br />
            climate finance
          </h1>
          <p>A platform linking cities ready for climate action with the funders ready to back them.</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              href="/tool/role"
              className="btn btn-lg"
              style={{ background: "white", color: "var(--green-dark)", fontWeight: 600, textDecoration: "none" }}
            >
              Get started <i className="ti ti-arrow-right" />
            </Link>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 60, paddingBottom: 60 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
            gap: 24,
            marginBottom: 60,
          }}
        >
          {[
            { icon: "ti-building-community", color: "var(--green)", stat: "142", label: "Cities seeking funding" },
            { icon: "ti-cash", color: "var(--blue)", stat: "$4.2B", label: "Available funding", statColor: "var(--blue-dark)" },
            { icon: "ti-building-bank", color: "var(--amber)", stat: "38", label: "Funders active", statColor: "#633806" },
            { icon: "ti-plant-2", color: "var(--green)", stat: "67Mt", label: "CO₂ reduction potential" },
          ].map((c) => (
            <div key={c.label} className="card" style={{ textAlign: "center", padding: "32px 20px" }}>
              <i className={`ti ${c.icon}`} style={{ fontSize: 36, color: c.color, display: "block", marginBottom: 12 }} />
              <div style={{ fontSize: 28, fontWeight: 700, color: c.statColor ?? "var(--green-dark)" }}>{c.stat}</div>
              <div style={{ color: "var(--text-muted)", fontSize: 14 }}>{c.label}</div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 24 }}>TRUSTED BY LEADING ORGANIZATIONS</p>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 24,
              justifyContent: "center",
              alignItems: "center",
              opacity: 0.5,
            }}
          >
            {["C40 Cities", "World Bank", "GCF", "EBRD", "Bloomberg Philanthropies"].map((n) => (
              <span key={n} style={{ fontWeight: 600, fontSize: 15 }}>
                {n}
              </span>
            ))}
          </div>
        </div>
        <p style={{ textAlign: "center", marginTop: 40, fontSize: 14 }}>
          <Link href="/" style={{ color: "var(--green)" }}>
            ← Back to Chile engine demo
          </Link>
        </p>
      </div>
    </>
  );
}
