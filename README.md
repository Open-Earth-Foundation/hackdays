# OEF Hackdays

The **single home** for every Open Earth Foundation hackday — past, present, and future. One repo, all events, all teams, all apps.

## How This Repo is Organized

```
hackdays/
├── events/                          ← one folder per hackday event
│   ├── 2026-06-11-unlock-the-money/ ← example: Q2 2026 hackday
│   │   ├── README.md                ← theme, schedule, teams, results
│   │   ├── IDEAS.md                 ← idea bank for this event
│   │   └── apps/                    ← all team apps for this event
│   │       ├── _template/           ← copy this to start
│   │       ├── team-alpha/
│   │       └── team-beta/
│   └── 2026-09-xx-next-event/       ← next hackday goes here
├── templates/                       ← reusable app starters (Next.js, Python, etc.)
├── docs/                            ← evergreen guides (how to use Cursor, git basics, etc.)
├── GETTING-STARTED.md               ← START HERE if you're new
└── README.md                        ← you are here
```

## Quick Links

| What | Where |
|------|-------|
| **I'm new, help!** | [GETTING-STARTED.md](./GETTING-STARTED.md) |
| **Current event** | [events/2026-06-11-unlock-the-money/](./events/2026-06-11-unlock-the-money/) |
| **How to use Cursor + Claude** | [docs/cursor-guide.md](./docs/cursor-guide.md) |
| **App templates** | [templates/](./templates/) |

## Starting a New Hackday Event

If you're organizing the next hackday:

1. Create a new folder: `events/YYYY-MM-DD-event-name/`
2. Copy the structure from a previous event (README.md, IDEAS.md, apps/_template/)
3. Update the "Current event" link in this README
4. Announce in Slack with the link to the event README

## Ground Rules (All Events)

1. **One repo.** All hackday work lives here. No separate repos.
2. **One branch per team.** Format: `hackday/YYYY-MM-DD/team-name` (e.g., `hackday/2026-06-11/trust-score`)
3. **Cursor + Claude.** Our standard AI-assisted development stack.
4. **Document as you build.** Your README is your demo.
5. **Ship > polish.** Working > beautiful. Visible > invisible.

## Past Events

| Date | Theme | Teams | Highlights |
|------|-------|-------|------------|
| 2026-06-11 | Unlock the Money | *in progress* | — |

---

## License

AGPL-3.0
