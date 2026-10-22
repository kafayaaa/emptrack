import * as React from "react"
import type { Metadata } from "next"
import { EmployeeDetailContainer, EmployeeDetailSkeleton } from "@/features/employees"

interface EmployeeDetailPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: EmployeeDetailPageProps): Promise<Metadata> {
  const { id } = await params
  return {
    title: `Detail Employee #${id} | EmpTrack`,
    description: `View complete employment details and records for employee ${id}.`,
  }
}

export default async function EmployeeDetailPage({ params }: EmployeeDetailPageProps) {
  const { id } = await params

  return (
    <React.Suspense fallback={<EmployeeDetailSkeleton />}>
      <EmployeeDetailContainer id={id} />
    </React.Suspense>
  )
}
