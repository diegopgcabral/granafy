alter table public.expense_categories
add column icon_key text;

alter table public.expense_categories
add constraint expense_categories_icon_key_check
check (
  icon_key is null
  or icon_key in (
    'food', 'home', 'card', 'car', 'health', 'education', 'subscription',
    'water', 'energy', 'phone', 'tv', 'insurance', 'gym', 'investment',
    'shopping', 'other'
  )
);
