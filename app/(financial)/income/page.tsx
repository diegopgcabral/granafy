import { IncomeManager } from "@/components/financial/income-manager";
import {
  calculateIncomeTotal,
  type IncomeListItem,
} from "@/lib/financial/income";
import {
  getCurrentCycleReference,
  getCycleDateRange,
  isMonthReference,
} from "@/lib/financial/month";
import { createClient } from "@/lib/supabase/server";

type IncomePageProps = { searchParams: Promise<{ month?: string }> };

export default async function IncomePage({ searchParams }: IncomePageProps) {
  const { month: queryMonth } = await searchParams;
  const requestedMonth = queryMonth ?? null;
  let month = isMonthReference(requestedMonth)
    ? requestedMonth
    : getCurrentCycleReference();
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims.sub;
  let incomes: IncomeListItem[] = [];

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
      .from("incomes")
      .select("id, description, amount, received_on, category, notes")
      .eq("user_id", userId)
      .gte("received_on", startsOn)
      .lt("received_on", endsBefore)
      .order("received_on", { ascending: false })
      .order("created_at", { ascending: false });
    incomes = (data ?? []).map((income) => ({
      id: income.id,
      description: income.description,
      amount: income.amount,
      receivedOn: income.received_on,
      category: income.category,
      notes: income.notes,
    }));
  }

  return (
    <section>
      <IncomeManager
        incomes={incomes}
        month={month}
        totalCents={calculateIncomeTotal(incomes)}
      />
    </section>
  );
}
