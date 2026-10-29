import * as React from "react"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function DashboardSkeleton() {
  return (
    <div data-testid="dashboard-skeleton" className="flex animate-pulse flex-col gap-6">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Skeleton className="h-8 w-44 rounded-md" />
          <Skeleton className="h-4 w-72 rounded-md" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-32 rounded-md" />
          <Skeleton className="h-9 w-28 rounded-md" />
        </div>
      </div>

      {/* KPI Stats Grid Skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <Skeleton className="h-3.5 w-24 rounded-md" />
                <Skeleton className="h-7 w-28 rounded-md" />
                <Skeleton className="h-3 w-36 rounded-md" />
              </div>
              <Skeleton className="size-11 rounded-xl" />
            </div>
          </Card>
        ))}
      </div>

      {/* Row 2: Status & Categories Skeleton */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="space-y-2">
            <Skeleton className="h-5 w-40 rounded-md" />
            <Skeleton className="h-3.5 w-60 rounded-md" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-3.5 w-full rounded-full" />
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-lg" />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-2">
            <Skeleton className="h-5 w-40 rounded-md" />
            <Skeleton className="h-3.5 w-60 rounded-md" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between">
                  <Skeleton className="h-3.5 w-24 rounded-md" />
                  <Skeleton className="h-3.5 w-12 rounded-md" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Departments & Recent Assets Skeleton */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="space-y-2">
            <Skeleton className="h-5 w-44 rounded-md" />
            <Skeleton className="h-3.5 w-64 rounded-md" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between">
                  <Skeleton className="h-3.5 w-28 rounded-md" />
                  <Skeleton className="h-3.5 w-12 rounded-md" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-2">
            <Skeleton className="h-5 w-44 rounded-md" />
            <Skeleton className="h-3.5 w-64 rounded-md" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <Skeleton className="size-9 rounded-lg" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-3.5 w-36 rounded-md" />
                    <Skeleton className="h-3 w-24 rounded-md" />
                  </div>
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
