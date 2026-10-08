import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 text-zinc-50">
      <section className="max-w-xl space-y-4">
        <p className="text-sm font-medium text-emerald-400">GRANAFY</p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Seu copiloto financeiro pessoal.
        </h1>
        <p className="text-lg leading-8 text-zinc-300">
          Uma base segura e simples para organizar suas finanças.
        </p>
        <Link
          className="inline-flex rounded-lg bg-emerald-400 px-4 py-3 font-medium text-zinc-950 transition hover:bg-emerald-300"
          href="/login"
        >
          Entrar com Google
        </Link>
      </section>
    </main>
  );
}
