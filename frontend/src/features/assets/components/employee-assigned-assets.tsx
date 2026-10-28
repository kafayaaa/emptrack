"use client"

import * as React from "react"
import Link from "next/link"
import {
  Laptop,
  Monitor,
  Smartphone,
  Box,
  PackageOpen,
  ArrowRight,
  RefreshCw,
  AlertCircle,
} from "lucide-react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useAssets, usePrefetchAsset } from "../hooks"
import type { Asset, AssetCategory } from "../types"
import { AssetStatusBadge } from "./asset-status-badge"

export interface EmployeeAssignedAssetsProps {
  employeeId: string
  employeeName: string
}

function getCategoryIcon(category: AssetCategory) {
  switch (category) {
    case "Laptop":
      return <Laptop className="size-4 shrink-0" aria-hidden="true" />
    case "Monitor":
      return <Monitor className="size-4 shrink-0" aria-hidden="true" />
    case "Mobile Device":
      return <Smartphone className="size-4 shrink-0" aria-hidden="true" />
    default:
      return <Box className="size-4 shrink-0" aria-hidden="true" />
  }
}

export function EmployeeAssignedAssets({ employeeId, employeeName }: EmployeeAssignedAssetsProps) {
  const { prefetchAsset } = usePrefetchAsset()
  const { data, isLoading, isError, error, refetch, isFetching } = useAssets({
    assignedToId: employeeId,
    pageSize: 50,
  })

  const assets = data?.data ?? []

  return (
    <Card
      data-testid="employee-assigned-assets-card"
      className="flex flex-col gap-4 p-4 shadow-2xs sm:p-5"
    >
      <CardHeader className="flex flex-col gap-1.5 border-b border-border/60 p-0 pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Laptop className="size-4 text-primary" aria-hidden="true" />
          <div>
            <CardTitle as="h2" className="text-sm font-semibold text-foreground">
              Assigned Assets & Hardware
            </CardTitle>
            <CardDescription className="text-xs">
              Daftar perangkat dan fasilitas inventaris yang ditugaskan ke {employeeName}
            </CardDescription>
          </div>
        </div>
        {assets.length > 0 && (
          <Badge variant="secondary" className="w-fit text-xs font-normal">
            {assets.length} Aset Terhubung
          </Badge>
        )}
      </CardHeader>

      <CardContent className="p-0">
        {isLoading ? (
          <div
            data-testid="assigned-assets-loading"
            className="grid grid-cols-1 gap-3 sm:grid-cols-2"
          >
            {[1, 2].map((i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/20 p-3"
              >
                <Skeleton className="size-8 shrink-0 rounded-md" />
                <div className="flex w-full flex-col gap-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div
            data-testid="assigned-assets-error"
            className="flex flex-col items-center justify-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center text-xs"
          >
            <AlertCircle className="size-6 text-destructive" />
            <p className="font-medium text-destructive">Gagal memuat data aset karyawan</p>
            <p className="text-muted-foreground">{error?.message ?? "Terjadi kesalahan sistem."}</p>
            <Button
              variant="outline"
              size="xs"
              onClick={() => void refetch()}
              disabled={isFetching}
              className="mt-2 gap-1.5"
            >
              <RefreshCw className={`size-3.5 ${isFetching ? "animate-spin" : ""}`} />
              Coba Lagi
            </Button>
          </div>
        ) : assets.length === 0 ? (
          <div
            data-testid="assigned-assets-empty"
            className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border/70 p-8 text-center"
          >
            <div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <PackageOpen className="size-5" />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-foreground">Belum ada aset yang ditugaskan</p>
              <p className="text-xs text-muted-foreground">
                Karyawan ini saat ini tidak memiliki perangkat atau hardware yang tercatat.
              </p>
            </div>
          </div>
        ) : (
          <div data-testid="assigned-assets-list" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {assets.map((asset: Asset) => (
              <div
                key={asset.id}
                data-testid={`assigned-asset-item-${asset.id}`}
                className="flex items-start justify-between gap-3 rounded-lg border border-border/60 bg-muted/20 p-3 transition-colors hover:border-primary/40 hover:bg-muted/40"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                    {getCategoryIcon(asset.category)}
                  </div>
                  <div className="flex min-w-0 flex-col gap-0.5 text-xs">
                    <Link
                      href={`/assets/${asset.id}`}
                      onMouseEnter={() => prefetchAsset(asset.id)}
                      onFocus={() => prefetchAsset(asset.id)}
                      className="truncate font-medium text-foreground transition-colors hover:text-primary hover:underline"
                    >
                      {asset.name}
                    </Link>
                    <span className="truncate text-muted-foreground">{asset.model}</span>
                    <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                      <span className="font-mono font-medium text-foreground">
                        {asset.assetTag}
                      </span>
                      {asset.serialNumber && (
                        <>
                          <span>•</span>
                          <span className="truncate font-mono">{asset.serialNumber}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <AssetStatusBadge status={asset.status} className="shrink-0 text-[10px]" />
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col items-stretch justify-between gap-2 border-t border-border/60 p-0 pt-3 sm:flex-row sm:items-center">
        <span className="text-xs text-muted-foreground">
          Kelola penugasan dan pelacakan unit di modul inventaris aset
        </span>
        <Link href={`/assets?assignedToId=${employeeId}`} className="w-full sm:w-auto">
          <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs sm:w-auto">
            <span>Filter Aset Karyawan Ini</span>
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
