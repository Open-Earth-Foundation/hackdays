# Civic Climate Action — Demo Script

**What it is (one line):** A citizen-facing companion to CityCatalyst that turns top-down city climate data into one real, doable civic action — and turns that participation into a measurable, fundable engagement signal. Pilot: **Porto Alegre**.

---

## 1. Problem & who feels the pain (30s)

CityCatalyst tells **city governments** what to do about climate. But two groups are stuck:

- **Residents** can see their city is at risk but have no idea how to actually act. Generic advice ("join a group", "contact the council") stops exactly where the hard part — *where do I start, what do I say?* — begins.
- **Funders** (MDBs, the IDB, philanthropy) need proof a city's community is engaged before they release money. Today that proof is anecdotal, so good projects stall.

Same gap, both sides: civic engagement is real but **invisible and unusable**.

---

## 2. Demo — show, don't tell (≈3 min)

> Live at `localhost:3001`. Pilot city: Porto Alegre.

1. **Home → "What's at stake"** (~20s): Porto Alegre's real risk, straight from CityCatalyst — **Floods & Landslides: Very High**, transport = 77% of emissions. This is the city's own data, in plain language.
2. **"Your move" → pick *Flooding* → *Quick & online*** (~30s): Instead of vague advice, **one concrete move**: *"Report a flooding or drainage problem on your street to Defesa Civil"* — the **real channel** (working link), a time estimate (~10 min), **Why this helps**, and **What happens next**.
3. **The AI toolkit — two tabs** (~45s):
   - **✉️ Ready-to-send message:** an AI-written, copy-ready message in PT (toggle EN), grounded in the real channel — no filler, no lecturing the recipient.
   - **🧭 Guide me:** a civic-coach **chat** that builds a *toolkit* from all the available next steps + partner orgs — **what to do, how, and why** — and answers follow-ups ("how do I run a block meeting?", "what if I get no reply?"). It's constrained to the real local channels/orgs only — it won't invent contacts.
   - Point at the **carbon figure** (~0.01–0.03 g CO₂e per reply) — see the green-AI note below.
4. **"Team up with people already doing this"** (~15s): real Porto Alegre / RS organizations — **Parceiros Voluntários, BrazilFoundation, AGAPAN, Bike Anjo** — with concrete plug-ins: **Volunteer / Attend / Back a campaign / Donate**. Not just a contact link.
5. **"I care about this"** (~30s): add name + neighborhood (email optional). The message **auto-fills with your details** (it's now genuinely yours), and you get a **tracker** — *Committed → Sent → Got a response* — plus a dated **receipt**. A signature, not a throwaway click.
6. **"On the record"** (~25s): a **map of Porto Alegre** with engagement by neighborhood, a **"Most-backed actions" ranking** (Flooding 33 · Heat 19 · Landslides 15…), and a live **commitment wall** of named residents.
7. **"For funders" page** (~30s): the punchline — the **live readout**: total signed commitments, **follow-through rate**, demand **by climate priority** (mapped to the CCRA risk levels) and **by neighborhood**, the local orgs who can **deliver**, and **what each theme could unlock**.

### Under the hood — green AI, measured (≈15s aside)

- **Model choice:** an **open-weight ~24B model (Mistral Small)** — small and capable enough for grounded, templated writing; we don't need a frontier model. Provider is swappable by env (Scaleway / GreenPT / Mistral / Salamandra).
- **Hosting:** served on **Scaleway's low-carbon EU grid** (~52 gCO₂e/kWh) — green by default, not as an afterthought.
- **Carbon tracking:** every call is measured with **EcoLogits** (by the GenAI Impact non-profit) — energy (Wh) + emissions (gCO₂e) shown **per reply** and totalled in the session **carbon counter**. Honest caveats: figures are estimates (it falls back to a token-based estimate for models outside EcoLogits' registry), and if the model is offline the app serves a **graceful templated fallback** so the demo never breaks.

---

## 3. Business value — who pays / premium feature / funder trust / 💰

**The unlock:** civic participation is a co-benefit funders **already score** (CityCatalyst's HIAP rates *stakeholder engagement* −2..+2). We make it **visible, sourced, and continuous** — which is exactly what moves money:

- **Raises the co-benefit score** → a more fundable project.
- **De-risks disbursement** → named, located demand + follow-through answers a credit committee's "will the community actually use this?"
- **Satisfies the readiness/consultation gate** → produces the stakeholder-engagement record many funds *require*, continuously instead of as a one-off survey.

**Who pays / how it makes money:**

- **Premium CityCatalyst add-on:** free public citizen view; **paid white-label civic dashboards** for cities & consultancies.
- **Grant-funded pilots:** 3–5 cities already on CityCatalyst (Brazil-first).
- **MDB / IDB co-financing:** sold as the **"community-engagement component"** inside climate project-preparation programs.
- **Differentiation:** most city-climate tools serve governments only — this serves **citizens**, differentiating CityCatalyst across the **IDB Cities Network (300+ LAC cities)**.

---

## 4. What's left to reach prod (honest)

- **Data (the real cost):** local channels + partner orgs are **hand-curated for Porto Alegre only**. Scaling = per-city research + link verification + neighborhood geocoding. Some themes (e.g. energy) have thin org coverage today.
- **Integration:** swap baked-in CityCatalyst figures for **live API fetch**; replace the file-backed pledge store with a **real database**; add **identity/auth + anti-abuse** so the tally is trustworthy; wire **email follow-up**; ideally connect to real consultation platforms (Participe+, Orçamento Participativo).
- **Trust/verification:** follow-through is currently **self-reported** (a proxy MRV) and demo numbers include a clearly-labelled seeded baseline — production needs verified signals.
- **Effort:** ~weeks to harden one city end-to-end; the multi-city onboarding pipeline is the larger lift.

---

## 5. The ask — what we need to keep going

- **One pilot city** already on CityCatalyst (Porto Alegre or another BR municipality) as a design partner.
- **An intro to an MDB / IDB contact** to validate the co-benefit-as-fundable-evidence framing with a real appraisal process.
- **Eng time** to wire live CityCatalyst data + a real datastore + auth.
- **A small grant / owner** for local-org curation across the first 3–5 cities.
- **A decision:** does this become a supported **CityCatalyst module**?

---

## 6. The hardest part of this hackday for me

<!-- (to fill in) -->
