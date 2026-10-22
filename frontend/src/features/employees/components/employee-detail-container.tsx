"use client"

import * as React from "react"
import Link from "next/link"
import { AlertCircle, ArrowLeft, RefreshCw, UserX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ApiError } from "@/lib/api-client"
import { useEmployee } from "../hooks"
import { EmployeeDetailView } from "./employee-detail-view"
import { EmployeeDetailSkeleton } from "./employee-detail-skeleton"

export interface EmployeeDetailContainerProps {
  id: string
}

export function EmployeeDetailContainer({ id }: EmployeeDetailContainerProps) {
  const { data: employee, isLoading, isError, error, refetch, isFetching } = useEmployee(id)

  if (isLoading) {
    return <EmployeeDetailSkeleton />
  }

  if (isError || !employee) {
    const isNotFound =
      (error instanceof ApiError && error.status === 404) ||
      error?.message?.toLowerCase().includes("not found")

    if (isNotFound) {
      return (
        <div
          data-testid="employee-detail-not-found"
          className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed border-border p-8 text-center"
        >
          <div className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <UserX className="size-7" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-foreground">Employee Not Found</h2>
          <p className="mt-1.5 max-w-md text-sm text-muted-foreground">
            We couldn&apos;t find an employee with ID{" "}
            <span className="font-mono font-medium text-foreground">&quot;{id}&quot;</span>. The
            record might have been removed or the ID might be incorrect.
          </p>
          <div className="mt-6">
            <Link href="/employees">
              <Button variant="default" size="sm" className="gap-2">
                <ArrowLeft className="size-4" />
                Back to Employees List
              </Button>
            </Link>
          </div>
        </div>
      )
    }

    return (
      <div
        data-testid="employee-detail-error"
        className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center"
      >
        <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertCircle className="size-7" />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-foreground">
          Unable to Load Employee Details
        </h2>
        <p className="mt-1.5 max-w-md text-sm text-muted-foreground">
          {error?.message || "An unexpected error occurred while communicating with the server."}
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="gap-2"
          >
            <RefreshCw className={`size-3.5 ${isFetching ? "animate-spin" : ""}`} />
            Try Again
          </Button>
          <Link href="/employees">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="size-4" />
              Back to Employees
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return <EmployeeDetailView employee={employee} />
}
