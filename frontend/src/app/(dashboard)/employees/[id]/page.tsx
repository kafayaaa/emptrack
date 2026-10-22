import * as React from "react"
import type { Metadata } from "next"
import { EmployeeDetailContainer, EmployeeDetailSkeleton } from "@/features/employees"
import { getEmployeeByIdServer } from "@/features/employees/api/employees.server"

interface EmployeeDetailPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: EmployeeDetailPageProps): Promise<Metadata> {
  const { id } = await params
  const employee = await getEmployeeByIdServer(id)

  if (!employee) {
    return {
      title: "Employee Not Found",
      description: `Employee record with ID "${id}" could not be found.`,
      robots: {
        index: false,
        follow: false,
      },
    }
  }

  const title = `${employee.fullName} - ${employee.position}`
  const description = `View complete employment details for ${employee.fullName} (${employee.employeeNumber}), ${employee.position} in the ${employee.department} department at EmpTrack.`

  return {
    title,
    description,
    alternates: {
      canonical: `/employees/${employee.id}`,
    },
    openGraph: {
      title: `${employee.fullName} - ${employee.position} | EmpTrack`,
      description,
      url: `/employees/${employee.id}`,
      type: "profile",
      firstName: employee.fullName.split(" ")[0],
      lastName: employee.fullName.split(" ").slice(1).join(" ") || undefined,
      username: employee.employeeNumber,
    },
    twitter: {
      card: "summary",
      title: `${employee.fullName} - ${employee.position}`,
      description,
    },
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
