import { EmployeeTableSkeleton } from "@/features/employees"

export default function EmployeesLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Karyawan</h1>
          <p className="text-sm text-muted-foreground">
            Kelola data seluruh karyawan, status kepegawaian, dan aset yang ditugaskan.
          </p>
        </div>
      </div>

      <EmployeeTableSkeleton rowCount={10} />
    </div>
  )
}
