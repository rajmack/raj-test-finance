# Architecture

## Stack
- **Frontend:** Next.js (App Router) on Vercel.
- **Database:** Supabase Postgres.
- **Payments:** Stripe Checkout (hosted page).
- **AI:** OpenAI for report summary + recommendations (optional layer — core math runs without it).

## Build Sequence

### Now (v1)
1. Financial input forms (income/expense/asset/liability) → live summary.
2. Blueprint report generation (math + plain-English text).
3. Stripe checkout → unlock full report.

### Next
- User accounts + saved profiles.
- Report history dashboard.
- PDF export.

### Later
- Recurring transaction tracking.
- Goal-based scenario planning.
- Email follow-up nudges.

## Key User Flow (step by step)
1. Visitor lands on homepage (the app, no login).
2. Fills income form (e.g., "Salary ₹75,000/month").
3. Fills expenses ("Rent ₹18,000", "Groceries ₹8,000"...).
4. Fills assets ("Savings ₹2,00,000", "Car ₹3,50,000").
5. Fills liabilities ("Car loan ₹1,80,000").
6. Live summary panel shows: net worth, monthly surplus, savings rate.
7. Clicks **Generate Blueprint** → report created in DB.
8. Free preview shows: summary + savings rate + 1st recommendation.
9. Clicks **Unlock Full Report (₹299)** → Stripe checkout.
10. On payment success → report row marked `paid=true` → full report with all recommendations visible.
11. Unique report URL is bookmarkable and re-accessible.

## Layer Plan
1. **Data:** profiles, line_items, reports, payments — all in Postgres with constraints.
2. **Logic:** Financial calculations (net worth, cash flow, savings rate, recommendation rules) in server-side functions — runs with zero AI.
3. **Smart:** AI generates the plain-English summary paragraph and reframes recommendations in natural language. Falls back to template text if AI is off.

## Why the core runs without AI
All financial math is deterministic (sum income, sum expenses, net worth = assets − liabilities, savings rate = surplus / income). Recommendations are rule-based thresholds. AI only polishes the wording.
