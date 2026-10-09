insert into public.expense_categories (user_id, name)
select profiles.id, defaults.name
from public.profiles as profiles
cross join (
  values
    ('Água'),
    ('Energia elétrica'),
    ('Telefonia'),
    ('TV/Internet')
) as defaults(name)
on conflict (user_id, normalized_name) do nothing;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data ->> 'display_name')
  on conflict (id) do nothing;

  insert into public.expense_categories (user_id, name)
  values
    (new.id, 'Alimentação'),
    (new.id, 'Saúde'),
    (new.id, 'Educação'),
    (new.id, 'Assinaturas'),
    (new.id, 'Cartão de crédito'),
    (new.id, 'Lazer'),
    (new.id, 'Compras'),
    (new.id, 'Outros'),
    (new.id, 'Investimentos'),
    (new.id, 'Combustível'),
    (new.id, 'Seguros'),
    (new.id, 'Academia'),
    (new.id, 'Água'),
    (new.id, 'Energia elétrica'),
    (new.id, 'Telefonia'),
    (new.id, 'TV/Internet')
  on conflict (user_id, normalized_name) do nothing;

  return new;
end;
$$;
