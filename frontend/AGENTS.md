# AGENTS.md

This file gives AI coding agents (Claude Code, Cursor, etc.) the context needed to work correctly in this repository. Read this before making changes.

## Project Overview

EmpTrack is a portfolio project: an employee & inventory management dashboard with a planned multi-level approval workflow. Phase 1 focuses on the data management dashboard (large datasets, tens of thousands of records). Phase 2 will add the approval workflow.

The repository is a monorepo: `frontend/` (Next.js) and `backend/` (planned, separate folder). Unless stated otherwise, all commands and paths below refer to `frontend/`.

## Tech Stack — Do Not Substitute

- **Framework:** Next.js 16.x (Active LTS, App Router, `src/` directory)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui (Base UI preset, not Radix)
- **Theming:** next-themes (light / dark / system)
- **Server State:** TanStack Query
- **Tables:** TanStack Table + TanStack Virtual (for large datasets)
- **URL State:** nuqs
- **Validation:** Zod (API responses, forms, and environment variables)
- **Class names:** `cn` package (official shadcn replacement for clsx + tailwind-merge)
- **Testing:** Vitest (config: `vitest.config.mts`)
- **Tooling:** ESLint, Husky (pre-commit hook), GitHub Actions (CI)
- **Forms (Phase 2):** React Hook Form
- **Drag & Drop (Phase 2):** dnd-kit
- **Notifications (Phase 2):** Sonner
- **Client State (Phase 2):** Zustand

Do not introduce alternative libraries for these concerns (e.g. no SWR instead of TanStack Query, no Radix directly instead of shadcn, no Jest instead of Vitest, no clsx/tailwind-merge alongside `cn`) without being explicitly asked.

## Commands

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
npm run test     # Run Vitest
```

Before considering a task done:

1. Run `npm run lint` and fix all errors.
2. Run `npm run test` and make sure all tests pass.
3. Run `npm run build` for changes that touch routing, config, or types.

The same checks run in CI (GitHub Actions) and a Husky pre-commit hook runs on every commit. Never bypass hooks with `--no-verify`; fix the underlying issue instead.

## Folder Structure — Feature-Based Architecture

```
src/
├── app/ # Routing ONLY. Pages should be thin and import from features/.
├── features/<domain>/ # Business logic per domain (employees, inventory, approvals)
│ ├── api/ # Fetchers + TanStack Query query keys/hooks
│ ├── components/ # Domain-specific components
│ ├── hooks/
│ ├── schema.ts # Zod schemas
│ ├── types.ts
│ └── utils.ts
├── components/
│ ├── ui/ # shadcn/ui generated components — do not hand-edit heavily, regenerate via CLI instead
│ └── shared/ # Cross-feature components (AppSidebar, PageHeader, DataTableToolbar, ThemeToggle, etc.)
├── providers/ # Centralized app providers (theme, react-query, nuqs)
├── lib/ # query-client, api-client, generic utils
├── hooks/ # Generic, cross-feature hooks only
├── config/ # Site config, nav items, constants
├── types/ # Global types only (not feature-specific)
├── env.ts # Zod-validated environment variables (single source of truth)
└── proxy.ts # Auth guard (replaces middleware.ts in Next.js 16)
```

**Rule:** never put business logic inside `app/`. A page file in `app/` should mostly just compose components from the matching `features/<domain>/`.

**Naming note:** the inventory domain is named `inventory`, not `assets` — `assets` is intentionally avoided because it collides with the standard meaning of static assets (images/fonts) in frontend projects.

## Coding Conventions

### Components & UI

- Always use shadcn/ui components instead of raw HTML elements where a shadcn equivalent exists (e.g. use `<Table>` from shadcn, not a bare `<table>`; use `<Button>`, not `<button>`).
- If a needed shadcn/ui component is not installed yet, tell the user to install it with `npx shadcn@latest add <component-name>`. Do not install it yourself.
- Use semantic HTML tags (`<nav>`, `<main>`, `<section>`, `<article>`, `<header>`, `<footer>`) instead of generic `<div>` wherever the semantic meaning applies — this matters for accessibility and SEO.
- Use Next.js `<Link>` for internal navigation, never a plain `<a>` tag, to preserve client-side transitions.
- Use `next/image` for any image rendering, not a plain `<img>`.
- Merge class names with `cn()` from the `cn` package. Do not import `clsx` or `tailwind-merge` directly.

### Theming & Design Tokens

- Light/dark/system theme is handled by `next-themes`, mounted once in the centralized providers. Do not add a second theme mechanism.
- Use semantic color tokens (`background`, `foreground`, `primary`, `destructive`, `success`, `warning`, etc.) via Tailwind classes. Never hardcode hex/rgb colors in components; if a new status color is needed, add a token in the global CSS instead.

### Data Fetching & Performance

- All server data fetching goes through TanStack Query. Define query keys consistently per feature in `features/<domain>/api/`.
- All HTTP requests go through `lib/api-client.ts`. Do not call `fetch` directly inside components or hooks. Extend the api-client if a capability is missing.
- When implementing paginated or filtered views, preserve cached pages so navigating back to a previously visited page/filter state does not refetch unnecessarily (tune `staleTime` / `gcTime` deliberately, don't leave defaults unexamined).
- For any table or list that can contain large datasets (thousands+ rows), use TanStack Virtual for row virtualization — do not render full unvirtualized lists for large data.
- Filter, search, and pagination state should be synced to the URL via `nuqs`, not kept only in local component state.

### Validation & Types

- Any data crossing a boundary (API response, form input) must be validated with a Zod schema before use. Derive TypeScript types from Zod schemas with `z.infer`, don't hand-duplicate types.
- Never read `process.env` directly in application code. Import from `src/env.ts`, which validates variables with Zod at startup. When adding a new variable, add it to `env.ts` and `.env.example` together.

### Testing

- Use Vitest for all tests. Test files live next to the code they test (`*.test.ts` / `*.test.tsx`).
- Utilities, Zod schemas, and `lib/api-client.ts` must have tests. Cover success, error, and edge cases (e.g. non-2xx responses, invalid payloads, network failure).
- Mock at the network boundary, not inside the unit under test. Tests must be deterministic and must not hit real APIs.
- When fixing a bug, add a regression test first when practical.

### Security

- Never commit `.env` files or secrets. Environment variables go through `.env.local` (gitignored) and are documented (name only, no value) in `.env.example`.
- Only variables prefixed with `NEXT_PUBLIC_` may be exposed to the browser. Never put secrets in them.
- Any route requiring authentication must be protected via `proxy.ts`, not only via client-side checks. Do not recreate `middleware.ts`; it was replaced by `proxy.ts` in Next.js 16.
- Security headers are configured in the Next.js config. Do not remove or weaken them (CSP, X-Frame-Options, etc.) without being explicitly asked. If a change breaks them, adjust the header deliberately.
- Sanitize/validate all user input before rendering or sending to an API; do not trust client-side validation alone.

### Git & Commits

- Follow Conventional Commits (`feat:`, `fix:`, `refactor:`, `style:`, `chore:`, `docs:`, `test:`). Scope with the domain when relevant, e.g. `feat(employees): add virtualized data table`.
- Keep commits small and focused. Prefer one logical change per commit.
- `.gitattributes` enforces consistent line endings. Do not change it without being asked.
- CI (GitHub Actions) must stay green before merging/pushing a milestone.

## When Making Changes

1. Check if a similar pattern already exists in another feature folder before introducing a new one — consistency across `features/employees`, `features/inventory`, and (later) `features/approvals` matters more than local optimization.
2. Explain non-obvious code with comments, especially around caching strategy, virtualization setup, and proxy logic.
3. Do not restructure folders or introduce new top-level dependencies without flagging it first.
4. Add or update tests for any logic you change, then run lint and tests before finishing.
