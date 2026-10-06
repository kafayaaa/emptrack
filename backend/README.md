# EmpTrack Backend (Mock API)

Mock backend for **EmpTrack**, an employee and asset management dashboard.
It generates a large, realistic, reproducible dataset with
[`@faker-js/faker`](https://fakerjs.dev) and serves it as a REST API with
[`json-server`](https://github.com/typicode/json-server).

The goal is to test the frontend against **tens of thousands of records**
(server-side pagination, caching, infinite-scroll filters) before a real
backend exists.

## Tech stack

| Tool                               | Purpose                                                    |
| ---------------------------------- | ---------------------------------------------------------- |
| `@faker-js/faker` (locale `id_ID`) | Generate Indonesian-style names and phone numbers          |
| `zod`                              | Validate the generated data (shape, uniqueness, relations) |
| `tsx`                              | Run the TypeScript seed script directly                    |
| `json-server`                      | Serve `db.json` as a REST API                              |
| `typescript`                       | Type checking (`npm run typecheck`)                        |

## Project structure

```
backend/
├── scripts/
│   └── seed.ts            # Data generator (generate -> validate -> write file)
├── fixtures/
│   └── db.small.json      # Small dataset, committed (for tests and CI)
├── db.json                # Full dataset, generated locally (git-ignored)
├── tsconfig.json
└── package.json
```

## Getting started

**Requirements:** Node.js 20 or newer (LTS).

```bash
cd backend
npm install

# 1. Generate the full dataset (-> db.json)
npm run seed

# 2. Start the mock API on http://localhost:4000
npm run dev:api
```

## Scripts

| Command              | Description                                            |
| -------------------- | ------------------------------------------------------ |
| `npm run seed`       | Generate the full dataset into `db.json`               |
| `npm run seed:small` | Generate a small dataset into `fixtures/db.small.json` |
| `npm run dev:api`    | Serve `db.json` with json-server on port 4000          |
| `npm run typecheck`  | Run the TypeScript compiler without emitting files     |

### Seed options

Options are passed as `--name=value`:

| Option        | Default   | Description                                         |
| ------------- | --------- | --------------------------------------------------- |
| `--employees` | `50000`   | Number of employees (minimum 8, one per department) |
| `--projects`  | `3000`    | Number of projects (minimum 8, one per department)  |
| `--out`       | `db.json` | Output file path                                    |

Example:

```bash
npx tsx scripts/seed.ts --employees=10000 --projects=500 --out=db.json
```

## Seed result

Measured with the default settings (`npm run seed`):

| Metric                                      | Value      |
| ------------------------------------------- | ---------- |
| Projects                                    | 3,000      |
| Employees                                   | 50,000     |
| Managers (employees with `isManager: true`) | ~2,500     |
| File size                                   | `14.75 MB` |
| Duration                                    | `0.73 s`   |

## Data model

### Employee (`/employees`)

| Field            | Type           | Notes                                                           |
| ---------------- | -------------- | --------------------------------------------------------------- |
| `id`             | string         | Unique                                                          |
| `employeeNumber` | string         | Unique, e.g. `EMP-00042`                                        |
| `fullName`       | string         |                                                                 |
| `email`          | string         | Unique, uses the reserved `@emptrack.test` domain               |
| `phone`          | string         |                                                                 |
| `department`     | enum           | 8 fixed departments                                             |
| `position`       | string         | Matches the department; managers get a managerial title         |
| `status`         | enum           | `active` (85%), `on_leave` (10%), `inactive` (5%)               |
| `hireDate`       | string         | `YYYY-MM-DD`, never in the future                               |
| `isManager`      | boolean        | About 5% of employees                                           |
| `managerId`      | string \| null | `null` for managers, otherwise a manager in the same department |
| `projectId`      | string         | Project of the same department                                  |

### Project (`/projects`)

| Field         | Type   | Notes                                                  |
| ------------- | ------ | ------------------------------------------------------ |
| `id`          | string | Unique                                                 |
| `projectCode` | string | Unique, e.g. `PRJ-0042`                                |
| `name`        | string | Type + city + year, e.g. `Migrasi Cloud Surabaya 2023` |
| `department`  | enum   | Owning department                                      |
| `status`      | enum   | `planning`, `active`, `on_hold`, `completed`           |
| `startDate`   | string | `YYYY-MM-DD`                                           |

### Relations

- `employee.projectId` -> `project.id`
- `employee.managerId` -> `employee.id` (where `isManager` is `true`)
- Employees, managers and projects always share a department.

## Example requests

Pagination and filter parameters depend on the pinned json-server version.
Check its documentation if a query behaves differently.

```bash
# First 200 projects (e.g. options for an async filter)
curl "http://localhost:4000/projects?_page=1&_per_page=200"

# First 200 managers
curl "http://localhost:4000/employees?isManager=true&_page=1&_per_page=200"

# Employees of one project
curl "http://localhost:4000/employees?projectId=12&_page=1&_per_page=50"
```

## Design decisions

- **Reproducible data.** `faker.seed(42)` and fixed date ranges mean every run
  produces the same dataset, so bugs are easy to reproduce.
- **Validated output.** The script validates the whole dataset with `zod` and
  checks uniqueness and relations. It fails fast with a clear message.
- **Managers are employees.** A single source of truth. Manager filter options
  come from `/employees?isManager=true`.
- **Realistic relations.** Positions, managers and projects follow the
  employee's department, so combined filters return meaningful results.
- **Compact output.** `db.json` is written without indentation, which keeps the
  file much smaller for tens of thousands of records.
- **Fixture for CI.** A small committed dataset keeps tests fast, while the
  large `db.json` stays out of Git.

## Limitations and security notes

- **Development only.** json-server has no authentication or authorization.
  Do not expose it publicly as a production backend.
- **No real data.** All names are random and every email uses the reserved
  `.test` domain.
- **One project per employee.** Simplified on purpose. A real system would
  usually model this as many-to-many.
- **Assets are not generated yet.** Planned as a follow-up.
