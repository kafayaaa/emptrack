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

## 🏛️ End-to-End CRUD Architecture & Patterns

EmpTrack mengimplementasikan arsitektur CRUD skala produksi dengan pendekatan **Backend-for-Frontend (BFF)** dan **Optimistic State Management**. Pola ini dirancang untuk mempertahankan konsistensi data, pengalaman pengguna tanpa latensi (_zero-latency perceived performance_), dan skalabilitas untuk dataset besar (50.000+ records).

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT BROWSER                                 │
│                                                                             │
│  [UI Components / Dialogs]  ───▶  [Feature Hooks (useMutation / useQuery)]   │
│             │                                        │                      │
│             │ (Controlled / Uncontrolled)            │                      │
│             ▼                                        ▼                      │
│  [useControllableState]                   [TanStack Query Cache]            │
│                                           ├── Detail Queries                │
│                                           ├── Paginated Queries             │
│                                           └── Infinite Virtual Queries      │
│                                                      │                      │
│                                                      ▼                      │
│                                            [Typed API Client]               │
└──────────────────────────────────────────────────────┬──────────────────────┘
                                                       │  HTTP (JSON + Zod)
                                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       NEXT.JS ROUTE HANDLERS (BFF)                          │
│                                                                             │
│  ├── GET    /api/employees           (Validation & Server-side filtering)   │
│  ├── POST   /api/employees           (Auto-numbering & Email uniqueness)    │
│  ├── GET    /api/employees/[id]      (SSR Prefetching & Dynamic Metadata)   │
│  ├── PATCH  /api/employees/[id]      (Field whitelisting & Partial update)  │
│  ├── DELETE /api/employees/[id]      (Atomic deletion)                      │
│  └── POST   /api/employees/check-email (Debounced async field validation)   │
└──────────────────────────────────────────────────────┬──────────────────────┘
                                                       │  HTTP / Upstream
                                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      MOCK UPSTREAM BACKEND (json-server)                    │
│                                                                             │
│                       50,000 Seeded Employee Records                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 1. The 4 CRUD Pillars in EmpTrack

#### A. Create (`POST /api/employees`)

- **Form Architecture**: Menggunakan React Hook Form dengan resolver Zod (`employeeFormSchema`) untuk client-side validation.
- **Asynchronous Validation**: Pengecekan keunikan email secara _real-time_ via endpoint `/api/employees/check-email` dengan debounce untuk mencegah _request flooding_.
- **Auto-generated Identifiers**: Penomoran otomatis format `EMP-XXXXX` dihasilkan pada tingkat Route Handler dengan mencari nomor urut tertinggi secara aman.
- **Cache Synchronization**: Setelah data berhasil dibuat, cache query daftar karyawan di-invalidasi sehingga tabel utama langsung merefleksikan karyawan baru pada halaman pertama.

#### B. Read (`GET /api/employees` & `GET /api/employees/[id]`)

- **Dual Table View Modes**:
  - _Standard Paginated View_: Pagination, sorting, dan filtering berbasis parameter URL (`nuqs`) yang _bookmarkable_ dan _refresh-safe_.
  - _Virtualized Infinite Scroll_: Menggunakan `@tanstack/react-virtual` dan `useInfiniteQuery` untuk merender 50.000+ data secara mulus pada 60 FPS tanpa beban memory DOM.
- **SSR & Prefetching**: Halaman detail (`/employees/[id]`) melakukan prefetching data pada Next.js Server Component menggunakan `HydrationBoundary`, menyajikan halaman secara instan dengan dukungan SEO (OpenGraph, dynamic metadata, sitemap).

#### C. Update (`PATCH /api/employees/[id]`)

- **Optimistic Updates**: Saat user menekan simpan, cache detail maupun cache daftar (paginated & infinite) diperbarui seketika (0ms delay) sebelum request server selesai.
- **Atomic Snapshotting & Rollback**:
  - Mengambil snapshot cache sebelum mutasi melalui helper `snapshotEmployeeLists(queryClient)`.
  - Jika request jaringan gagal atau ditolak server, perubahan otomatis di-rollback ke snapshot sebelumnya melalui `rollbackEmployeeLists(queryClient, snapshot)` disertai notifikasi pembatalan.
- **Server Re-synchronization**: Event `onSettled` memicu `invalidateEmployeeLists(queryClient)` untuk menjamin integritas data dengan database backend.

#### D. Delete & Bulk Delete (`DELETE /api/employees/[id]`)

- **Single & Bulk Deletion**: Mendukung penghapusan satuan via action menu serta _batch deletion_ dengan _checkbox selection_.
- **Optimistic Cache Eviction**: Helper `optimisticallyRemoveEmployeesFromCache(queryClient, ids)` seketika menyaring keluar item yang dihapus dari cache lokal dan mengoreksi counter meta total records.
- **Resilient Batch Processing**: Penghapusan massal memproses request secara paralel/bertahap dengan _progress indicator_, melaporkan daftar ID yang sukses vs gagal tanpa membatalkan operasi secara keseluruhan.

---

### 2. Reusable Architectural Patterns

#### 🧩 `useControllableState`

Memungkinkan komponen UI (seperti dialog Create, Edit, Delete, dan Bulk Delete) beroperasi secara fleksibel baik sebagai **Controlled Component** (state dikendalikan dari luar via props) maupun **Uncontrolled Component** (state dikelola internal oleh dialog itu sendiri):

```tsx
const [isOpen, setIsOpen] = useControllableState({
  value: controlledOpen,
  defaultValue: false,
  onChange: setControlledOpen,
});
```

#### 📦 Centralized Cache Utilities (`employee-cache-utils.ts`)

Mengeliminasi duplikasi kode pada TanStack Query mutation hooks:

- `snapshotEmployeeLists`: Mengambil snapshot dari seluruh cache `lists` dan `infiniteLists`.
- `rollbackEmployeeLists`: Mengembalikan cache ke snapshot jika mutasi error.
- `invalidateEmployeeLists`: Memastikan sinkronisasi akhir dengan backend.
- `optimisticallyRemoveEmployeesFromCache`: Menghapus satu atau banyak karyawan dari cache lokal seketika.

#### 🔑 Hierarchical Query Key Factory (`employeeKeys`)

```ts
export const employeeKeys = {
  all: ["employees"] as const,
  lists: () => [...employeeKeys.all, "list"] as const,
  list: (params: EmployeeListParams) =>
    [...employeeKeys.lists(), params] as const,
  infiniteLists: () => [...employeeKeys.all, "infinite-list"] as const,
  infiniteList: (params: Omit<EmployeeListParams, "page">) =>
    [...employeeKeys.infiniteLists(), params] as const,
  details: () => [...employeeKeys.all, "detail"] as const,
  detail: (id: string) => [...employeeKeys.details(), id] as const,
};
```

---

## 🔌 API Route Handlers Matrix

| Endpoint                     | Method   | Request / Query                         | Status Codes        | Deskripsi                                                 |
| ---------------------------- | -------- | --------------------------------------- | ------------------- | --------------------------------------------------------- |
| `/api/employees`             | `GET`    | `page`, `pageSize`, `search`, `sortBy`… | `200`, `400`, `502` | Mengambil daftar paginated karyawan dengan filter server  |
| `/api/employees`             | `POST`   | `EmployeeFormValues` (JSON body)        | `201`, `400`, `409` | Menambahkan karyawan baru (auto-number & check unique)    |
| `/api/employees/[id]`        | `GET`    | `id` (path parameter)                   | `200`, `404`, `502` | Mengambil data lengkap 1 karyawan untuk detail view & SSR |
| `/api/employees/[id]`        | `PATCH`  | Partial fields (JSON body)              | `200`, `400`, `404` | Memperbarui data karyawan                                 |
| `/api/employees/[id]`        | `DELETE` | `id` (path parameter)                   | `200`, `404`, `502` | Menghapus data karyawan secara permanen                   |
| `/api/employees/check-email` | `POST`   | `{ email, excludeId? }`                 | `200`, `400`        | Validasi keunikan email secara _real-time_                |

---

## 📜 Available Scripts

Run inside `frontend/`:

| Command                | Description                                                                   |
| ---------------------- | ----------------------------------------------------------------------------- |
| `npm run dev`          | Start the Next.js development server                                          |
| `npm run build`        | Build for production (Turbopack + SSG)                                        |
| `npm run start`        | Start the production server                                                   |
| `npm run lint`         | Run ESLint checks                                                             |
| `npm run format`       | Format code with Prettier                                                     |
| `npm run format:check` | Verify formatting consistency                                                 |
| `npm run test`         | Run Vitest in interactive watch mode                                          |
| `npm run test:run`     | Run Vitest test suite once (65+ test suites, 325+ tests)                      |
| `npm run check`        | Full CI Quality Gate (`typecheck` + `lint` + `format` + `test:run` + `build`) |

Run inside `backend/`:

| Command           | Description                                       |
| ----------------- | ------------------------------------------------- |
| `npm run seed`    | Generate 50,000 mock employee records using Faker |
| `npm run dev:api` | Start json-server on port 4000                    |

---

## 🗺️ Progress

- [x] **Minggu 1: Setup, Theming, Layout Semantic (28 Sep - 4 Okt)**
  - Next.js 16 App Router setup, dark/light theme, semantic HTML, security headers, GitHub Actions CI & branch protection.
- [x] **Minggu 2: Base Table + shadcn Table + TanStack Table (5-11 Okt)**
  - Dashboard shell, dynamic breadcrumbs, paginated table, sorting & pagination integration.
- [x] **Minggu 3: Performa Data Besar - Virtualization (12-18 Okt)**
  - Virtualized table dengan `@tanstack/react-virtual`, rendering 50.000 data dengan 60 FPS scrolling.
- [x] **Minggu 4: Search, Filter, Sort, Column Visibility (19-25 Okt)**
  - URL synchronization via `nuqs`, server-side debounced search, multiple column filters, dan dynamic column visibility.
- [x] **Minggu 5: Detail View & SEO (26 Okt - 1 Nov)**
  - SSR detail view (`/employees/[id]`), React Query `HydrationBoundary`, sitemap, robots, dan dynamic OpenGraph metadata.
- [x] **Minggu 6: Form Tambah & Edit Karyawan (2-8 Nov)**
  - Form validation dengan React Hook Form + Zod, asynchronous email verification, dan optimistic edit updates.
- [x] **Minggu 7: Delete, Bulk Delete, & Cache Invalidation (9-15 Nov)**
  - Single deletion & batch deletion dialogs, progress tracking, controllable state abstraction, dan centralized cache utils.
- [ ] **Minggu 8: Modul Asset & Inventory (Reuse Pattern) (16-22 Nov)**
  - Replikasi pattern arsitektur CRUD untuk modul Asset & Inventory.
- [ ] **Phase 2: Multi-level Approval Workflow**
  - Sortable approval chains (dnd-kit), request history, status transitions, dan in-app notifications.

---

## 📄 License

This project is for portfolio/demonstration purposes.
