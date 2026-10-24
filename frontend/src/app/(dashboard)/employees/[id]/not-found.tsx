import * as React from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, UserX } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Employee Not Found",
  robots: {
    index: false,
    follow: false,
  },
}

export default function EmployeeNotFound() {
  return (
    <div
      data-testid="employee-not-found"
      role="region"
      aria-label="Employee not found notice"
      className="flex min-h-100 flex-col items-center justify-center rounded-xl border border-dashed border-border p-8 text-center"
    >
      <div
        aria-hidden="true"
        className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground"
      >
        <UserX className="size-7" />
      </div>

      <h1 className="mt-4 text-lg font-semibold text-foreground">Employee Not Found</h1>

      <p className="mt-1.5 max-w-md text-sm text-muted-foreground">
        The employee you are looking for could not be found or may have been removed from the
        system.
      </p>

      <div className="mt-6">
        <Link href="/employees">
          <Button variant="default" size="sm" className="gap-2">
            <ArrowLeft className="size-4" />
            Back to Employees
          </Button>
        </Link>
      </div>
    </div>
  )
}
