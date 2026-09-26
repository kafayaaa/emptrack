# AGENTS.md

This file gives AI coding agents (Claude Code, Cursor, etc.) the context needed to work correctly in this repository. Read this before making changes.

## Project Overview

EmpTrack is a portfolio project: an employee & inventory management dashboard with a planned multi-level approval workflow. Phase 1 focuses on the data management dashboard (large datasets, tens of thousands of records). Phase 2 will add the approval workflow.

## Tech Stack — Do Not Substitute

- **Framework:** Next.js (App Router, `src/` directory)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui (Base UI preset)
- **Server State:** TanStack Query
- **Tables:** TanStack Table + TanStack Virtual (for large datasets)
- **URL State:** nuqs
- **Validation:** Zod
- **Forms (Phase 2):** React Hook Form
- **Drag & Drop (Phase 2):** dnd-kit
- **Notifications (Phase 2):** Sonner
- **Client State (Phase 2):** Zustand

Do not introduce alternative libraries for these concerns (e.g. no SWR instead of TanStack Query, no Radix directly instead of shadcn, no react-table v7) without being explicitly asked.

## Commands

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

Always run `npm run lint` after making changes and fix any errors before considering a task done.

## Folder Structure — Feature-Based Architecture

```
src/
├── app/                  # Routing ONLY. Pages should be thin and import from features/.
├── features/<domain>/    # Business logic per domain (employees, inventory, approvals)
│   ├── api/              # Fetchers + TanStack Query query keys/hooks
│   ├── components/       # Domain-specific components
│   ├── hooks/
│   ├── schema.ts         # Zod schemas
│   ├── types.ts
│   └── utils.ts
├── components/
│   ├── ui/                # shadcn/ui generated components — do not hand-edit heavily, regenerate via CLI instead
│   └── shared/             # Cross-feature components (AppSidebar, PageHeader, DataTableToolbar, etc.)
├── lib/                    # query-client, api-client, generic utils
├── hooks/                  # Generic, cross-feature hooks only
├── config/                 # Site config, nav items, constants
├── types/                  # Global types only (not feature-specific)
└── middleware.ts           # Auth guard
```

**Rule:** never put business logic inside `app/`. A page file in `app/` should mostly just compose components from the matching `features/<domain>/`.

**Naming note:** the inventory domain is named `inventory`, not `assets` — `assets` is intentionally avoided because it collides with the standard meaning of static assets (images/fonts) in frontend projects.

## Coding Conventions

### Components & UI

- Always use shadcn/ui components instead of raw HTML elements where a shadcn equivalent exists (e.g. use `<Table>` from shadcn, not a bare `<table>`; use `<Button>`, not `<button>`).
- If needed shadcn/ui is not installed yet, install it first using `npx shadcn-ui add <component-name>`. (Do not install it yourself).
- Use semantic HTML tags (`<nav>`, `<main>`, `<section>`, `<article>`, `<header>`, `<footer>`) instead of generic `<div>` wherever the semantic meaning applies — this matters for accessibility and SEO.
- Use Next.js `<Link>` for internal navigation, never a plain `<a>` tag, to preserve client-side transitions.
- Use `next/image` for any image rendering, not a plain `<img>`.

### Data Fetching & Performance

- All server data fetching goes through TanStack Query. Define query keys consistently per feature in `features/<domain>/api/`.
- When implementing paginated or filtered views, preserve cached pages so navigating back to a previously visited page/filter state does not refetch unnecessarily (tune `staleTime` / `gcTime` deliberately, don't leave defaults unexamined).
- For any table or list that can contain large datasets (thousands+ rows), use TanStack Virtual for row virtualization — do not render full unvirtualized lists for large data.
- Filter, search, and pagination state should be synced to the URL via `nuqs`, not kept only in local component state.

### Validation & Types

- Any data crossing a boundary (API response, form input) must be validated with a Zod schema before use. Derive TypeScript types from Zod schemas with `z.infer`, don't hand-duplicate types.

### Security

- Never commit `.env` files or secrets. Environment variables must go through `.env.local` (gitignored) and be documented (name only, no value) in `.env.example`.
- Any route requiring authentication must be protected via `middleware.ts`, not only via client-side checks.
- Sanitize/validate all user input before rendering or sending to an API; do not trust client-side validation alone.

### Commits

Follow Conventional Commits (`feat:`, `fix:`, `refactor:`, `style:`, `chore:`, `docs:`, `test:`). Scope with the domain when relevant, e.g. `feat(employees): add virtualized data table`.

## When Making Changes

1. Check if a similar pattern already exists in another feature folder before introducing a new one — consistency across `features/employees`, `features/inventory`, and (later) `features/approvals` matters more than local optimization.
2. Explain non-obvious code with comments, especially around caching strategy, virtualization setup, and middleware logic.
3. Do not restructure folders or introduce new top-level dependencies without flagging it first.
