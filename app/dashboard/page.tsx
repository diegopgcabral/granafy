import { redirect } from "next/navigation";

import { signOut } from "@/app/dashboard/actions";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let isAuthenticated = false;
  let email: string | undefined;

  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();
    isAuthenticated = typeof data?.claims.sub === "string";
    email =
      typeof data?.claims.email === "string" ? data.claims.email : undefined;
  } catch {
    redirect("/login?error=configuration");
  }

  if (!isAuthenticated) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-12 text-zinc-50">
      <section className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-emerald-400">GRANAFY</p>
            <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
            <p className="text-zinc-400">
              {email ? `Sessão iniciada como ${email}.` : "Sessão iniciada."}
            </p>
          </div>
          <form action={signOut}>
            <button
              className="rounded-lg border border-zinc-700 px-3 py-2 text-sm hover:border-zinc-500"
              type="submit"
            >
              Sair
            </button>
          </form>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 text-zinc-400">
          Os módulos financeiros serão exibidos aqui nos próximos passos.
        </div>
      </section>
    </main>
  );
}
