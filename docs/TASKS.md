# Tasks

## Sprint 1 — Core Engine + Live Summary (no login)
**Goal:** A visitor enters financial data and sees a live computed summary.
- [ ] Set up Next.js + Supabase project; run migration SQL.
- [ ] Profile create form (display name, goal label, target year).
- [ ] Line item forms: income, expense, asset, liability (add/remove, persisted).
- [ ] Live summary panel: net worth, monthly surplus, savings rate — computed client-side from DB rows.
- [ ] Seed 3 demo profiles with realistic line items so homepage renders.
- [ ] Empty/loading/error states for all forms.
**Done:** Visitor enters 6+ line items and sees correct net worth, surplus, savings rate — persisted across refresh.

## Sprint 2 — Blueprint Report Generation (v1 functional milestone)
**Goal:** Generate a plain-English blueprint report from the financial data.
- [ ] Server function `generate_report`: compute metrics, build rule-based recommendations, call AI for summary (fallback template).
- [ ] Report view page: summary text, metric cards, recommendation cards (sorted by priority).
- [ ] Free preview: summary + first recommendation only; rest blurred with paywall CTA.
- [ ] "Generate Blueprint" button on summary panel → creates report → redirect to report page.
- [ ] Report persists to DB; unique URL re-accessible.
- [ ] Empty/error/loading states on report page.
**Done:** Visitor generates a report, sees a free preview with real summary + 1 recommendation, and can revisit the URL. ← **v1 functional milestone**

## Sprint 3 — Paid Checkout
**Goal:** Charge ₹299 to unlock the full report.
- [ ] Stripe account setup; price created (₹299 INR).
- [ ] "Unlock Full Report (₹299)" button → Stripe Checkout (hosted page).
- [ ] Stripe webhook endpoint → verify signature → insert payment row → set `reports.is_paid = true`.
- [ ] Report page gates full recommendations behind `is_paid`; shows paywall CTA if false.
- [ ] Success redirect back to unlocked report.
- [ ] Handle payment failure state.
**Done:** Visitor pays ₹299 via Stripe, full report unlocks, payment record in DB, report URL shows full report on revisit.

## Sprint 4 — Lock It Down (auth + owner-scoped RLS)
**Goal:** Per-user data isolation before real users.
- [ ] Supabase Auth: signup/login (email + Google).
- [ ] Replace v1 permissive RLS policies with `auth.uid() = user_id` on profiles, line_items, reports, payments.
- [ ] Set `user_id` on all new rows from authenticated session.
- [ ] Anonymous visitors can still view a shared report URL (read report by id).
- [ ] My Profiles page (list own profiles + reports).
**Done:** Logged-in user sees only their own profiles/reports; anonymous report URL still works; demo data no longer world-writable.

## Sprint 5 — Polish + Edge Cases
- [ ] Onboarding copy: plain-English helper text on every input.
- [ ] Mobile responsive pass.
- [ ] Print-friendly report page (CSS print styles).
- [ ] Error boundary + toast notifications.
- [ ] Analytics events wired.
**Done:** App looks clean on mobile, all error states handled, print works.

## Text Gantt
```
S1  ████████  Core engine + live summary
S2  ████████  Blueprint report generation  ← v1 functional
S3  ████████  Stripe paid checkout
S4  ████████  Lock down (auth + RLS)
S5  ████████  Polish + edge cases
```
