import Link from "next/link";

import { GoogleSignInButton } from "@/app/login/google-sign-in-button";

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 text-zinc-50">
      <section className="w-full max-w-sm space-y-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-8 shadow-2xl">
        <div className="space-y-2">
          <p className="text-sm font-medium text-emerald-400">GRANAFY</p>
          <h1 className="text-2xl font-semibold">Acesse suas finanças</h1>
          <p className="text-sm leading-6 text-zinc-400">
            Entre com sua conta Google para continuar.
          </p>
        </div>
        {error ? (
          <p
            aria-live="polite"
            className="rounded-md bg-red-950 px-3 py-2 text-sm text-red-200"
          >
            Não foi possível concluir o login. Tente novamente.
          </p>
        ) : null}
        <GoogleSignInButton />
        <Link
          className="block text-center text-sm text-zinc-400 hover:text-zinc-200"
          href="/"
        >
          Voltar para a página inicial
        </Link>
      </section>
    </main>
  );
}
