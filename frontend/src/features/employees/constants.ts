/**
 * Master data constants for employee domain matching seed/backend generator.
 */

export const EMPLOYEE_DEPARTMENTS = [
  "Engineering",
  "Finance",
  "Human Resources",
  "Marketing",
  "Operations",
  "Sales",
  "Legal",
  "Customer Support",
] as const

export type EmployeeDepartment = (typeof EMPLOYEE_DEPARTMENTS)[number]

export const EMPLOYEE_POSITIONS: Record<EmployeeDepartment, readonly string[]> = {
  Engineering: ["Frontend Developer", "Backend Developer", "QA Engineer", "DevOps Engineer"],
  Finance: ["Accountant", "Financial Analyst", "Tax Specialist"],
  "Human Resources": ["Recruiter", "HR Generalist", "Payroll Officer"],
  Marketing: ["Content Writer", "SEO Specialist", "Brand Executive"],
  Operations: ["Operations Staff", "Logistics Coordinator", "Procurement Officer"],
  Sales: ["Sales Executive", "Account Manager", "Business Developer"],
  Legal: ["Legal Officer", "Compliance Officer", "Paralegal"],
  "Customer Support": ["Support Agent", "Support Lead", "Customer Success"],
}

export const ALL_EMPLOYEE_POSITIONS = Array.from(
  new Set(Object.values(EMPLOYEE_POSITIONS).flat()),
).sort()

export const EMPLOYEE_STATUS_OPTIONS = [
  { value: "active", label: "Aktif" },
  { value: "on_leave", label: "Cuti" },
  { value: "inactive", label: "Nonaktif" },
] as const
