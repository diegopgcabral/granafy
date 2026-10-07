# Granafy

Aplicação web para gestão financeira pessoal. O escopo e a sequência de desenvolvimento estão em [spec.md](./spec.md).

## Desenvolvimento local

Requer Node.js 22 ou superior.

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Verificação

```bash
npm run lint
npm run typecheck
npm run build
npm test
```

## Configuração de ambiente

Copie `.env.example` para `.env.local` e preencha as variáveis do projeto Supabase. Nunca versione `.env.local` ou chaves de acesso.

```bash
cp .env.example .env.local
```

## Deploy

O deploy de produção será feito pela Vercel a partir da branch `main`. Crie os projetos do Supabase e da Vercel, conecte este repositório GitHub e configure as variáveis presentes em `.env.example` nos ambientes de Preview e Production.

## Estrutura

- `app/`: rotas e interface com Next.js App Router.
- `components/`: componentes reutilizáveis e de domínio.
- `lib/`: regras de negócio, integrações e validações.
- `prisma/`: schema e migrations do banco de dados.
- `tests/`: testes automatizados.
