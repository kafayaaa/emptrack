import * as React from "react"
import { Skeleton } from "@/components/ui/skeleton"

export function EmployeeDetailSkeleton() {
  return (
    <div data-testid="employee-detail-skeleton" className="flex flex-col gap-6">
      {/* Back button skeleton */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-36 rounded-md" />
      </div>

      {/* Hero profile card skeleton */}
      <section className="rounded-xl border border-border bg-card p-6 shadow-2xs">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="size-16 shrink-0 rounded-full" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-7 w-56 rounded-md" />
              <div className="flex flex-wrap items-center gap-2">
                <Skeleton className="h-4 w-24 rounded-md" />
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-28 rounded-md" />
            <Skeleton className="h-9 w-28 rounded-md" />
          </div>
        </div>
      </section>

      {/* Detail grid skeleton */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Employment Information Card Skeleton */}
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-2xs">
          <Skeleton className="h-5 w-44 rounded-md" />
          <div className="flex flex-col gap-3 pt-2">
            <Skeleton className="h-4 w-full rounded-md" />
            <Skeleton className="h-4 w-3/4 rounded-md" />
            <Skeleton className="h-4 w-4/5 rounded-md" />
            <Skeleton className="h-4 w-2/3 rounded-md" />
          </div>
        </div>

        {/* Role & Hierarchy Card Skeleton */}
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-2xs">
          <Skeleton className="h-5 w-40 rounded-md" />
          <div className="flex flex-col gap-3 pt-2">
            <Skeleton className="h-4 w-full rounded-md" />
            <Skeleton className="h-4 w-3/4 rounded-md" />
            <Skeleton className="h-4 w-2/3 rounded-md" />
          </div>
        </div>

        {/* Contact & Identification Card Skeleton */}
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-2xs md:col-span-2 lg:col-span-1">
          <Skeleton className="h-5 w-48 rounded-md" />
          <div className="flex flex-col gap-3 pt-2">
            <Skeleton className="h-4 w-full rounded-md" />
            <Skeleton className="h-4 w-4/5 rounded-md" />
            <Skeleton className="h-4 w-3/4 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  )
}
