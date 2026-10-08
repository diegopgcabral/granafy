alter table public.profiles
drop constraint profiles_financial_cycle_start_day_check;

alter table public.profiles
add constraint profiles_financial_cycle_start_day_check
check (financial_cycle_start_day between 1 and 31);
