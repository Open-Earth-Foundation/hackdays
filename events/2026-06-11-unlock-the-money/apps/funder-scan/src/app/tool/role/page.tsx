"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { NavBack, ToolNav } from "@/components/tool/ToolNav";

export default function RoleSelectPage() {
  const router = useRouter();

  return (
    <>
      <ToolNav />
      <div className="container-sm" style={{ paddingTop: 60, paddingBottom: 60 }}>
        <NavBack href="/tool" />
        <h1 style={{ fontSize: 28, fontWeight: 700, marginTop: 24, marginBottom: 8 }}>Who are you?</h1>
        <p style={{ color: "var(--text-muted)", marginBottom: 32 }}>
          Choose your role to get a tailored experience — city officer seeking funding, or funder
          looking for investable projects.
        </p>

        <div className="role-grid">
          <button
            type="button"
            className="role-card"
            onClick={() => router.push("/tool/city/wizard/1")}
            style={{ border: "2px solid var(--border)", background: "var(--card)", font: "inherit", width: "100%" }}
          >
            <div className="role-icon city">
              <i className="ti ti-building-skyscraper" style={{ color: "var(--blue)" }} />
            </div>
            <h3>I represent a city</h3>
            <p>Find funding instruments that match your climate action plan and city profile.</p>
            <div style={{ marginTop: 16 }}>
              <span className="badge badge-blue">Create city profile</span>
              <span className="badge badge-blue" style={{ marginLeft: 6 }}>
                Match with funders
              </span>
            </div>
          </button>

          <button
            type="button"
            className="role-card"
            onClick={() => router.push("/tool/funder/profile")}
            style={{ border: "2px solid var(--border)", background: "var(--card)", font: "inherit", width: "100%" }}
          >
            <div className="role-icon funder">
              <i className="ti ti-currency-dollar" style={{ color: "var(--green)" }} />
            </div>
            <h3>I represent a funder</h3>
            <p>Discover cities with credible, investable climate projects that fit your mandate.</p>
            <div style={{ marginTop: 16 }}>
              <span className="badge badge-green">Browse cities</span>
              <span className="badge badge-green" style={{ marginLeft: 6 }}>
                Set criteria
              </span>
            </div>
          </button>
        </div>

        <p style={{ marginTop: 32, fontSize: 14, color: "var(--text-muted)" }}>
          <Link href="/tool">← Back to home</Link>
        </p>
      </div>
    </>
  );
}
