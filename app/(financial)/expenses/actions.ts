"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  createExpenseSchema,
  normalizeCurrencyInput,
} from "@/lib/financial/contracts";
import { isMonthReference } from "@/lib/financial/month";
import { createClient } from "@/lib/supabase/server";

export type ExpenseActionState = { error?: string; success?: boolean };
const idSchema = z.string().uuid();
const value = (formData: FormData, name: string) =>
  typeof formData.get(name) === "string" ? String(formData.get(name)) : "";

function payload(formData: FormData) {
  return createExpenseSchema.safeParse({
    description: value(formData, "description"),
    referenceAmount: normalizeCurrencyInput(value(formData, "referenceAmount")),
    paidAmount: normalizeCurrencyInput(value(formData, "paidAmount") || "0"),
    dueDate: value(formData, "dueDate"),
    paidAt: value(formData, "paidAt") || undefined,
    category: value(formData, "category"),
    status: value(formData, "status") || "PENDING",
    notes: value(formData, "notes") || undefined,
  });
}

async function session() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims.sub;
  return typeof userId === "string"
    ? { supabase, userId }
    : { error: "Sua sessão expirou. Entre novamente para continuar." };
}

function refresh(month: string) {
  revalidatePath("/expenses");
  if (isMonthReference(month)) revalidatePath(`/expenses?month=${month}`);
}

export async function createExpense(
  _: ExpenseActionState,
  formData: FormData,
): Promise<ExpenseActionState> {
  const parsed = payload(formData);
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  const auth = await session();
  if ("error" in auth) return auth;
  const { error } = await auth.supabase.from("expenses").insert({
    user_id: auth.userId,
    description: parsed.data.description,
    reference_amount: parsed.data.referenceAmount,
    paid_amount: parsed.data.paidAmount,
    due_date: parsed.data.dueDate,
    paid_at: parsed.data.paidAt ?? null,
    category: parsed.data.category,
    status: parsed.data.status,
    notes: parsed.data.notes ?? null,
  });
  if (error) return { error: "Não foi possível salvar a despesa." };
  refresh(value(formData, "month"));
  return { success: true };
}

export async function updateExpense(
  _: ExpenseActionState,
  formData: FormData,
): Promise<ExpenseActionState> {
  const id = idSchema.safeParse(value(formData, "id"));
  const parsed = payload(formData);
  if (!id.success || !parsed.success)
    return { error: parsed.error?.issues[0]?.message ?? "Dados inválidos." };
  const auth = await session();
  if ("error" in auth) return auth;
  const { error } = await auth.supabase
    .from("expenses")
    .update({
      description: parsed.data.description,
      reference_amount: parsed.data.referenceAmount,
      paid_amount: parsed.data.paidAmount,
      due_date: parsed.data.dueDate,
      paid_at: parsed.data.paidAt ?? null,
      category: parsed.data.category,
      status: parsed.data.status,
      notes: parsed.data.notes ?? null,
    })
    .eq("id", id.data)
    .eq("user_id", auth.userId);
  if (error) return { error: "Não foi possível atualizar a despesa." };
  refresh(value(formData, "month"));
  return { success: true };
}

export async function deleteExpense(
  formData: FormData,
): Promise<ExpenseActionState> {
  const id = idSchema.safeParse(value(formData, "id"));
  if (!id.success) return { error: "Despesa inválida." };
  const auth = await session();
  if ("error" in auth) return auth;
  const { error } = await auth.supabase
    .from("expenses")
    .delete()
    .eq("id", id.data)
    .eq("user_id", auth.userId);
  if (error) return { error: "Não foi possível excluir a despesa." };
  refresh(value(formData, "month"));
  return { success: true };
}
