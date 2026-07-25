alter table public.profiles alter column currency set default 'USD';
alter table public.payments alter column currency set default 'USD';

update public.profiles set currency = 'USD' where currency = 'INR';
update public.payments set currency = 'USD' where currency = 'INR';
update public.reports
set
  summary_text = replace(summary_text, '₹', '$'),
  recommendations = replace(recommendations::text, '₹', '$')::jsonb
where summary_text like '%₹%' or recommendations::text like '%₹%';
