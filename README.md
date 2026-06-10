# OEF Hackdays

Open Earth Foundation's hackday monorepo. Each event lives in `apps/` as a self-contained project. Teams build, demo, and document here — everything in one place, forever.

## Current Event

### Hackday Q2 2026 — "Unlock the Money"

**Theme:** Build tools that make climate finance flow. If funders can't trust cities, money doesn't move. We build the trust layer.

**When:** 11 June 2026 15:00 GMT (kickoff) → 12 June 2026 15:00 GMT (demos)

**Format:** Teams of 2-4. One repo, many apps. Ship something demoable in 24h.

**Revenue angle:** Every project should answer: *"How does this help OEF or our partners unlock funding, close deals, or generate revenue?"*

---

## How to Start a New Hackday App

```bash
# 1. Copy the template
cp -r apps/_template apps/your-team-name

# 2. Update apps/your-team-name/README.md with your idea

# 3. Install & run (template ships as a Next.js app by default)
cd apps/your-team-name
npm install
npm run dev

# 4. Commit early, commit often. Push to a branch: hackday/your-team-name
git checkout -b hackday/your-team-name
```

You're free to use any stack (Python, Next.js, Streamlit, static HTML, whatever ships fastest). The template is just a starting point.

## Tooling Rules

| Rule | Why |
|------|-----|
| **Use Cursor as your IDE** | We're standardizing on AI-native development |
| **Use Claude (Code, Design, Chat)** | Test our new tool stack under real pressure |
| **Push to this repo** | One place for all hackday work, now and future |
| **Document as you go** | Your app's `README.md` is your demo script |

No other AI coding tools (Copilot, Windsurf, etc.) for this event — we want to stress-test one stack properly.

## Repo Structure

```
hackdays/
├── apps/
│   ├── _template/          # Copy this to start
│   ├── trust-score/        # Example: Carole's political will indicator
│   └── ...                 # Your team's app here
├── docs/
│   ├── THEME.md            # This hackday's theme & context
│   └── IDEAS.md            # Idea bank (add yours!)
├── .cursor/
│   └── rules/              # Shared Cursor rules for the repo
└── README.md               # You are here
```

## Resources

- [CityCatalyst POC Template](https://github.com/Open-Earth-Foundation/cc-poc-template) — if your app connects to CityCatalyst
- [Geo Layer Viewer](https://oef-geospatial-data.replit.app/) — geospatial data explorer
- [CityCatalyst Global API](https://github.com/Open-Earth-Foundation/CityCatalyst) — emissions data, city context

## Past Events

| Date | Theme | Apps |
|------|-------|------|
| 2026-06-11 | Unlock the Money | *in progress* |

---

## License

AGPL-3.0 — consistent with all OEF open-source projects.
