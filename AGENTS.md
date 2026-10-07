# Repository Guidelines

## Project Structure & Module Organization

This repository currently contains `spec.md` and `README.md`. The planned application is a modular Next.js monolith. When implementation begins, keep the structure described in `spec.md`:

- `app/` holds App Router pages, layouts, route handlers, and server actions.
- `components/` holds reusable UI and feature components, grouped by domain such as `expenses/` or `dashboard/`.
- `lib/` holds server-side business rules, Supabase access, validation, authentication, and the future AI tool layer.
- `prisma/` holds the Prisma schema and versioned database migrations.
- `tests/` holds automated tests; `public/` holds static assets.

Keep financial rules out of React components. Organize code by domain before introducing shared abstractions.

## Development Commands

The application has not been bootstrapped, so no package scripts exist. Once created, document these standard commands in `package.json` and `README.md`:

```bash
npm run dev      # start local development
npm run lint     # run linting
npm run typecheck # validate TypeScript
npm run build    # create a production build
npm test         # run automated tests
```

Run lint, type checking, and a production build before opening a pull request.

## Coding Style & Naming Conventions

Use TypeScript, 2-space indentation, and the repository formatter once configured. Prefer readable code and small functions. Use `PascalCase` for React components and types, `camelCase` for functions and variables, and kebab-case for route folders. Name files after their responsibility, for example `expense-form.tsx` and `monthly-summary.ts`.

Validate input at the server boundary. Store monetary values precisely and calculate financial totals in the server or database.

## Testing Guidelines

Add focused tests for domain rules, validation, authorization, and financial calculations. Place tests in `tests/` or beside implementation using `*.test.ts` / `*.test.tsx`. Cover payment status transitions (`PENDING`, `PARTIAL`, `PAID`, `CANCELLED`) and user-data isolation.

## Commits & Pull Requests

The current Git history contains only the initial commit, so no established convention exists. Use Conventional Commit-style messages: `feat: add expense payment`, `fix: correct monthly balance`, or `docs: clarify MVP steps`.

Keep pull requests small. Describe the user-visible change, link the relevant issue or task, list validation, and include screenshots for UI changes. Do not combine MVP work with Copilot, investments, or unrelated refactors.

## Security & Architecture

Every financial record must belong to a user and be protected by Supabase RLS. Never expose secrets to the client or commit `.env.local`. The LLM may call authorized domain tools, but must never access the database or execute SQL directly.
