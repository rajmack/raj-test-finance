# Agentic Layer

## Draftable Actions (low risk — auto)
- **Generate report summary** — AI writes plain-English summary from computed metrics. Source: 'ai', confidence set by model. Auto-saved; user reads immediately.
- **Draft recommendations** — rule engine produces recommendation list; AI polishes wording. Marked `review_status = 'unreviewed'`.

## Executable After Approval (medium risk)
- **Mark report paid** — triggered by Stripe webhook, not by user action. Requires valid `stripe_session_id` match.

## Human-Only Actions (critical risk)
- **Issue refund** — never automated. Human reviews via Stripe dashboard.
- **Delete profile + all data** — manual SQL only.

## Named Tools
- `generate_report` — takes profile_id, computes metrics, calls AI for summary, persists report.
- `process_stripe_webhook` — verifies Stripe signature, updates payment + report status.
- `fetch_report` — retrieves report by id; gates full recommendations behind `is_paid`.

No raw `run_any` / `send_any` tools. Only the three named above.

## Audit Log Fields
Every meaningful action writes to `audit_logs` (platform table):
| field | type |
|---|---|
| action | text (e.g., 'report.generated', 'report.paid') |
| actor | text (user_id or 'anonymous') |
| target_id | uuid |
| metadata | jsonb |
| created_at | timestamptz |

## v1 vs Later
- **v1:** `generate_report` + `process_stripe_webhook` + `fetch_report`. No proactive agent.
- **Later:** Scheduled follow-up nudges ("Your savings rate improved!"), goal-reminder emails, scenario simulations.
