import * as React from "react"
import { Skeleton } from "@/components/ui/skeleton"

export function AssetDetailSkeleton() {
  return (
    <div
      data-testid="asset-detail-skeleton"
      role="status"
      aria-busy="true"
      aria-label="Loading asset details"
      className="flex flex-col gap-6"
    >
      <span className="sr-only">Loading asset details...</span>

      {/* Back button skeleton */}
      <nav aria-label="Loading navigation" className="flex items-center gap-2">
        <Skeleton className="h-8 w-36 rounded-md" />
      </nav>

      {/* Hero asset card skeleton */}
      <header className="rounded-xl border border-border bg-card p-4 shadow-2xs sm:p-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3.5 sm:gap-4">
            <Skeleton className="size-14 shrink-0 rounded-xl sm:size-16" />
            <div className="flex min-w-0 flex-col gap-2">
              <Skeleton className="h-6 w-44 rounded-md sm:h-7 sm:w-56" />
              <div className="flex flex-wrap items-center gap-2">
                <Skeleton className="h-4 w-20 rounded-md sm:w-24" />
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
            </div>
          </div>
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <Skeleton className="h-9 flex-1 rounded-md sm:w-28 sm:flex-initial" />
          </div>
        </div>
      </header>

      {/* Tabs navigation skeleton */}
      <div
        className="grid h-10 w-full grid-cols-3 gap-1 rounded-lg bg-muted p-1 sm:inline-flex sm:h-10 sm:w-auto"
        aria-hidden="true"
      >
        <Skeleton className="h-full w-full rounded-md sm:w-28" />
        <Skeleton className="h-full w-full rounded-md sm:w-36" />
        <Skeleton className="h-full w-full rounded-md sm:w-28" />
      </div>

      {/* Content cards grid skeleton */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5">
          <Skeleton className="mb-4 h-5 w-40" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <Skeleton className="mb-4 h-5 w-40" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </div>
    </div>
  )
}
