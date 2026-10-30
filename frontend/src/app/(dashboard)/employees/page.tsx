import * as React from "react"
import { Metadata } from "next"
import Link from "next/link"
import dynamic from "next/dynamic"
import { Gauge } from "lucide-react"
import { EmployeeViewContainer, EmployeeTableSkeleton } from "@/features/employees"
import { Button } from "@/components/ui/button"

const EmployeeCreateDialog = dynamic(() =>
  import("@/features/employees/components/employee-create-dialog").then(
    (m) => m.EmployeeCreateDialog,
  ),
)

export const metadata: Metadata = {
  title: "Employees",
  description:
    "Daftar dan kelola data seluruh karyawan, divisi, dan hierarki organisasi di EmpTrack.",
  alternates: {
    canonical: "/employees",
  },
}

export default function EmployeePage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Employees</h1>
          <p className="text-sm text-muted-foreground">
            Manage and monitor all organization members and their employment details.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <EmployeeCreateDialog />
          <Link href="/employees/benchmark">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <Gauge className="size-3.5" /> Virtualization Benchmark (10k)
            </Button>
          </Link>
        </div>
      </div>

      <React.Suspense fallback={<EmployeeTableSkeleton rowCount={10} />}>
        <EmployeeViewContainer />
      </React.Suspense>
    </div>
  )
}
