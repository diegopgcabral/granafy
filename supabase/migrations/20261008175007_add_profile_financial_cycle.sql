alter table public.profiles
add column financial_cycle_start_day smallint not null default 1
check (financial_cycle_start_day between 1 and 28);
