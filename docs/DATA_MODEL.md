# Data Model

## `profiles`
A visitor's financial snapshot.

| field | type | notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid | nullable — owner at lock-down |
| display_name | text | e.g., "Raj's Plan" |
| goal_label | text | plain English, e.g., "Buy a house in 5 years" |
| target_year | int | nullable |
| currency | text | default 'INR' |
| created_at | timestamptz | default now() |

## `line_items`
Income, expense, asset, or liability entries tied to a profile.

| field | type | notes |
|---|---|---|
| id | uuid PK | |
| profile_id | uuid | FK → profiles.id (ON DELETE CASCADE) |
| user_id | uuid | nullable — owner at lock-down |
| kind | text | check in ('income','expense','asset','liability') |
| label | text | plain-English user input, e.g., "Salary" |
| amount | numeric(14,2) | positive number |
| frequency | text | check in ('monthly','yearly','one_time') — default 'monthly' |
| created_at | timestamptz | default now() |

## `reports`
The generated blueprint.

| field | type | notes |
|---|---|---|
| id | uuid PK | |
| profile_id | uuid | FK → profiles.id (ON DELETE CASCADE) |
| user_id | uuid | nullable — owner at lock-down |
| net_worth | numeric(14,2) | server-derived: sum(assets) − sum(liabilities) |
| monthly_income | numeric(14,2) | server-derived |
| monthly_expense | numeric(14,2) | server-derived |
| monthly_surplus | numeric(14,2) | income − expense |
| savings_rate | numeric(5,2) | (surplus / income) × 100 |
| summary_text | text | AI-generated plain-English summary. **AI field**: value + source + confidence + review_status. |
| summary_source | text | 'ai' or 'template' |
| summary_confidence | numeric(3,2) | 0–1 |
| review_status | text | default 'unreviewed' |
| recommendations | jsonb | array of {title, detail, priority}. AI-polished, rule-based content. Same AI field pattern applies (source/confidence on report-level). |
| is_paid | boolean | default false |
| stripe_session_id | text | nullable |
| created_at | timestamptz | default now() |

## `payments`
Stripe checkout records.

| field | type | notes |
|---|---|---|
| id | uuid PK | |
| report_id | uuid | FK → reports.id |
| user_id | uuid | nullable |
| stripe_session_id | text | unique |
| amount | numeric(10,2) | e.g., 299.00 |
| currency | text | 'INR' |
| status | text | check in ('pending','paid','failed') |
| created_at | timestamptz | default now() |

## Relationships
``nprofiles 1───∞ line_items
profiles 1───∞ reports
reports  1───∞ payments
```

## RLS / Permissions (v1 — demo-first)
All tables: open read + write for anonymous demo. Lock-down sprint replaces with `auth.uid() = user_id` policies.
