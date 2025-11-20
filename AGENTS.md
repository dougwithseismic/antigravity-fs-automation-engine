# Repository Guidelines

## Project Structure & Module Organization
- Monorepo managed by `pnpm` and Turborepo. Applications live under `apps/` (`api`, `web`, `demo-react`, `worker`, `docs`), while shared libraries are under `packages/` (`client-sdk`, `ui`, `types`, `logger`, `metrics`, `nodes`, `database`, etc.).
- Scripts and tooling live in `scripts/`; database artifacts and Supabase configuration are under `supabase/`.
- Tests are typically colocated with source as `*.test.ts`/`*.test.tsx`; shared Vitest config is in `packages/testing-config/vitest.config.js`.

## Build, Test, and Development Commands
- Install deps: `pnpm install` (Node 18+ recommended).
- Dev servers: `pnpm dev` (runs all `dev` tasks via Turbo); `pnpm dev:system` starts API, worker, and demo UI together.
- Build: `pnpm build` (Turbo orchestrates package builds); check types with `pnpm check-types`.
- Quality: `pnpm lint` for ESLint; format with `pnpm format` (Prettier on `ts/tsx/md`).
- Tests: `pnpm test` (Vitest across packages); scope with `pnpm --filter <app|pkg> test`.
- Database helpers: `pnpm db:reset` and `pnpm db:seed` target `packages/database`.
- VS Code interceptor utilities: `pnpm antigravity:start|stop|patch-vscode|unpatch-vscode|view-logs`.

## Coding Style & Naming Conventions
- TypeScript-first; prefer strict typing and explicit return types for exported functions.
- Indentation: 2 spaces; keep line length readable (~100–120 chars).
- Use Prettier and the shared ESLint config (`packages/eslint-config`); run `pnpm format` before pushing.
- React components in `PascalCase`; hooks start with `use*`; files favor `kebab-case.ts`/`kebab-case.tsx` unless otherwise established by the package.
- Re-export shared types from `packages/types` to avoid deep import paths; keep cross-package APIs minimal and well-documented.

## Testing Guidelines
- Vitest is the standard test runner; follow the shared config from `@antigravity/testing-config`.
- Name files `<unit>.test.ts[x]`; prefer fast, isolated unit tests and mock external services (DB, Supabase, network).
- Run targeted suites with `pnpm --filter <target> test -- --runInBand` when debugging; aim to keep new code covered with assertions around edge cases and failure modes.

## Commit & Pull Request Guidelines
- Follow Conventional Commit prefixes observed in history (`feat`, `fix`, `chore`, etc.); keep subject lines concise and imperative.
- Keep changes scoped; separate refactors from feature work when possible.
- PRs should include: summary of changes, testing notes (`pnpm test`, `pnpm lint`, etc.), screenshots for UI changes, and migration notes when DB scripts (`db:reset/seed`) are affected.
- Reference relevant issues or tasks and flag any follow-ups or known gaps.

## Environment & Secrets
- Copy `.env.example` to `.env` (and app-specific examples under `apps/api`, `packages/database`, etc.) before running local services; never commit secrets.
- For local DB work, use the provided Docker/Supabase setup and reset/seed scripts; ensure credentials in `.env` match your local stack.
