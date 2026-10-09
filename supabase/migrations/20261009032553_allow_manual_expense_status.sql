alter table public.expenses
  drop constraint expenses_payment_state_check;

alter table public.expenses
  add constraint expenses_payment_state_check
    check (
      (status = 'PENDING' and paid_amount = 0 and paid_at is null)
      or (status = 'CANCELLED' and paid_amount = 0 and paid_at is null)
      or (status in ('PARTIAL', 'PAID') and paid_amount >= 0 and paid_at is not null)
    );
