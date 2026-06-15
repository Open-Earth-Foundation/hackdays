"use client";

import { useRouter } from "next/navigation";
import { NavBack, ToolNav } from "@/components/tool/ToolNav";

const ROLES = [
  {
    id: "city",
    href: "/tool/city/wizard/1",
    icon: "ti-building-skyscraper",
    variant: "city",
    title: "City or municipality",
    description:
      "You represent a local government building a climate action plan. Walk through a three-step profile and get matched to funding instruments — with readiness gaps spelled out.",
    badges: ["3-step wizard", "Instrument matches", "Readiness gaps"],
    cta: "Start as a city",
  },
  {
    id: "funder",
    href: "/tool/funder/profile",
    icon: "ti-currency-dollar",
    variant: "funder",
    title: "Funder or investor",
    description:
      "You represent a development bank, climate fund, bilateral agency, or philanthropy. Set your mandate, browse credible city profiles, and send an expression of interest.",
    badges: ["Set criteria", "Browse cities", "Express interest"],
    cta: "Start as a funder",
  },
] as const;

export default function RoleSelectPage() {
  const router = useRouter();

  return (
    <>
      <ToolNav right={<NavBack href="/tool" label="Back to home" />} />
      <div className="role-page">
        <div className="container-sm role-page-inner">
          <p className="role-eyebrow">Step 1 · Choose your path</p>
          <h1 className="role-title">Who are you?</h1>
          <p className="role-lead">
            The matcher works both ways — cities find instruments, funders find projects. Pick the path
            that fits you; you can switch anytime from the navigation bar.
          </p>

          <div className="role-grid">
            {ROLES.map((role) => (
              <button
                key={role.id}
                type="button"
                className={`role-card role-card-${role.variant}`}
                onClick={() => router.push(role.href)}
              >
                <div className={`role-icon ${role.variant}`}>
                  <i className={`ti ${role.icon}`} />
                </div>
                <h3>{role.title}</h3>
                <p>{role.description}</p>
                <div className="role-badges">
                  {role.badges.map((badge) => (
                    <span key={badge} className="badge badge-green">
                      {badge}
                    </span>
                  ))}
                </div>
                <span className="role-card-cta">
                  {role.cta} <i className="ti ti-arrow-right" />
                </span>
              </button>
            ))}
          </div>

          <p className="role-hint">
            <i className="ti ti-info-circle" />
            Demo uses sample city data globally; the Chile engine demo on the home page shows live comuna pooling.
          </p>
        </div>
      </div>
    </>
  );
}
