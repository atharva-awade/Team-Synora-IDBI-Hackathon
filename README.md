<div align="center">

# UdyamPulse

### An India-Stack-native MSME Financial Health Card

Turn a business's live economic heartbeat — GST, UPI, Account Aggregator, EPFO —
into an explainable credit decision in minutes.

</div>

---

## The problem

Banks evaluate MSME credit on traditional financial documents that most
New-to-Credit (NTC) and New-to-Bank (NTB) enterprises don't have. Despite rich
alternate data (GST, UPI, Account Aggregator, EPFO), there is no unified
assessment framework — so viable borrowers are rejected, portfolios stay thin,
and financial inclusion stalls. India has **63M+ MSMEs** and an estimated
**₹20–25 lakh crore** unmet credit gap.

## The solution

UdyamPulse aggregates consented alternate data through India-Stack rails and
computes a transparent, six-pillar **Pulse Score (0–100)** with a grade and a
cash-flow-based rupee credit offer. It is a glass box: every point is traceable
to a source event, so the borrower understands it and a regulator can audit it.

### Six pillars

| Pillar | Source | Weight |
|---|---|---|
| Cash-Flow Vitality | Account Aggregator + UPI | 25% |
| Business Momentum | GSTN (GSTR-1 / 3B) | 20% |
| Repayment Discipline | AA debits · NACH | 20% |
| Compliance & Formalization | GST · ITR · Udyam · TDS | 15% |
| Workforce Stability | EPFO · ECR | 10% |
| Digital & Ecosystem Footprint | UPI · AA counterparties | 10% |

### What it does

- **Consent-first onboarding** — Account Aggregator (DEPA) consent artifact; nothing pulled without granular, revocable consent.
- **Explainable score** — a per-pillar breakdown with plain-language reasons.
- **Path to a better grade** — a what-if simulator that turns a rejection into a concrete improvement plan.
- **Cash-flow-based underwriting** — a rupee working-capital offer from real surplus, not a balance sheet.
- **Trust Triangle** — cross-verifies GST vs bank credits vs UPI to catch inflated or round-tripped revenue.
- **Vernacular assistant** — explains the score in Hindi, Gujarati, Tamil and English.
- **Bank RM cockpit** — portfolio distribution, exposure at risk, and score-drift early-warnings 60–90 days ahead of default.

## Tech stack

- **React 19** + **TypeScript** + **Vite**
- **Tailwind CSS v4** (light/dark themes)
- **Framer Motion** (animation) · **Recharts** (data viz) · **lucide-react** (icons)
- **Supabase** (Postgres) for the assessment/decision audit trail — optional, with a resilient local fallback

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build
npm run preview  # preview the build
```

### Optional: connect Supabase

```bash
cp .env.example .env.local
# add your Supabase project URL and anon key
```

Then run [`supabase/schema.sql`](supabase/schema.sql) in the Supabase SQL editor.
Without these variables the app runs fully on its bundled datastore.

## Project structure

```
src/
├── lib/          scoring, what-if & anomaly engines, formatting, data access
├── data/         MSME registry, portfolio, consent & assistant content
├── components/   gauge, radar, waterfall, charts, tiles, shell
├── screens/      MSME journey + Bank RM cockpit
└── state/        app context (role, business, theme)
```

## License

MIT
