# Security

## Secret Handling
- Stripe secret key + webhook signing secret live in **Vercel environment variables** (server-side only). Never in frontend code.
- OpenAI API key in server env only.
- Supabase service-role key in server env only — never exposed to browser.
- Frontend uses Supabase anon key with RLS policies.

## Permission Model
- **v1 (demo-first):** All tables open read/write for anonymous demo. Seed data renders without login.
- **Lock-down sprint:** Replace permissive policies with `auth.uid() = user_id` — users see only their own profiles, line items, reports, and payments. Reports are accessible via unique URL id (unguessable UUID) even without login (the visitor who created it can return).

## Approved-Tools Rule
Only these server-side functions touch the DB:
- `generate_report(profile_id)`
- `process_stripe_webhook(payload, signature)`
- `fetch_report(report_id)`
No generic `run_query` or `exec_sql` exposed to the client or agent.

## Audit Principle
Every state-changing action (report generation, payment success, payment failure) writes to `audit_logs`. Logs are append-only. No PII beyond user_id.

## Payments Safety
- Payment > ₹0 is always **high risk** — but here the flow is user-initiated via Stripe hosted checkout (not agent-initiated). The webhook verifies Stripe signature before marking `is_paid = true`.
- Refunds are human-only — no code path to issue a refund.
- If Stripe webhook handling is beyond the builder's comfort, **stop and get a human** before going live with real charges.
