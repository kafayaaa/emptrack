"use client"

import * as React from "react"
import Link from "next/link"
import { AlertCircle, ArrowLeft, Box, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ApiError } from "@/lib/api-client"
import { useAsset } from "../hooks"
import { AssetDetailView } from "./asset-detail-view"
import { AssetDetailSkeleton } from "./asset-detail-skeleton"

export interface AssetDetailContainerProps {
  id: string
}

export function AssetDetailContainer({ id }: AssetDetailContainerProps) {
  const { data: asset, isLoading, isError, error, refetch, isFetching } = useAsset(id)

  if (isLoading) {
    return <AssetDetailSkeleton />
  }

  if (isError || !asset) {
    const isNotFound =
      (error instanceof ApiError && error.status === 404) ||
      error?.message?.toLowerCase().includes("not found")

    if (isNotFound) {
      return (
        <div
          data-testid="asset-detail-not-found"
          role="region"
          aria-label="Asset not found notice"
          className="flex min-h-[350px] flex-col items-center justify-center rounded-xl border border-dashed border-border p-6 text-center sm:min-h-[400px] sm:p-8"
        >
          <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground sm:size-14">
            <Box className="size-6 sm:size-7" />
          </div>
          <h1 className="mt-4 text-base font-semibold text-foreground sm:text-lg">
            Asset Not Found
          </h1>
          <p className="mt-1.5 max-w-md text-xs text-muted-foreground sm:text-sm">
            Data aset dengan ID{" "}
            <span className="font-mono font-medium text-foreground">&quot;{id}&quot;</span> tidak
            ditemukan di dalam sistem inventaris.
          </p>
          <div className="mt-6 w-full sm:w-auto">
            <Link href="/assets" className="w-full sm:w-auto">
              <Button variant="default" size="sm" className="w-full gap-2 sm:w-auto">
                <ArrowLeft className="size-4" />
                Kembali ke Daftar Aset
              </Button>
            </Link>
          </div>
        </div>
      )
    }

    return (
      <div
        data-testid="asset-detail-error"
        role="alert"
        className="flex min-h-[350px] flex-col items-center justify-center rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center sm:min-h-[400px] sm:p-8"
      >
        <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive sm:size-14">
          <AlertCircle className="size-6 sm:size-7" />
        </div>
        <h1 className="mt-4 text-base font-semibold text-foreground sm:text-lg">
          Gagal Memuat Detail Aset
        </h1>
        <p className="mt-1.5 max-w-md text-xs text-muted-foreground sm:text-sm">
          {error?.message || "Terjadi kesalahan saat berkomunikasi dengan server inventaris."}
        </p>
        <div className="mt-6 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
          <Button
            variant="outline"
            size="sm"
            onClick={() => void refetch()}
            disabled={isFetching}
            className="w-full gap-2 sm:w-auto"
          >
            <RefreshCw className={`size-4 ${isFetching ? "animate-spin" : ""}`} />
            Coba Lagi
          </Button>
          <Link href="/assets" className="w-full sm:w-auto">
            <Button variant="ghost" size="sm" className="w-full gap-2 sm:w-auto">
              <ArrowLeft className="size-4" />
              Kembali ke Daftar Aset
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return <AssetDetailView asset={asset} />
}
