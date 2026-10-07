<div align="center">
  <h1>EmpTrack</h1>
</div>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Shadcn%20UI-000000?style=for-the-badge&logo=shadcnui&logoColor=white" />
  <img src="https://img.shields.io/badge/TanStack_Query-FF4154?style=for-the-badge&logo=reactquery&logoColor=white" />
  <img src="https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white" />
</p>

<p align="center">
  <a href="https://github.com/kafayaaa/emptrack/actions/workflows/ci.yml">
    <img src="https://github.com/kafayaaa/emptrack/actions/workflows/ci.yml/badge.svg" alt="CI" />
  </a>
</p>

> Employee & Inventory Management Dashboard with Multi-level Approval Workflow

A full-stack dashboard application for managing employee data and company inventory at scale, with a multi-level approval workflow built on top. Built as a portfolio project to demonstrate production-grade frontend architecture for handling large datasets (tens of thousands of records) with a strong focus on performance, UX, security, and maintainability.

---

## ✨ Overview

EmpTrack lets an organization manage two core resources — **employees** and **inventory** — through a data-dense dashboard built for scale, then layers a **multi-level approval workflow** on top for requests that need sign-off (e.g. asset requests, data changes).

The project is split into two phases:

- **Phase 1 — Data Management Dashboard** _(current)_
  Employee & inventory CRUD, large-dataset tables (virtualized), filtering, search, and pagination with smart caching.
- **Phase 2 — Approval Workflow** _(planned)_
  Multi-level, sortable approval chains, request history, and notifications.

## 🚀 Features

- 📊 **Data-dense tables** for tens of thousands of records, virtualized for smooth scrolling performance
- 🔍 Server-driven filtering, search, sorting, and pagination — synced to the URL (shareable, bookmarkable, refresh-safe)
- ⚡ Smart client-side caching — navigating back to a previously visited page doesn't refetch unnecessarily
- 🧩 **Backend-for-frontend** Route Handler (`/api/employees`) that validates every request and response with Zod, so the browser never talks to the data source directly
- ♿ Accessible, semantic HTML for better screen-reader support and SEO
- 🎨 Consistent design system powered by shadcn/ui (Base UI) with light/dark/system theme
- ✅ End-to-end type safety with TypeScript + Zod schema validation
- 🔒 Security-minded by default: security headers, server-only environment variables, input whitelisting, route protection via `proxy.ts`
- 🤖 CI on every pull request (GitHub Actions) with branch protection on `main`

## 🛠️ Tech Stack

| Category                  | Choice                                                                                          |
| ------------------------- | ----------------------------------------------------------------------------------------------- |
| Framework                 | [Next.js](https://nextjs.org/) 16.2 (App Router)                                                |
| Language                  | TypeScript                                                                                      |
| Styling                   | Tailwind CSS                                                                                    |
| UI Components             | [shadcn/ui](https://ui.shadcn.com/) (Base UI)                                                   |
| Server State              | [TanStack Query](https://tanstack.com/query)                                                    |
| Tables                    | [TanStack Table](https://tanstack.com/table) + [TanStack Virtual](https://tanstack.com/virtual) |
| URL State                 | [nuqs](https://nuqs.47ng.com/)                                                                  |
| Validation                | [Zod](https://zod.dev/) 4                                                                       |
| Mock Backend              | [json-server](https://github.com/typicode/json-server) 1.x + [Faker](https://fakerjs.dev/)      |
| Testing                   | Vitest                                                                                          |
| Tooling                   | ESLint, Husky (pre-commit), GitHub Actions                                                      |
| Forms _(Phase 2)_         | React Hook Form                                                                                 |
| Drag & Drop _(Phase 2)_   | dnd-kit                                                                                         |
| Notifications _(Phase 2)_ | Sonner                                                                                          |
| Client State _(Phase 2)_  | Zustand                                                                                         |

## 📁 Project Structure

The repository is a monorepo with a mock backend and a frontend. The frontend follows a **feature-based architecture**: routing stays thin, and each business domain owns its own components, hooks, and logic.

```
emptrack/
├── .github/workflows/ci.yml      # CI: install, check, build
├── backend/                      # Mock REST API (json-server) + seed data
│   ├── scripts/seed.ts           # Generates 50,000 employees with Faker
│   └── README.md
└── frontend/
    ├── src/
    │   ├── app/                  # Routing only (App Router) — thin, composes from features/
    │   │   ├── api/employees/    # Route Handler (BFF): GET /api/employees
    │   │   └── dashboard/
    │   ├── features/             # Business logic per domain
    │   │   ├── employees/
    │   │   │   ├── api/          # Fetchers & query keys
    │   │   │   ├── components/
    │   │   │   ├── hooks/
    │   │   │   ├── schema/       # Zod schemas (employee.schema.ts)
    │   │   │   ├── types/
    │   │   │   └── utils/
    │   │   ├── inventory/
    │   │   └── approvals/        # Phase 2
    │   ├── components/
    │   │   ├── ui/               # shadcn/ui generated components
    │   │   └── shared/           # Cross-feature components
    │   ├── lib/                  # api-client, query-client, helpers
    │   ├── hooks/                # Generic, cross-feature hooks
    │   ├── config/               # Site config, nav items, constants
    │   ├── env.ts                # Validated public (client) env
    │   ├── env.server.ts         # Validated server-only env (never bundled to the browser)
    │   └── proxy.ts              # Request proxy / auth guard (Next.js 16)
    └── public/
```

## 🏁 Getting Started

### Prerequisites

- Node.js (LTS version, see `frontend/.nvmrc`)
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/kafayaaa/emptrack.git
cd emptrack
```

**1. Backend (mock API on port 4000)**

```bash
cd backend
npm install
npm run seed
npm run dev:api
```

**2. Frontend** (in a second terminal)

```bash
cd frontend
npm install

# Set up environment variables
cp .env.example .env.local

npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

```env
# Public (exposed to the browser)
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:4000

# Server-only (never exposed to the browser)
BACKEND_URL=http://localhost:4000
```

Environment variables are validated with Zod at startup, so a missing or malformed value fails fast with a clear error. `BACKEND_URL` lives in `env.server.ts`, which is protected by `server-only`.

## 🔌 API: `GET /api/employees`

A Next.js Route Handler that sits between the browser and the mock backend. The browser never calls json-server directly.

```
Browser ──▶ /api/employees (validate query) ──▶ json-server ──▶ (validate response) ──▶ { data, meta }
```

### Query parameters

| Parameter                          | Type              | Default | Description                                                                  |
| ---------------------------------- | ----------------- | ------- | ---------------------------------------------------------------------------- |
| `page`                             | number            | `1`     | Page number                                                                  |
| `pageSize`                         | number            | `20`    | Items per page (max `100`)                                                   |
| `search`                           | string            | –       | Partial match on full name                                                   |
| `sortBy`                           | string            | –       | `employeeNumber`, `fullName`, `department`, `position`, `status`, `hireDate` |
| `sortOrder`                        | `asc` \| `desc`   | `asc`   | Sort direction                                                               |
| `department`, `position`, `status` | string            | –       | Exact-match filters                                                          |
| `projectId`                        | numeric string    | –       | Filter by project                                                            |
| `isManager`                        | `true` \| `false` | –       | Filter managers                                                              |

### Response

```json
{
  "data": [
    {
      "id": "1",
      "employeeNumber": "EMP-00001",
      "fullName": "Daruna Daruna Oktovian",
      "email": "daruna.daruna.oktovian.1@emptrack.test",
      "department": "Engineering",
      "position": "Manager",
      "status": "active",
      "hireDate": "2017-01-18",
      "isManager": true,
      "managerId": null,
      "projectId": "1281"
    }
  ],
  "meta": { "page": 1, "pageSize": 20, "total": 50000, "totalPages": 2500 }
}
```

### Status codes

| Code        | Meaning                                                  |
| ----------- | -------------------------------------------------------- |
| `200`       | Success                                                  |
| `400`       | Invalid query parameters (validated with Zod)            |
| `404`       | Page out of range                                        |
| `502`/`504` | Backend returned an error, was unreachable, or timed out |

### Design decisions

- **Server-side pagination, filtering, and sorting** — the dataset has 50,000 records, so the client only ever receives one page.
- **Bounded input** — `pageSize` is capped at 100 and sortable columns are whitelisted; unknown parameters are stripped by Zod.
- **Untrusted upstream** — the backend response is validated again before it is forwarded.
- **Fail fast** — upstream calls have a 5s timeout, and internal error details are never sent to the client.
- **Browser caching** — responses carry `Cache-Control: private, max-age=30, stale-while-revalidate=60`, working together with TanStack Query's cache.

## 📜 Available Scripts

Run inside `frontend/`:

| Command                | Description                  |
| ---------------------- | ---------------------------- |
| `npm run dev`          | Start the development server |
| `npm run build`        | Build for production         |
| `npm run start`        | Start the production server  |
| `npm run lint`         | Run ESLint                   |
| `npm run format`       | Format code                  |
| `npm run format:check` | Format code check            |
| `npm run prepare`      | Run husky hooks              |
| `npm run test`         | Run vitest                   |
| `npm run test:run`     | Run tests in watch mode      |
| `npm run check`        | Quality gate used by CI      |

Run inside `backend/`:

| Command           | Description                    |
| ----------------- | ------------------------------ |
| `npm run dev:api` | Start json-server on port 4000 |

## 🗺️ Progress

- [x] Project setup, theming (light/dark/system), security headers, CI, branch protection
- [x] Semantic root layout, metadata, sitemap & robots
- [x] Dashboard shell (sidebar, dynamic breadcrumb)
- [x] Typed API client with tests
- [x] Seed script (50,000 employees) and mock backend
- [x] `GET /api/employees` Route Handler
- [ ] Employee table (virtualized, URL-synced filters, cached pagination)
- [ ] Inventory module
- [ ] Phase 2: approval workflow

## 📄 License

This project is for portfolio/demonstration purposes.
