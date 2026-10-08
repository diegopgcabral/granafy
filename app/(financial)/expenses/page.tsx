import { ExpenseManager } from "@/components/financial/expense-manager";
import {
  calculateExpenseTotals,
  type ExpenseListItem,
} from "@/lib/financial/expense";
import {
  getCurrentCycleReference,
  getCycleDateRange,
  isMonthReference,
} from "@/lib/financial/month";
import { createClient } from "@/lib/supabase/server";

type ExpensesPageProps = { searchParams: Promise<{ month?: string }> };

export default async function ExpensesPage({
  searchParams,
}: ExpensesPageProps) {
  const { month: queryMonth } = await searchParams;
  const requestedMonth = queryMonth ?? null;
  let month = isMonthReference(requestedMonth)
    ? requestedMonth
    : getCurrentCycleReference();
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims.sub;
  let expenses: ExpenseListItem[] = [];
  let categories: string[] = [];

  if (typeof userId === "string") {
    const { data: profile } = await supabase
      .from("profiles")
      .select("financial_cycle_start_day")
      .eq("id", userId)
      .maybeSingle();
    const cycleStartDay = profile?.financial_cycle_start_day ?? 1;
    if (!isMonthReference(requestedMonth)) {
      month = getCurrentCycleReference(new Date(), cycleStartDay);
    }
    const { startsOn, endsBefore } = getCycleDateRange(month, cycleStartDay);
    const { data } = await supabase
      .from("expenses")
      .select(
        "id, description, reference_amount, paid_amount, due_date, paid_at, category, status, notes",
      )
      .eq("user_id", userId)
      .gte("due_date", startsOn)
      .lt("due_date", endsBefore)
      .order("due_date");
    expenses = (data ?? []).map((expense) => ({
      id: expense.id,
      description: expense.description,
      referenceAmount: expense.reference_amount,
      paidAmount: expense.paid_amount,
      dueDate: expense.due_date,
      paidAt: expense.paid_at,
      category: expense.category,
      status: expense.status,
      notes: expense.notes,
    }));
    const { data: categoryRows } = await supabase
      .from("expense_categories")
      .select("name")
      .eq("user_id", userId)
      .eq("is_active", true)
      .order("name");
    categories = (categoryRows ?? []).map((category) => category.name);
  }
  const totals = calculateExpenseTotals(expenses);

  return (
    <section>
      <ExpenseManager
        categories={categories}
        expenses={expenses}
        month={month}
        totals={totals}
      />
    </section>
  );
}
