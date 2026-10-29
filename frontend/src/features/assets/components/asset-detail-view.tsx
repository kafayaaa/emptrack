"use client"

import * as React from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Box,
  Calendar,
  CheckCircle2,
  DollarSign,
  Laptop,
  Mail,
  Monitor,
  Pencil,
  RotateCcw,
  Smartphone,
  Tag,
  User,
  UserCheck,
  Wrench,
} from "lucide-react"
import dynamic from "next/dynamic"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDate } from "@/lib/date"
import { formatCurrency } from "./columns"
import { AssetStatusBadge } from "./asset-status-badge"
import type { Asset, AssetCategory } from "../types"
import { usePrefetchEmployee } from "@/features/employees/hooks"

const AssetEditDialog = dynamic(() => import("./asset-edit-dialog").then((m) => m.AssetEditDialog))

const AssetDeleteDialog = dynamic(() =>
  import("./asset-delete-dialog").then((m) => m.AssetDeleteDialog),
)

export interface AssetDetailViewProps {
  asset: Asset
}

function getCategoryIcon(category: AssetCategory) {
  switch (category) {
    case "Laptop":
      return <Laptop className="size-6 text-primary sm:size-7" aria-hidden="true" />
    case "Monitor":
      return <Monitor className="size-6 text-primary sm:size-7" aria-hidden="true" />
    case "Mobile Device":
      return <Smartphone className="size-6 text-primary sm:size-7" aria-hidden="true" />
    default:
      return <Box className="size-6 text-primary sm:size-7" aria-hidden="true" />
  }
}

function getInitials(name?: string | null): string {
  if (!name) return "EM"
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "EM"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

/**
 * Komponen tampilan detail lengkap data aset inventaris (EMPTRACK-92).
 * Menyajikan informasi spesifikasi, relasi penugasan karyawan, dan lifecycle hardware.
 */
export function AssetDetailView({ asset }: AssetDetailViewProps) {
  const { prefetchEmployee } = usePrefetchEmployee()
  const assigned = asset.assignedTo
  const assignedId = asset.assignedToId

  return (
    <div data-testid="asset-detail-view" className="flex flex-col gap-6">
      {/* 1. Navigasi Kembali */}
      <nav aria-label="Back navigation">
        <Link href="/assets">
          <Button variant="ghost" size="sm" className="gap-2 text-xs">
            <ArrowLeft className="size-4" aria-hidden="true" />
            <span>Kembali ke Daftar Aset</span>
          </Button>
        </Link>
      </nav>

      {/* 2. Hero Profile Card */}
      <header className="rounded-xl border border-border bg-card p-4 shadow-2xs sm:p-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3.5 sm:items-center sm:gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary sm:size-16">
              {getCategoryIcon(asset.category)}
            </div>

            <div className="flex min-w-0 flex-col gap-1">
              <h1 className="truncate text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                {asset.name}
              </h1>

              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="font-mono font-semibold text-foreground">{asset.assetTag}</span>
                <span>•</span>
                <Badge variant="outline" className="font-normal">
                  {asset.category}
                </Badge>
                <span>•</span>
                <AssetStatusBadge status={asset.status} />
              </div>
            </div>
          </div>

          <div className="flex w-full items-center gap-2 sm:w-auto">
            <AssetEditDialog
              asset={asset}
              trigger={
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-1.5 text-xs sm:w-auto"
                  data-testid="asset-detail-edit-button"
                >
                  <Pencil className="size-3.5" aria-hidden="true" />
                  <span>Edit Aset</span>
                </Button>
              }
            />
            <AssetDeleteDialog asset={asset} redirectToIndex={true} />
            <AssetDeleteDialog asset={asset} redirectToIndex={true} />
          </div>
        </div>
      </header>

      {/* 3. Segmented Tabs Content */}
      <Tabs defaultValue="specifications" className="flex flex-col gap-4">
        <TabsList className="grid h-10 w-full grid-cols-3 gap-1 rounded-lg bg-muted p-1 sm:inline-flex sm:h-10 sm:w-auto">
          <TabsTrigger
            value="specifications"
            className="h-full gap-1.5 px-1 py-1.5 text-xs whitespace-nowrap sm:gap-2 sm:px-3 sm:text-sm"
          >
            <Tag className="size-3.5 shrink-0 sm:size-4" aria-hidden="true" />
            <span>Spesifikasi</span>
          </TabsTrigger>
          <TabsTrigger
            value="assignment"
            className="h-full gap-1.5 px-1 py-1.5 text-xs whitespace-nowrap sm:gap-2 sm:px-3 sm:text-sm"
          >
            <User className="size-3.5 shrink-0 sm:size-4" aria-hidden="true" />
            <span>Penugasan</span>
          </TabsTrigger>
          <TabsTrigger
            value="lifecycle"
            className="h-full gap-1.5 px-1 py-1.5 text-xs whitespace-nowrap sm:gap-2 sm:px-3 sm:text-sm"
          >
            <RotateCcw className="size-3.5 shrink-0 sm:size-4" aria-hidden="true" />
            <span>Siklus &amp; Status</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Spesifikasi & Finansial */}
        <TabsContent value="specifications" keepMounted className="mt-0">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card className="flex flex-col gap-4 p-4 shadow-2xs sm:p-5">
              <CardHeader className="flex flex-row items-center gap-2 border-b border-border/60 p-0 pb-3">
                <Laptop className="size-4 text-primary" aria-hidden="true" />
                <div>
                  <CardTitle as="h2" className="text-sm font-semibold text-foreground">
                    Hardware &amp; Identitas Teknis
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Rincian nomor identitas dan spesifikasi teknis perangkat
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <dl className="flex flex-col gap-3 text-sm">
                  <div className="flex items-start justify-between gap-2">
                    <dt className="shrink-0 text-muted-foreground">Asset Tag</dt>
                    <dd className="font-mono font-semibold text-foreground">{asset.assetTag}</dd>
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <dt className="shrink-0 text-muted-foreground">Kategori</dt>
                    <dd className="text-right font-medium text-foreground">{asset.category}</dd>
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <dt className="shrink-0 text-muted-foreground">Model / Spesifikasi</dt>
                    <dd className="text-right font-medium text-foreground">{asset.model}</dd>
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <dt className="shrink-0 text-muted-foreground">Serial Number</dt>
                    <dd className="font-mono text-sm font-medium text-foreground">
                      {asset.serialNumber}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            <Card className="flex flex-col gap-4 p-4 shadow-2xs sm:p-5">
              <CardHeader className="flex flex-row items-center gap-2 border-b border-border/60 p-0 pb-3">
                <DollarSign className="size-4 text-primary" aria-hidden="true" />
                <div>
                  <CardTitle as="h2" className="text-sm font-semibold text-foreground">
                    Data Pengadaan &amp; Catatan
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Informasi finansial, perolehan, dan riwayat garansi
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <dl className="flex flex-col gap-3 text-sm">
                  <div className="flex items-start justify-between gap-2">
                    <dt className="shrink-0 text-muted-foreground">Tanggal Pembelian</dt>
                    <dd className="flex items-center gap-1 font-medium text-foreground">
                      <Calendar className="size-3.5 text-muted-foreground" aria-hidden="true" />
                      <time dateTime={asset.purchaseDate}>{formatDate(asset.purchaseDate)}</time>
                    </dd>
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <dt className="shrink-0 text-muted-foreground">Biaya Pembelian</dt>
                    <dd className="font-mono font-semibold text-foreground">
                      {formatCurrency(asset.purchaseCost)}
                    </dd>
                  </div>
                  <div className="flex flex-col gap-1 border-t pt-2">
                    <dt className="text-muted-foreground">Catatan Tambahan</dt>
                    <dd className="text-xs text-foreground/90 italic">
                      {asset.notes || "Tidak ada catatan tambahan untuk perangkat ini."}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 2: Penugasan Karyawan */}
        <TabsContent value="assignment" keepMounted className="mt-0">
          <Card className="flex flex-col gap-4 p-4 shadow-2xs sm:p-5">
            <CardHeader className="flex flex-row items-center gap-2 border-b border-border/60 p-0 pb-3">
              <UserCheck className="size-4 text-primary" aria-hidden="true" />
              <div>
                <CardTitle as="h2" className="text-sm font-semibold text-foreground">
                  Informasi Penugasan Karyawan
                </CardTitle>
                <CardDescription className="text-xs">
                  Pegawai yang saat ini bertanggung jawab dan memegang perangkat ini
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {assignedId ? (
                <div
                  data-testid="asset-assigned-info"
                  className="flex flex-col gap-4 rounded-lg border border-primary/20 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Avatar size="lg" className="size-12">
                      <AvatarFallback className="bg-primary/10 font-semibold text-primary">
                        {getInitials(assigned?.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-0.5">
                      <Link
                        href={`/employees/${assignedId}`}
                        onMouseEnter={() => prefetchEmployee(assignedId)}
                        onFocus={() => prefetchEmployee(assignedId)}
                        className="text-base font-semibold text-foreground transition-colors hover:text-primary hover:underline"
                        data-testid="asset-assigned-employee-link"
                      >
                        {assigned?.fullName ?? "Lihat Karyawan"}
                      </Link>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {assigned?.employeeNumber && (
                          <span className="font-mono font-medium">{assigned.employeeNumber}</span>
                        )}
                        {assigned?.department && (
                          <>
                            <span>•</span>
                            <span>{assigned.department}</span>
                          </>
                        )}
                      </div>
                      {assigned?.email && (
                        <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Mail className="size-3 text-muted-foreground/70" />
                          <span>{assigned.email}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link href={`/employees/${assignedId}`}>
                      <Button variant="outline" size="sm" className="w-full text-xs sm:w-auto">
                        Buka Profil Karyawan
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div
                  data-testid="asset-unassigned-info"
                  className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border/70 p-8 text-center"
                >
                  <div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <Box className="size-5" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium text-foreground">
                      Aset Belum Ditugaskan (Available)
                    </p>
                    <p className="max-w-md text-xs text-muted-foreground">
                      Aset ini saat ini berada di pool inventaris dan siap dialokasikan kepada
                      karyawan yang membutuhkan.
                    </p>
                  </div>
                  <div className="mt-3">
                    <AssetEditDialog
                      asset={asset}
                      trigger={
                        <Button size="sm" className="gap-1.5 text-xs">
                          <UserCheck className="size-3.5" />
                          <span>Tugaskan Aset Ini</span>
                        </Button>
                      }
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Status & Siklus */}
        <TabsContent value="lifecycle" keepMounted className="mt-0">
          <Card className="flex flex-col gap-4 p-4 shadow-2xs sm:p-5">
            <CardHeader className="flex flex-row items-center gap-2 border-b border-border/60 p-0 pb-3">
              <RotateCcw className="size-4 text-primary" aria-hidden="true" />
              <div>
                <CardTitle as="h2" className="text-sm font-semibold text-foreground">
                  Status Operasional &amp; Lifecycle
                </CardTitle>
                <CardDescription className="text-xs">
                  Kondisi kesiapan perangkat dan audit inventaris sistem
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/20 p-3.5">
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-500" />
                  <div className="flex flex-col gap-1 text-xs">
                    <span className="font-medium text-foreground">Status Aktif</span>
                    <AssetStatusBadge status={asset.status} />
                    <span className="mt-1 text-muted-foreground">
                      {asset.status === "available" && "Tersedia dan siap dialokasikan kapan saja."}
                      {asset.status === "assigned" && "Aktif digunakan oleh karyawan terkait."}
                      {asset.status === "maintenance" &&
                        "Sedang dalam perawatan atau perbaikan teknis."}
                      {asset.status === "retired" &&
                        "Afkir atau dinonaktifkan dari aset aktif perusahaan."}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/20 p-3.5">
                  <Wrench className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
                  <div className="flex flex-col gap-1 text-xs">
                    <span className="font-medium text-foreground">Audit Identitas Sistem</span>
                    <span className="font-mono text-muted-foreground">ID Record: {asset.id}</span>
                    <span className="font-mono text-muted-foreground">Tag: {asset.assetTag}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
