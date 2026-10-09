alter table public.expense_categories
  drop constraint expense_categories_icon_key_check;

alter table public.expense_categories
  add constraint expense_categories_icon_key_check
  check (
    icon_key is null
    or icon_key in (
      'food', 'home', 'card', 'car', 'health', 'education', 'subscription',
      'water', 'energy', 'phone', 'tv', 'insurance', 'gym', 'investment',
      'money', 'shopping', 'leisure', 'domestic', 'pet', 'travel', 'gift',
      'family', 'work', 'bill', 'other'
    )
  );
