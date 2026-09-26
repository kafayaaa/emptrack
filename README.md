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

> Employee & Inventory Management Dashboard with Multi-level Approval Workflow

A full-stack dashboard application for managing employee data and company inventory at scale, with a multi-level approval workflow built on top. Built as a portfolio project to demonstrate production-grade frontend architecture for handling large datasets (tens of thousands of records) with a strong focus on performance, UX, and maintainability.

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
- 🔍 Server-driven filtering, search, and pagination — synced to the URL (shareable, bookmarkable, refresh-safe)
- ⚡ Smart client-side caching — navigating back to a previously visited page doesn't refetch unnecessarily
- ♿ Accessible, semantic HTML for better screen-reader support and SEO
- 🎨 Consistent design system powered by shadcn/ui (Base UI)
- ✅ End-to-end type safety with TypeScript + Zod schema validation
- 🔒 Route protection via middleware (auth guard)

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
| Validation                | [Zod](https://zod.dev/)                                                                         |
| Forms _(Phase 2)_         | React Hook Form                                                                                 |
| Drag & Drop _(Phase 2)_   | dnd-kit                                                                                         |
| Notifications _(Phase 2)_ | Sonner                                                                                          |
| Client State _(Phase 2)_  | Zustand                                                                                         |

## 📁 Project Structure

The frontend follows a **feature-based architecture**: routing stays thin, and each business domain owns its own components, hooks, and logic.

```
frontend/
├── src/
│   ├── app/                  # Routing only (App Router) — thin, composes from features/
│   ├── features/             # Business logic per domain
│   │   ├── employees/
│   │   │   ├── api/          # Fetchers & query keys
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── schema.ts     # Zod schemas
│   │   │   ├── types.ts
│   │   │   └── utils.ts
│   │   ├── inventory/
│   │   └── approvals/        # Phase 2
│   ├── components/
│   │   ├── ui/                # shadcn/ui generated components
│   │   └── shared/            # Cross-feature components
│   ├── lib/                   # query-client, api-client, utils
│   ├── hooks/                 # Generic, cross-feature hooks
│   ├── config/                 # Site config, nav items, constants
│   ├── types/                  # Global types
│   └── middleware.ts           # Auth guard
└── public/
```

## 🏁 Getting Started

### Prerequisites

- Node.js (LTS version)
- npm / pnpm / yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/<username>/emptrack.git
cd emptrack/frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
```

### Environment Variables

```env
NEXT_PUBLIC_API_BASE_URL=
```

### Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📜 Available Scripts

| Command         | Description                  |
| --------------- | ---------------------------- |
| `npm run dev`   | Start the development server |
| `npm run build` | Build for production         |
| `npm run start` | Start the production server  |
| `npm run lint`  | Run ESLint                   |

## 📄 License

This project is for portfolio/demonstration purposes.
