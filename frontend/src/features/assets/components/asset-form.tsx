"use client"

import * as React from "react"
import { useForm, useWatch, type FieldErrors } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { cn } from "cn"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

import {
  ASSET_CATEGORIES,
  ASSET_STATUSES,
  type AssetCategory,
  type AssetStatus,
} from "../schema/asset.schema"
import {
  assetFormSchema,
  defaultAssetFormValues,
  type AssetFormValues,
  type AssetFormInput,
} from "../schema/asset-form.schema"
import { useEmployees } from "@/features/employees/hooks/use-employees"
import type { Asset } from "../types"

export interface AssetFormProps {
  /**
   * Data awal jika form digunakan untuk mode Edit.
   */
  initialData?: Partial<Asset> | null
  /**
   * Callback ketika form berhasil divalidasi dan disubmit.
   */
  onSubmit: (values: AssetFormValues) => Promise<void> | void
  /**
   * Callback ketika tombol Batal diklik.
   */
  onCancel?: () => void
  /**
   * Status loading / pending saat proses simpan sedang berjalan.
   */
  isSubmitting?: boolean
  /**
   * CSS class tambahan untuk wrapper form.
   */
  className?: string
}

const STATUS_LABELS: Record<AssetStatus, string> = {
  available: "Available (Tersedia)",
  assigned: "Assigned (Ditugaskan)",
  maintenance: "Maintenance (Perbaikan)",
  retired: "Retired (Afkir / Pensiun)",
}

/**
 * Komponen formulir aset inventaris dengan validasi Zod dan integrasi react-hook-form (shadcn Form).
 * Mendukung mode Tambah (Create) dan Edit serta validasi relasi karyawan penugasan (EMPTRACK-91).
 */
export function AssetForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
  className,
}: AssetFormProps) {
  const isEditMode = Boolean(initialData?.id)

  const defaultValues: AssetFormInput = React.useMemo(() => {
    if (!initialData) return defaultAssetFormValues

    return {
      assetTag: initialData.assetTag ?? "",
      name: initialData.name ?? "",
      category: (initialData.category as AssetCategory) ?? defaultAssetFormValues.category,
      model: initialData.model ?? "",
      serialNumber: initialData.serialNumber ?? "",
      status: (initialData.status as AssetStatus) ?? defaultAssetFormValues.status,
      purchaseDate: initialData.purchaseDate ?? defaultAssetFormValues.purchaseDate,
      purchaseCost: initialData.purchaseCost ?? 0,
      assignedToId: initialData.assignedToId ?? "",
      notes: initialData.notes ?? "",
    }
  }, [initialData])

  const form = useForm<AssetFormInput, unknown, AssetFormValues>({
    resolver: zodResolver(assetFormSchema),
    defaultValues,
    mode: "onTouched",
  })

  // Watch status aset untuk menyesuaikan opsi penugasan
  const watchedStatus = useWatch({
    control: form.control,
    name: "status",
  })

  // Ambil daftar karyawan untuk dropdown relasi penugasan
  const { data: employeesData, isLoading: isLoadingEmployees } = useEmployees({
    pageSize: 100,
    status: "active",
  })
  const employees = employeesData?.data ?? []

  const handleValid = async (values: AssetFormValues) => {
    try {
      await onSubmit(values)
    } catch (err) {
      toast.error("Gagal Menyimpan Data Aset", {
        description:
          err instanceof Error ? err.message : "Terjadi kesalahan sistem saat menyimpan data aset.",
      })
    }
  }

  const handleInvalid = (errors: FieldErrors<AssetFormInput>) => {
    const errorCount = Object.keys(errors).length
    toast.error("Validasi Formulir Gagal", {
      description: `Terdapat ${errorCount} kolom yang belum terisi dengan benar. Mohon periksa kolom bertanda merah.`,
    })
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleValid, handleInvalid)}
        className={cn("space-y-6", className)}
        noValidate
      >
        {/* Seksi 1: Informasi Dasar Aset */}
        <div className="space-y-4">
          <div className="border-b pb-2">
            <h3 className="text-base font-semibold text-foreground">
              Identitas & Spesifikasi Aset
            </h3>
            <p className="text-sm text-muted-foreground">
              Nama perangkat, kategori, dan nomor seri identitas hardware.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Aset</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="misal: MacBook Pro 16 M3 Max"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="assetTag"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tag Aset (Opsional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="misal: AST-00123 (otomatis jika kosong)"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kategori Aset</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={(val) => field.onChange(val as AssetCategory)}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih Kategori">
                          {(val) => val || "Pilih Kategori"}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ASSET_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Model / Spesifikasi</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="misal: M3 Max / 36GB RAM / 1TB SSD"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="serialNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nomor Seri (Serial Number)</FormLabel>
                  <FormControl>
                    <Input placeholder="misal: C02G1234MD6R" disabled={isSubmitting} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Seksi 2: Status Operasional & Penugasan Karyawan */}
        <div className="space-y-4">
          <div className="border-b pb-2">
            <h3 className="text-base font-semibold text-foreground">Status & Penugasan Karyawan</h3>
            <p className="text-sm text-muted-foreground">
              Lifecycle aset dan relasi penugasan ke pegawai perusahaan.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status Operasional</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={(val) => {
                      field.onChange(val as AssetStatus)
                      // Jika status diubah ke selain 'assigned', kosongkan assignedToId
                      if (val !== "assigned") {
                        form.setValue("assignedToId", "", { shouldValidate: true })
                      }
                    }}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih Status">
                          {(val) => (val ? STATUS_LABELS[val as AssetStatus] : "Pilih Status")}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ASSET_STATUSES.map((st) => (
                        <SelectItem key={st} value={st}>
                          {STATUS_LABELS[st]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="assignedToId"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>
                      Karyawan Penerima{" "}
                      {watchedStatus === "assigned" && <span className="text-destructive">*</span>}
                    </FormLabel>
                    {isLoadingEmployees && (
                      <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Loader2 className="size-3 animate-spin" />
                        Memuat karyawan...
                      </span>
                    )}
                  </div>
                  <Select
                    value={field.value || "none"}
                    onValueChange={(val) => {
                      const nextVal = val === "none" ? "" : (val ?? "")
                      field.onChange(nextVal)
                    }}
                    disabled={isSubmitting || watchedStatus !== "assigned"}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih Karyawan">
                          {(val) => {
                            if (!val || val === "none") {
                              return watchedStatus === "assigned"
                                ? "Pilih Karyawan Penerima..."
                                : "Tidak Ditugaskan (Unassigned)"
                            }
                            const emp = employees.find((e) => e.id === val)
                            return emp ? `${emp.fullName} (${emp.employeeNumber})` : val
                          }}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">-- Tidak Ditugaskan (Unassigned) --</SelectItem>
                      {employees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.fullName} ({emp.employeeNumber} - {emp.department})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {watchedStatus === "assigned"
                      ? "Pilih karyawan yang saat ini memegang atau bertanggung jawab atas aset ini."
                      : "Ubah status aset menjadi 'Assigned' untuk menugaskan ke karyawan."}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Seksi 3: Finansial & Pembelian */}
        <div className="space-y-4">
          <div className="border-b pb-2">
            <h3 className="text-base font-semibold text-foreground">Data Pengadaan & Catatan</h3>
            <p className="text-sm text-muted-foreground">
              Nilai perolehan, tanggal faktur, dan catatan kondisi tambahan.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="purchaseDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tanggal Pembelian</FormLabel>
                  <FormControl>
                    <Input type="date" disabled={isSubmitting} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="purchaseCost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Biaya Pembelian (IDR)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      step={10000}
                      placeholder="0"
                      disabled={isSubmitting}
                      value={
                        typeof field.value === "number" || typeof field.value === "string"
                          ? field.value
                          : 0
                      }
                      onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Catatan Tambahan (Opsional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="misal: Garansi resmi hingga 2027, kondisi prima tanpa cacat fisik."
                    disabled={isSubmitting}
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value || null)}
                    rows={3}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Tombol Aksi */}
        <div className="flex items-center justify-end gap-3 border-t pt-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Batal
            </Button>
          )}

          <Button type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
            {isSubmitting ? "Menyimpan..." : isEditMode ? "Simpan Perubahan" : "Tambah Aset"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
