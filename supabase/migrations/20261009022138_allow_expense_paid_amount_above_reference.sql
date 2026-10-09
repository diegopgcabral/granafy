alter table public.expenses
  drop constraint expenses_check,
  drop constraint expenses_payment_state_check;

alter table public.expenses
  add constraint expenses_check
    check (paid_amount >= 0),
  add constraint expenses_payment_state_check
    check (
      (status = 'PENDING' and paid_amount = 0 and paid_at is null)
      or (status = 'PARTIAL' and paid_amount > 0 and paid_amount < reference_amount and paid_at is not null)
      or (status = 'PAID' and paid_amount >= reference_amount and paid_at is not null)
      or (status = 'CANCELLED' and paid_amount = 0 and paid_at is null)
    );
