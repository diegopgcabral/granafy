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

## Estrutura

- `app/`: rotas e interface com Next.js App Router.
- `components/`: componentes reutilizáveis e de domínio.
- `lib/`: regras de negócio, integrações e validações.
- `prisma/`: schema e migrations do banco de dados.
- `tests/`: testes automatizados.
