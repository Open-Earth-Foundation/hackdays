import Link from "next/link";

const navItems = [
  { label: "Dashboard", href: "#" },
  { label: "GHGI", href: "#" },
  { label: "HIAP", href: "/cities/warsaw/hiap", active: true },
  { label: "CCRA", href: "#" },
];

export function AppHeader() {
  return (
    <header
      style={{
        background: "#fff",
        borderBottom: "1px solid var(--color-border)",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: 1440,
          margin: "0 auto",
          padding: "0 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 56,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
          <Link
            href="/cities/warsaw/hiap"
            style={{
              fontWeight: 700,
              fontSize: "1.05rem",
              color: "var(--color-text)",
              textDecoration: "none",
            }}
          >
            CityCatalyst
          </Link>
          <nav style={{ display: "flex", gap: 4 }}>
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                style={{
                  padding: "8px 14px",
                  borderRadius: 6,
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: item.active ? "var(--color-primary)" : "var(--color-text-muted)",
                  textDecoration: "none",
                  borderBottom: item.active ? "2px solid var(--color-primary)" : "2px solid transparent",
                }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, color: "var(--color-text-muted)" }}>
          <span style={{ fontSize: "0.875rem" }}>🌐 EN</span>
          <span>?</span>
          <span
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "#e2e8f0",
              display: "grid",
              placeItems: "center",
              fontSize: "0.75rem",
              fontWeight: 600,
            }}
          >
            AM
          </span>
        </div>
      </div>
    </header>
  );
}
