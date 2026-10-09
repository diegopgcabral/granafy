"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  createIncomeSchema,
  normalizeCurrencyInput,
} from "@/lib/financial/contracts";
import { isMonthReference } from "@/lib/financial/month";
import { createClient } from "@/lib/supabase/server";

export type IncomeActionState = {
  error?: string;
  success?: boolean;
};

const incomeIdSchema = z.string().uuid();

function formValue(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function incomePayload(formData: FormData) {
  return createIncomeSchema.safeParse({
    description: formValue(formData, "description"),
    amount: normalizeCurrencyInput(formValue(formData, "amount")),
    receivedOn: formValue(formData, "receivedOn"),
    category: formValue(formData, "category"),
    notes: formValue(formData, "notes") || undefined,
  });
}

async function getAuthenticatedUserId() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims.sub;

  if (typeof userId !== "string") {
    return { error: "Sua sessão expirou. Entre novamente para continuar." };
  }

  return { supabase, userId };
}

function revalidateIncome(month: string) {
  revalidatePath("/income");
  if (isMonthReference(month)) {
    revalidatePath(`/income?month=${month}`);
  }
}

export async function createIncome(
  _previousState: IncomeActionState,
  formData: FormData,
): Promise<IncomeActionState> {
  const parsed = incomePayload(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const session = await getAuthenticatedUserId();
  if ("error" in session) return session;

  const { error } = await session.supabase.from("incomes").insert({
    user_id: session.userId,
    description: parsed.data.description,
    amount: parsed.data.amount,
    received_on: parsed.data.receivedOn,
    category: parsed.data.category,
    notes: parsed.data.notes || null,
  });

  if (error)
    return { error: "Não foi possível salvar a receita. Tente novamente." };

  revalidateIncome(formValue(formData, "month"));
  return { success: true };
}

export async function updateIncome(
  _previousState: IncomeActionState,
  formData: FormData,
): Promise<IncomeActionState> {
  const id = incomeIdSchema.safeParse(formValue(formData, "id"));
  const parsed = incomePayload(formData);
  if (!id.success || !parsed.success) {
    return { error: parsed.error?.issues[0]?.message ?? "Dados inválidos." };
  }

  const session = await getAuthenticatedUserId();
  if ("error" in session) return session;

  const { error } = await session.supabase
    .from("incomes")
    .update({
      description: parsed.data.description,
      amount: parsed.data.amount,
      received_on: parsed.data.receivedOn,
      category: parsed.data.category,
      notes: parsed.data.notes || null,
    })
    .eq("id", id.data)
    .eq("user_id", session.userId);

  if (error) return { error: "Não foi possível atualizar a receita." };

  revalidateIncome(formValue(formData, "month"));
  return { success: true };
}

export async function deleteIncome(
  formData: FormData,
): Promise<IncomeActionState> {
  const id = incomeIdSchema.safeParse(formValue(formData, "id"));
  if (!id.success) return { error: "Receita inválida." };

  const session = await getAuthenticatedUserId();
  if ("error" in session) return session;

  const { error } = await session.supabase
    .from("incomes")
    .delete()
    .eq("id", id.data)
    .eq("user_id", session.userId);
  if (error) return { error: "Não foi possível excluir a receita." };

  revalidateIncome(formValue(formData, "month"));
  return { success: true };
}
