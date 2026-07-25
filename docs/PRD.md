# Financial Blueprint Builder — PRD

## Problem
Middle-income earners can't use most financial planning tools — they're full of jargon and too complex. People need a simple, plain-English tool to lay out their finances and get a clear blueprint.

## Target User
Middle-income earners (₹40k–₹2L/month). Not finance-savvy. Wants clarity, not a spreadsheet.

## Core Objects
- **Profile** — a person's financial snapshot (name, goal, target date).
- **Line Item** — one entry: income, expense, asset, or liability (type, label, amount, frequency).
- **Report** — generated blueprint: net worth, cash flow, savings rate, plain-English summary, recommendations.
- **Payment** — checkout record for full report unlock.

## MVP (v1) — checklist
- [ ] Homepage IS the tool — enter income, expenses, assets, liabilities in plain-English forms (no login wall).
- [ ] Live summary: net worth, monthly cash flow, savings rate — recalculated on every change.
- [ ] Generate blueprint report: plain-English summary + 3–5 recommendations based on the numbers.
- [ ] Free report shows summary + first recommendation; full report behind a paywall (₹299 checkout).
- [ ] Stripe checkout that unlocks the full report after payment.
- [ ] Report persists to DB and is re-accessible via link.

## Non-goals (v1)
- Account login / user dashboard (later).
- Budgeting / recurring tracking over time.
- Investment recommendations / stock picking.
- Multi-user or family plans.
- PDF export (later).

## Success Criteria
A visitor lands with no login, enters 8–10 line items, sees a live financial summary, clicks "Generate Blueprint," sees a free preview, pays ₹299 via Stripe, and the full report with recommendations unlocks — all persisted and re-accessible.
