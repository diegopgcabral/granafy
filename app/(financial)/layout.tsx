import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { FinancialShell } from "@/components/financial/financial-shell";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function FinancialLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  let isAuthenticated = false;
  let displayName = "Usuário";
  let email: string | undefined;

  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();
    const userId = data?.claims.sub;

    isAuthenticated = typeof userId === "string";
    email =
      typeof data?.claims.email === "string" ? data.claims.email : undefined;

    if (isAuthenticated) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", userId)
        .maybeSingle();
      displayName = profile?.display_name || email?.split("@")[0] || "Usuário";
    }
  } catch {
    redirect("/login?error=configuration");
  }

  if (!isAuthenticated) {
    redirect("/login");
  }

  return (
    <FinancialShell displayName={displayName} email={email}>
      {children}
    </FinancialShell>
  );
}
