create table public.expense_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 100),
  normalized_name text generated always as (upper(regexp_replace(btrim(name), '\\s+', ' ', 'g'))) stored,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, normalized_name)
);

create index expense_categories_user_id_active_name_idx
on public.expense_categories (user_id, is_active, name);

alter table public.expense_categories enable row level security;
revoke all on table public.expense_categories from anon, authenticated;
grant select, insert, update, delete on table public.expense_categories to authenticated;

create policy "Users can view their own expense categories"
on public.expense_categories for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create their own expense categories"
on public.expense_categories for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own expense categories"
on public.expense_categories for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete their own expense categories"
on public.expense_categories for delete to authenticated
using ((select auth.uid()) = user_id);

create trigger set_expense_categories_updated_at
before update on public.expense_categories
for each row execute function private.set_updated_at();
