"use client"

import * as React from "react"
import { useForm, useWatch, type FieldErrors } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { cn } from "cn"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  EMPLOYEE_DEPARTMENTS,
  EMPLOYEE_POSITIONS,
  ALL_EMPLOYEE_POSITIONS,
  EMPLOYEE_STATUS_OPTIONS,
  type EmployeeDepartment,
} from "../constants"
import {
  employeeFormSchema,
  defaultEmployeeFormValues,
  type EmployeeFormValues,
  type EmployeeFormInput,
} from "../schema/employee-form.schema"
import { useDebounce } from "@/hooks/use-debounce"
import { ApiError } from "@/lib/api-client"
import { checkEmployeeEmailUnique } from "../api/employees.api"
import type { Employee } from "../types"

export interface EmployeeFormProps {
  /**
   * Data awal jika form digunakan untuk mode Edit.
   */
  initialData?: Partial<Employee> | null
  /**
   * Callback ketika form berhasil divalidasi dan disubmit.
   */
  onSubmit: (values: EmployeeFormValues) => Promise<void> | void
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

/**
 * Komponen formulir karyawan dengan validasi Zod dan integrasi react-hook-form (shadcn Form).
 * Mendukung mode Tambah (Create) dan Edit serta penyesuaian posisi secara dinamis sesuai departemen.
 */
export function EmployeeForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
  className,
}: EmployeeFormProps) {
  const isEditMode = Boolean(initialData?.id)

  const defaultValues: EmployeeFormInput = React.useMemo(() => {
    if (!initialData) return defaultEmployeeFormValues

    return {
      employeeNumber: initialData.employeeNumber ?? "",
      fullName: initialData.fullName ?? "",
      email: initialData.email ?? "",
      phone: initialData.phone ?? "",
      department: initialData.department ?? "",
      position: initialData.position ?? "",
      status: (initialData.status as "active" | "on_leave" | "inactive") ?? "active",
      hireDate: initialData.hireDate ?? defaultEmployeeFormValues.hireDate,
      isManager: initialData.isManager ?? false,
      managerId: initialData.managerId ?? null,
      projectId: initialData.projectId ?? "1",
    }
  }, [initialData])

  const form = useForm<EmployeeFormInput, unknown, EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues,
    mode: "onTouched",
    reValidateMode: "onChange",
  })

  // Pantau perubahan departemen untuk memperbarui opsi posisi secara dinamis
  const selectedDepartment = useWatch({
    control: form.control,
    name: "department",
  })

  const availablePositions = React.useMemo(() => {
    if (selectedDepartment && selectedDepartment in EMPLOYEE_POSITIONS) {
      return EMPLOYEE_POSITIONS[selectedDepartment as EmployeeDepartment]
    }
    return ALL_EMPLOYEE_POSITIONS
  }, [selectedDepartment])

  // Pantau input email untuk validasi asinkron dengan debounce
  const currentEmail = useWatch({
    control: form.control,
    name: "email",
  })
  const debouncedEmail = useDebounce(currentEmail?.trim(), 400)
  const [isCheckingEmail, setIsCheckingEmail] = React.useState(false)
  const [asyncUniqueResult, setAsyncUniqueResult] = React.useState<boolean | null>(null)

  const isEmailFormatValid = Boolean(
    debouncedEmail && debouncedEmail.includes("@") && debouncedEmail.includes("."),
  )
  const isSameAsInitialEmail = Boolean(
    initialData?.email &&
    debouncedEmail &&
    initialData.email.trim().toLowerCase() === debouncedEmail.toLowerCase(),
  )

  const isEmailUnique = isSameAsInitialEmail ? true : isEmailFormatValid ? asyncUniqueResult : null

  React.useEffect(() => {
    if (!isEmailFormatValid || isSameAsInitialEmail) {
      if (isSameAsInitialEmail && form.formState.errors.email?.type === "manual") {
        form.clearErrors("email")
      }
      return
    }

    const controller = new AbortController()

    Promise.resolve().then(() => {
      if (controller.signal.aborted) return
      setIsCheckingEmail(true)

      checkEmployeeEmailUnique(debouncedEmail, initialData?.id, { signal: controller.signal })
        .then((unique) => {
          if (controller.signal.aborted) return
          setAsyncUniqueResult(unique)
          if (!unique) {
            form.setError("email", {
              type: "manual",
              message: "Email sudah digunakan oleh karyawan lain",
            })
          } else if (form.formState.errors.email?.type === "manual") {
            form.clearErrors("email")
          }
        })
        .catch((error) => {
          // Abaikan AbortError / pembatalan request agar tidak mereset state yang sedang berjalan
          if (
            error instanceof Error &&
            (error.name === "AbortError" || error.message.includes("aborted"))
          ) {
            return
          }
          // Abaikan error jaringan lainnya saat async check agar tidak memblokir pengetikan
        })
        .finally(() => {
          if (!controller.signal.aborted) {
            setIsCheckingEmail(false)
          }
        })
    })

    return () => {
      controller.abort()
    }
  }, [debouncedEmail, initialData?.id, isSameAsInitialEmail, isEmailFormatValid, form])

  const handleValid = async (values: EmployeeFormValues) => {
    // Jika hasil pemeriksaan menunjukkan email duplikat, cegah submit
    if (isEmailUnique === false) {
      form.setError("email", {
        type: "manual",
        message: "Email sudah digunakan oleh karyawan lain",
      })
      return
    }

    try {
      await onSubmit(values)
    } catch (err) {
      if (
        err instanceof ApiError &&
        (err.status === 409 ||
          (typeof err.data === "object" &&
            err.data &&
            "error" in err.data &&
            (err.data as { error: { code: string } }).error?.code === "EMAIL_ALREADY_EXISTS"))
      ) {
        form.setError("email", {
          type: "manual",
          message: "Email sudah digunakan oleh karyawan lain",
        })
      }
      toast.error("Gagal Menyimpan Data Karyawan", {
        description:
          err instanceof Error ? err.message : "Terjadi kesalahan pada sistem saat menyimpan data.",
      })
    }
  }

  const handleInvalid = (errors: FieldErrors<EmployeeFormInput>) => {
    const errorCount = Object.keys(errors).length
    toast.error("Validasi Formulir Gagal", {
      description: `Terdapat ${errorCount} kolom yang belum terisi dengan benar. Mohon periksa kolom bertanda merah.`,
    })
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleValid, handleInvalid)}
        className={cn("space-y-8", className)}
        noValidate
      >
        {/* Seksi 1: Data Identitas & Kontak */}
        <div className="space-y-4">
          <div className="border-b pb-2">
            <h3 className="text-base font-semibold text-foreground">Informasi Pribadi & Kontak</h3>
            <p className="text-sm text-muted-foreground">
              Identitas dasar karyawan dan kontak yang dapat dihubungi.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="employeeNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nomor Pegawai</FormLabel>
                  <FormControl>
                    <Input placeholder="misal: EMP-00123" disabled={isSubmitting} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Lengkap</FormLabel>
                  <FormControl>
                    <Input placeholder="misal: Budi Santoso" disabled={isSubmitting} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Email Perusahaan</FormLabel>
                    {isCheckingEmail && (
                      <span
                        className="flex items-center gap-1 text-xs text-muted-foreground"
                        data-testid="email-checking-indicator"
                      >
                        <Loader2 className="size-3 animate-spin" aria-hidden="true" />
                        <span>Memeriksa ketersediaan...</span>
                      </span>
                    )}
                    {!isCheckingEmail && isEmailUnique === true && debouncedEmail && (
                      <span
                        className="text-xs font-medium text-emerald-600 dark:text-emerald-400"
                        data-testid="email-available-indicator"
                      >
                        ✓ Email tersedia
                      </span>
                    )}
                  </div>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="budi.santoso@perusahaan.com"
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
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nomor Telepon</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="+62 812-3456-7890"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Seksi 2: Penempatan & Pekerjaan */}
        <div className="space-y-4">
          <div className="border-b pb-2">
            <h3 className="text-base font-semibold text-foreground">Pekerjaan & Penempatan</h3>
            <p className="text-sm text-muted-foreground">
              Departemen, jabatan, dan status operasional kerja karyawan.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Departemen</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={(val) => {
                      field.onChange(val ?? "")
                      // Reset posisi jika posisi saat ini tidak ada di departemen baru
                      const currentPosition = form.getValues("position")
                      if (val && val in EMPLOYEE_POSITIONS) {
                        const validPositions = EMPLOYEE_POSITIONS[val as EmployeeDepartment]
                        if (currentPosition && !validPositions.includes(currentPosition)) {
                          form.setValue("position", "", { shouldValidate: true })
                        }
                      }
                    }}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih Departemen">
                          {(val) => val || "Pilih Departemen"}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {EMPLOYEE_DEPARTMENTS.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
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
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Posisi / Jabatan</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={(val) => field.onChange(val ?? "")}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih Posisi">
                          {(val) => val || "Pilih Posisi"}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availablePositions.map((pos) => (
                        <SelectItem key={pos} value={pos}>
                          {pos}
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
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status Karyawan</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={(val) => field.onChange(val ?? "active")}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih Status">
                          {(val) => {
                            const option = EMPLOYEE_STATUS_OPTIONS.find((opt) => opt.value === val)
                            return option ? option.label : "Pilih Status"
                          }}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {EMPLOYEE_STATUS_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
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
              name="hireDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tanggal Mulai Kerja</FormLabel>
                  <FormControl>
                    <Input type="date" disabled={isSubmitting} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="projectId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID Proyek</FormLabel>
                  <FormControl>
                    <Input placeholder="misal: 1" disabled={isSubmitting} {...field} />
                  </FormControl>
                  <FormDescription>ID proyek aktif yang ditugaskan</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Seksi 3: Struktur Organisasi */}
        <div className="space-y-4">
          <div className="border-b pb-2">
            <h3 className="text-base font-semibold text-foreground">Struktur Organisasi</h3>
            <p className="text-sm text-muted-foreground">
              Pengaturan hierarki dan wewenang manajerial.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="isManager"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-y-0 space-x-3 rounded-2xl border border-border/60 bg-card p-4">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={Boolean(field.value)}
                      onChange={(e) => field.onChange(e.target.checked)}
                      disabled={isSubmitting}
                      className="mt-1 h-4 w-4 rounded border-input text-primary focus:ring-ring"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="cursor-pointer">Tingkat Manajer</FormLabel>
                    <FormDescription>
                      Aktifkan jika karyawan ini menjabat sebagai pimpinan tim / manajer
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="managerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID Manajer (Opsional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Kosongkan jika pimpinan tertinggi"
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value || null)}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>ID pegawai atasan langsung</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Tombol Aksi */}
        <div className="flex items-center justify-end gap-3 pt-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Batal
            </Button>
          )}

          <Button type="submit" disabled={isSubmitting || isCheckingEmail} aria-busy={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
            {isSubmitting ? "Menyimpan..." : isEditMode ? "Simpan Perubahan" : "Tambah Karyawan"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
