import { mkdirSync, statSync, writeFileSync } from 'node:fs'; // tulis file, buat folder, cek ukuran file
import { dirname } from 'node:path';                           // ambil nama folder dari path
import { fakerID_ID as faker } from '@faker-js/faker';         // Faker locale Indonesia, di-alias jadi "faker"
import { z } from 'zod';                                       // validasi bentuk data

/* ========== 1. KONSTANTA (data master, bukan random bebas) ========== */

// "as const" = tuple literal, dipakai z.enum() dan tipe Department.
const DEPARTMENTS = [
  'Engineering', 'Finance', 'Human Resources', 'Marketing',
  'Operations', 'Sales', 'Legal', 'Customer Support',
] as const;
type Department = (typeof DEPARTMENTS)[number];

// Posisi per department agar data konsisten.
const POSITIONS: Record<Department, readonly string[]> = {
  Engineering: ['Frontend Developer', 'Backend Developer', 'QA Engineer', 'DevOps Engineer'],
  Finance: ['Accountant', 'Financial Analyst', 'Tax Specialist'],
  'Human Resources': ['Recruiter', 'HR Generalist', 'Payroll Officer'],
  Marketing: ['Content Writer', 'SEO Specialist', 'Brand Executive'],
  Operations: ['Operations Staff', 'Logistics Coordinator', 'Procurement Officer'],
  Sales: ['Sales Executive', 'Account Manager', 'Business Developer'],
  Legal: ['Legal Officer', 'Compliance Officer', 'Paralegal'],
  'Customer Support': ['Support Agent', 'Support Lead', 'Customer Success'],
};

const STATUSES = ['active', 'on_leave', 'inactive'] as const;
type EmployeeStatus = (typeof STATUSES)[number];

// weight = bobot relatif. Distribusi tidak merata supaya terlihat realistis.
const STATUS_WEIGHTS: { weight: number; value: EmployeeStatus }[] = [
  { weight: 85, value: 'active' },
  { weight: 10, value: 'on_leave' },
  { weight: 5, value: 'inactive' },
];

// Jabatan khusus manager.
const MANAGER_TITLE_WEIGHTS = [
  { weight: 70, value: 'Manager' },
  { weight: 25, value: 'Senior Manager' },
  { weight: 5, value: 'Head of Department' },
];

// Peluang seorang employee menjadi manager: sekitar 5% (50.000 -> ±2.500 manager).
const MANAGER_WEIGHTS = [
  { weight: 5, value: true },
  { weight: 95, value: false },
];

// Bahan nama project: jenis + kota + tahun, contoh "Migrasi Cloud Surabaya 2023".
const PROJECT_TYPES = [
  'Implementasi ERP', 'Migrasi Cloud', 'Audit Internal', 'Kampanye Digital',
  'Optimasi Logistik', 'Pengembangan Portal', 'Rekrutmen Massal',
  'Integrasi Payment', 'Renovasi Kantor', 'Pelatihan Karyawan',
] as const;

const PROJECT_STATUSES = ['planning', 'active', 'on_hold', 'completed'] as const;
type ProjectStatus = (typeof PROJECT_STATUSES)[number];

const PROJECT_STATUS_WEIGHTS: { weight: number; value: ProjectStatus }[] = [
  { weight: 50, value: 'active' },
  { weight: 15, value: 'planning' },
  { weight: 10, value: 'on_hold' },
  { weight: 25, value: 'completed' },
];

// Rentang tanggal TETAP (bukan "sekarang") agar hasil seed deterministik di hari apa pun.
const HIRE_FROM = new Date('2015-01-01');
const HIRE_TO = new Date('2026-09-30');
const PROJECT_FROM = new Date('2018-01-01');

/* ========== 2. SCHEMA ZOD (kontrak bentuk data) ========== */

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/; // format YYYY-MM-DD

const ProjectSchema = z.object({
  id: z.string(),                         // json-server memakai id bertipe string
  projectCode: z.string(),                // contoh: PRJ-0042
  name: z.string().min(1),
  department: z.enum(DEPARTMENTS),        // department pemilik project
  status: z.enum(PROJECT_STATUSES),
  startDate: z.string().regex(DATE_REGEX),
});

const EmployeeSchema = z.object({
  id: z.string(),
  employeeNumber: z.string(),             // contoh: EMP-00042
  fullName: z.string().min(1),
  email: z.string().email(),
  phone: z.string(),
  department: z.enum(DEPARTMENTS),
  position: z.string(),
  status: z.enum(STATUSES),
  hireDate: z.string().regex(DATE_REGEX),
  isManager: z.boolean(),                 // true = employee ini juga manager
  managerId: z.string().nullable(),       // null untuk manager, selain itu id manager atasannya
  projectId: z.string(),                  // relasi ke Project.id
});

// Tipe TypeScript diturunkan dari schema: satu sumber kebenaran.
type Project = z.infer<typeof ProjectSchema>;
type Employee = z.infer<typeof EmployeeSchema>;
// Employee sebelum managerId terisi (atasan baru bisa dipilih setelah semua employee ada).
type EmployeeDraft = Omit<Employee, 'managerId'>;

/* ========== 3. HELPER KECIL ========== */

// Membaca argumen CLI berbentuk --nama=nilai, contoh: --employees=100
function getArg(name: string): string | undefined {
  const found = process.argv.find((arg) => arg.startsWith(`--${name}=`));
  return found?.split('=')[1];
}

// Membaca argumen angka dan memvalidasinya; jika tidak ada pakai nilai default.
function readNumberArg(name: string, fallback: number): number {
  const raw = getArg(name);
  if (raw === undefined) return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`Argumen --${name} harus bilangan bulat positif, diterima: "${raw}"`);
  }
  return value;
}

// pad(42, 5) -> "00042"
const pad = (value: number, length: number) => String(value).padStart(length, '0');

// Date -> "YYYY-MM-DD"
const toDateString = (date: Date): string => date.toISOString().slice(0, 10);

// "Budi Santoso" -> "budi.santoso" (untuk bagian depan email)
function toSlug(name: string): string {
  return name
    .normalize('NFD')                   // pisahkan huruf dan aksen
    .replace(/[\u0300-\u036f]/g, '')    // buang aksen
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '.')        // selain huruf/angka jadi titik
    .replace(/^\.|\.$/g, '');           // buang titik di awal/akhir
}

// Melempar error jika ada nilai duplikat.
function assertUnique(label: string, values: string[]): void {
  if (new Set(values).size !== values.length) {
    throw new Error(`Field ${label} tidak unik`);
  }
}

// Mengelompokkan item per department (generic: bisa untuk project maupun employee).
function groupByDepartment<T extends { department: Department }>(items: T[]): Map<Department, T[]> {
  const grouped = new Map<Department, T[]>();
  for (const item of items) {
    const list = grouped.get(item.department) ?? [];
    list.push(item);
    grouped.set(item.department, list);
  }
  return grouped;
}

/* ========== 4. GENERATOR ========== */

function generateProjects(count: number): Project[] {
  // Array.from({ length }) membuat array sepanjang "count"; callback dipanggil per index.
  return Array.from({ length: count }, (_, index) => {
    const number = index + 1;
    const startDate = faker.date.between({ from: PROJECT_FROM, to: HIRE_TO });

    return {
      id: String(number),
      projectCode: `PRJ-${pad(number, 4)}`,
      name: `${faker.helpers.arrayElement(PROJECT_TYPES)} ${faker.location.city()} ${startDate.getFullYear()}`,
      // Round-robin: setiap department pasti punya project.
      department: DEPARTMENTS[index % DEPARTMENTS.length],
      status: faker.helpers.weightedArrayElement(PROJECT_STATUS_WEIGHTS),
      startDate: toDateString(startDate),
    };
  });
}

function generateEmployees(count: number, projects: Project[]): Employee[] {
  const projectsByDepartment = groupByDepartment(projects);

  // FASE 1: buat semua employee tanpa managerId.
  const drafts: EmployeeDraft[] = Array.from({ length: count }, (_, index) => {
    const number = index + 1;
    const fullName = faker.person.fullName();

    // 8 employee pertama dipaksa jadi manager, satu per department,
    // supaya setiap department pasti punya manager untuk fase 2.
    const isForcedManager = index < DEPARTMENTS.length;
    const department = isForcedManager
      ? DEPARTMENTS[index]
      : faker.helpers.arrayElement(DEPARTMENTS);
    const isManager = isForcedManager || faker.helpers.weightedArrayElement(MANAGER_WEIGHTS);

    // Employee ditempatkan di project dari department yang sama.
    const project = faker.helpers.arrayElement(projectsByDepartment.get(department)!);

    return {
      id: String(number),
      employeeNumber: `EMP-${pad(number, 5)}`,
      fullName,
      // Nomor urut menjamin email unik; domain .test = bukan email nyata.
      email: `${toSlug(fullName)}.${number}@emptrack.test`,
      phone: faker.phone.number(),
      department,
      position: isManager
        ? faker.helpers.weightedArrayElement(MANAGER_TITLE_WEIGHTS)
        : faker.helpers.arrayElement(POSITIONS[department]),
      status: faker.helpers.weightedArrayElement(STATUS_WEIGHTS),
      hireDate: toDateString(faker.date.between({ from: HIRE_FROM, to: HIRE_TO })),
      isManager,
      projectId: project.id,
    };
  });

  // FASE 2: setelah semua manager diketahui, tentukan atasan tiap employee.
  const managersByDepartment = groupByDepartment(drafts.filter((draft) => draft.isManager));

  return drafts.map((draft) => ({
    ...draft, // salin semua field draft
    // Manager = null. Non-manager = manager acak dari department yang sama.
    managerId: draft.isManager
      ? null
      : faker.helpers.arrayElement(managersByDepartment.get(draft.department)!).id,
  }));
}

/* ========== 5. MAIN: generate -> validasi -> tulis file ========== */

function main(): void {
  const startedAt = performance.now(); // untuk mengukur durasi

  const employeeCount = readNumberArg('employees', 50000);
  const projectCount = readNumberArg('projects', 3000);
  const outPath = getArg('out') ?? 'db.json';

  // Syarat minimal agar setiap department punya manager dan project.
  if (employeeCount < DEPARTMENTS.length || projectCount < DEPARTMENTS.length) {
    throw new Error(`--employees dan --projects minimal ${DEPARTMENTS.length} (jumlah department)`);
  }

  faker.seed(42); // seed tetap = hasil selalu sama setiap dijalankan

  // Urutan penting: project dulu karena employee mereferensikannya.
  const projects = generateProjects(projectCount);
  const employees = generateEmployees(employeeCount, projects);

  // Validasi bentuk data; jika ada yang salah, script berhenti di sini.
  const db = {
    projects: z.array(ProjectSchema).parse(projects),
    employees: z.array(EmployeeSchema).parse(employees),
  };

  // Validasi keunikan.
  assertUnique('project.id', db.projects.map((p) => p.id));
  assertUnique('project.projectCode', db.projects.map((p) => p.projectCode));
  assertUnique('employee.id', db.employees.map((e) => e.id));
  assertUnique('employee.email', db.employees.map((e) => e.email));
  assertUnique('employee.employeeNumber', db.employees.map((e) => e.employeeNumber));

  // Validasi relasi. Set = pencarian cepat (O(1) per cek).
  const projectIds = new Set(db.projects.map((p) => p.id));
  const managerIds = new Set(db.employees.filter((e) => e.isManager).map((e) => e.id));

  for (const employee of db.employees) {
    if (!projectIds.has(employee.projectId)) {
      throw new Error(`Employee ${employee.id} merujuk projectId tidak ada: ${employee.projectId}`);
    }
    // Manager harus null; non-manager harus menunjuk ke employee yang isManager = true.
    const managerIdInvalid = employee.isManager
      ? employee.managerId !== null
      : !managerIds.has(employee.managerId ?? '');
    if (managerIdInvalid) {
      throw new Error(`Employee ${employee.id} punya managerId tidak valid: ${employee.managerId}`);
    }
  }

  // Buat folder tujuan jika belum ada, lalu tulis file.
  // JSON.stringify TANPA indentasi: ukuran file jauh lebih kecil untuk puluhan ribu record.
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, JSON.stringify(db));

  const sizeMb = (statSync(outPath).size / 1024 / 1024).toFixed(2);
  const seconds = ((performance.now() - startedAt) / 1000).toFixed(2);
  console.log(
    `✔ ${db.projects.length} projects, ${db.employees.length} employees ` +
      `(${managerIds.size} managers) -> ${outPath} (${sizeMb} MB, ${seconds}s)`,
  );
}

main();