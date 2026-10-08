create type public.expense_status as enum (
  'PENDING',
  'PARTIAL',
  'PAID',
  'CANCELLED'
);

create table public.incomes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  description text not null check (char_length(btrim(description)) between 1 and 200),
  amount numeric(14, 2) not null check (amount > 0),
  received_on date not null,
  category text not null check (char_length(btrim(category)) between 1 and 100),
  notes text check (notes is null or char_length(btrim(notes)) <= 2000),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  description text not null check (char_length(btrim(description)) between 1 and 200),
  reference_amount numeric(14, 2) not null check (reference_amount > 0),
  paid_amount numeric(14, 2) not null default 0 check (paid_amount >= 0 and paid_amount <= reference_amount),
  due_date date not null,
  paid_at date,
  category text not null check (char_length(btrim(category)) between 1 and 100),
  status public.expense_status not null default 'PENDING',
  notes text check (notes is null or char_length(btrim(notes)) <= 2000),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint expenses_payment_state_check check (
    (status = 'PENDING' and paid_amount = 0 and paid_at is null)
    or (status = 'PARTIAL' and paid_amount > 0 and paid_amount < reference_amount and paid_at is not null)
    or (status = 'PAID' and paid_amount = reference_amount and paid_at is not null)
    or (status = 'CANCELLED' and paid_amount = 0 and paid_at is null)
  )
);

create index incomes_user_id_received_on_idx on public.incomes (user_id, received_on desc);
create index expenses_user_id_due_date_idx on public.expenses (user_id, due_date desc);
create index expenses_user_id_status_due_date_idx on public.expenses (user_id, status, due_date desc);

alter table public.incomes enable row level security;
alter table public.expenses enable row level security;

revoke all on table public.incomes from anon, authenticated;
revoke all on table public.expenses from anon, authenticated;
grant select, insert, update, delete on table public.incomes to authenticated;
grant select, insert, update, delete on table public.expenses to authenticated;

create policy "Users can view their own incomes"
on public.incomes
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create their own incomes"
on public.incomes
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own incomes"
on public.incomes
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete their own incomes"
on public.incomes
for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can view their own expenses"
on public.expenses
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create their own expenses"
on public.expenses
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own expenses"
on public.expenses
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete their own expenses"
on public.expenses
for delete
to authenticated
using ((select auth.uid()) = user_id);

create trigger set_incomes_updated_at
before update on public.incomes
for each row
execute function private.set_updated_at();

create trigger set_expenses_updated_at
before update on public.expenses
for each row
execute function private.set_updated_at();
