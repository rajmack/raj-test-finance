create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  actor text not null default 'anonymous',
  target_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table audit_logs enable row level security;
drop policy if exists "audit_logs_v1_insert" on audit_logs;
create policy "audit_logs_v1_insert" on audit_logs for insert with check (true);
drop policy if exists "audit_logs_v1_read" on audit_logs;
create policy "audit_logs_v1_read" on audit_logs for select using (true);
