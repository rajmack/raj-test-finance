create extension if not exists pgcrypto;

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  display_name text not null,
  goal_label text,
  target_year int,
  currency text not null default 'INR',
  created_at timestamptz not null default now()
);

create table if not exists line_items (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  user_id uuid,
  kind text not null check (kind in ('income','expense','asset','liability')),
  label text not null,
  amount numeric(14,2) not null check (amount >= 0),
  frequency text not null default 'monthly' check (frequency in ('monthly','yearly','one_time')),
  created_at timestamptz not null default now()
);

create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  user_id uuid,
  net_worth numeric(14,2) not null default 0,
  monthly_income numeric(14,2) not null default 0,
  monthly_expense numeric(14,2) not null default 0,
  monthly_surplus numeric(14,2) not null default 0,
  savings_rate numeric(5,2) not null default 0,
  summary_text text,
  summary_source text default 'template',
  summary_confidence numeric(3,2) default 0,
  review_status text default 'unreviewed',
  recommendations jsonb default '[]'::jsonb,
  is_paid boolean not null default false,
  stripe_session_id text,
  created_at timestamptz not null default now()
);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references reports(id) on delete cascade,
  user_id uuid,
  stripe_session_id text unique,
  amount numeric(10,2) not null default 299.00,
  currency text not null default 'INR',
  status text not null default 'pending' check (status in ('pending','paid','failed')),
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;
alter table line_items enable row level security;
alter table reports enable row level security;
alter table payments enable row level security;

drop policy if exists "profiles_v1_read" on profiles;
create policy "profiles_v1_read" on profiles for select using (true);
drop policy if exists "profiles_v1_write" on profiles;
create policy "profiles_v1_write" on profiles for all using (true) with check (true);

drop policy if exists "line_items_v1_read" on line_items;
create policy "line_items_v1_read" on line_items for select using (true);
drop policy if exists "line_items_v1_write" on line_items;
create policy "line_items_v1_write" on line_items for all using (true) with check (true);

drop policy if exists "reports_v1_read" on reports;
create policy "reports_v1_read" on reports for select using (true);
drop policy if exists "reports_v1_write" on reports;
create policy "reports_v1_write" on reports for all using (true) with check (true);

drop policy if exists "payments_v1_read" on payments;
create policy "payments_v1_read" on payments for select using (true);
drop policy if exists "payments_v1_write" on payments;
create policy "payments_v1_write" on payments for all using (true) with check (true);

insert into profiles (id, display_name, goal_label, target_year) values
  ('a0000000-0000-0000-0000-000000000001', 'Raj''s Plan', 'Buy a house in 5 years', 2029),
  ('a0000000-0000-0000-0000-000000000002', 'Priya''s Plan', 'Save for kids education', 2031),
  ('a0000000-0000-0000-0000-000000000003', 'Amit''s Plan', 'Retire by 55', 2044)
on conflict (id) do nothing;

insert into line_items (profile_id, kind, label, amount, frequency) values
  ('a0000000-0000-0000-0000-000000000001', 'income', 'Salary', 75000, 'monthly'),
  ('a0000000-0000-0000-0000-000000000001', 'income', 'Freelance', 15000, 'monthly'),
  ('a0000000-0000-0000-0000-000000000001', 'expense', 'Rent', 18000, 'monthly'),
  ('a0000000-0000-0000-0000-000000000001', 'expense', 'Groceries', 8000, 'monthly'),
  ('a0000000-0000-0000-0000-000000000001', 'expense', 'Fuel', 4000, 'monthly'),
  ('a0000000-0000-0000-0000-000000000001', 'expense', 'School fees', 6000, 'monthly'),
  ('a0000000-0000-0000-0000-000000000001', 'asset', 'Savings account', 200000, 'one_time'),
  ('a0000000-0000-0000-0000-000000000001', 'asset', 'Car', 350000, 'one_time'),
  ('a0000000-0000-0000-0000-000000000001', 'asset', 'Mutual funds', 500000, 'one_time'),
  ('a0000000-0000-0000-0000-000000000001', 'liability', 'Car loan', 180000, 'one_time'),
  ('a0000000-0000-0000-0000-000000000001', 'liability', 'Credit card', 45000, 'one_time'),
  ('a0000000-0000-0000-0000-000000000002', 'income', 'Salary', 95000, 'monthly'),
  ('a0000000-0000-0000-0000-000000000002', 'expense', 'Rent', 22000, 'monthly'),
  ('a0000000-0000-0000-0000-000000000002', 'expense', 'Groceries', 10000, 'monthly'),
  ('a0000000-0000-0000-0000-000000000002', 'asset', 'Savings', 350000, 'one_time'),
  ('a0000000-0000-0000-0000-000000000002', 'liability', 'Education loan', 300000, 'one_time'),
  ('a0000000-0000-0000-0000-000000000003', 'income', 'Business income', 120000, 'monthly'),
  ('a0000000-0000-0000-0000-000000000003', 'expense', 'Home loan EMI', 28000, 'monthly'),
  ('a0000000-0000-0000-0000-000000000003', 'expense', 'Living expenses', 20000, 'monthly'),
  ('a0000000-0000-0000-0000-000000000003', 'asset', 'House', 6500000, 'one_time'),
  ('a0000000-0000-0000-0000-000000000003', 'asset', 'Savings', 800000, 'one_time'),
  ('a0000000-0000-0000-0000-000000000003', 'liability', 'Home loan', 3500000, 'one_time');

insert into reports (id, profile_id, net_worth, monthly_income, monthly_expense, monthly_surplus, savings_rate, summary_text, summary_source, summary_confidence, review_status, recommendations, is_paid) values
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 825000, 90000, 36000, 54000, 60.00, 'You are saving 60% of your income — excellent. Your net worth is positive at ₹8,25,000. Your emergency fund covers about 23 months of expenses, which is very strong. Focus on clearing your credit card balance of ₹45,000 first as it likely carries the highest interest.', 'ai', 0.92, 'reviewed', '[{"title":"Clear credit card debt first","detail":"Your ₹45,000 credit card balance likely has the highest interest rate. Pay it off immediately with your monthly surplus.","priority":"high"},{"title":"Build a retirement corpus","detail":"With a 60% savings rate, channel surplus into index funds or PF to compound toward your house goal.","priority":"medium"},{"title":"Review car loan terms","detail":"Check if you can prepay part of the ₹1,80,000 car loan to reduce interest burden.","priority":"low"}]', true),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 50000, 95000, 32000, 63000, 66.00, 'You have a strong savings rate of 66% and a positive net worth. Your education loan of ₹3,00,000 is your main liability. With your current surplus you could clear it in about 5 months if you directed all surplus toward it.', 'ai', 0.88, 'reviewed', '[{"title":"Pay down education loan aggressively","detail":"Direct your ₹63,000 monthly surplus to clear the ₹3L education loan in ~5 months.","priority":"high"},{"title":"Start SIP for kids education","detail":"After clearing the loan, invest ₹40,000/month in a diversified equity SIP for your 2031 goal.","priority":"medium"}]', false),
  ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003', 3800000, 120000, 48000, 72000, 60.00, 'Your net worth is ₹38,00,000 driven by your house. Your home loan of ₹35,00,000 is large but your 60% savings rate gives you room to prepay. Consider prepaying ₹50,000–₹70,000 per quarter to reduce total interest.', 'template', 0.75, 'unreviewed', '[{"title":"Prepay home loan quarterly","detail":"Use ₹2L of annual surplus to prepay the home loan principal, reducing interest significantly over the loan term.","priority":"high"},{"title":"Diversify beyond real estate","detail":"Your net worth is heavily concentrated in your house. Start building liquid investments.","priority":"medium"}]', true)
on conflict (id) do nothing;

insert into payments (report_id, stripe_session_id, amount, status) values
  ('b0000000-0000-0000-0000-000000000001', 'cs_demo_001', 299.00, 'paid'),
  ('b0000000-0000-0000-0000-000000000003', 'cs_demo_003', 299.00, 'paid')
on conflict do nothing;