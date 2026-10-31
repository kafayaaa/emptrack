import { z } from "zod"
import { EMPLOYEE_DEPARTMENTS, EMPLOYEE_POSITIONS, type EmployeeDepartment } from "../constants"

export const employeeFormSchema = z
  .object({
    employeeNumber: z
      .string()
      .trim()
      .min(3, "Nomor pegawai minimal 3 karakter")
      .max(20, "Nomor pegawai maksimal 20 karakter")
      .regex(
        /^[A-Za-z0-9-]+$/,
        "Format nomor pegawai hanya boleh berisi huruf, angka, dan tanda hubung (contoh: EMP-00123)",
      ),
    fullName: z
      .string()
      .trim()
      .min(2, "Nama lengkap minimal 2 karakter")
      .max(100, "Nama lengkap maksimal 100 karakter")
      .regex(
        /^[A-Za-z\s.,'`-]+$/,
        "Nama lengkap hanya boleh berisi huruf, spasi, atau tanda baca nama (titik, koma, petik)",
      ),
    email: z
      .string()
      .trim()
      .min(1, "Email perusahaan wajib diisi")
      .email("Format email tidak valid (contoh: nama@perusahaan.com)"),
    phone: z
      .string()
      .trim()
      .min(9, "Nomor telepon minimal 9 digit")
      .max(20, "Nomor telepon maksimal 20 digit")
      .regex(
        /^(?:\+?[1-9]\d{0,3}|0)[0-9\s\-()]{7,18}$/,
        "Format nomor telepon tidak valid (contoh: +62 812-3456-7890 atau 08123456789)",
      ),
    department: z
      .string()
      .trim()
      .min(1, "Departemen wajib dipilih")
      .refine((dept) => EMPLOYEE_DEPARTMENTS.includes(dept as EmployeeDepartment), {
        message: "Departemen yang dipilih tidak valid",
      }),
    position: z.string().trim().min(1, "Posisi / jabatan wajib dipilih"),
    status: z.enum(["active", "on_leave", "inactive"], {
      error: "Status karyawan wajib dipilih",
    }),
    hireDate: z
      .string()
      .trim()
      .min(1, "Tanggal mulai kerja wajib diisi")
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD")
      .refine(
        (dateStr) => {
          const date = new Date(dateStr)
          if (isNaN(date.getTime())) return false
          const year = date.getFullYear()
          if (year < 1970) return false
          // Batas maksimal: tidak lebih dari 1 tahun ke depan
          const maxFutureDate = new Date()
          maxFutureDate.setFullYear(maxFutureDate.getFullYear() + 1)
          return date <= maxFutureDate
        },
        {
          message: "Tanggal mulai kerja tidak valid atau melebihi 1 tahun ke depan",
        },
      ),
    isManager: z.boolean().default(false),
    managerId: z
      .string()
      .trim()
      .max(50, "ID Manajer maksimal 50 karakter")
      .refine(
        (val) => !val || !val.includes("\0"),
        "ID Manajer tidak boleh mengandung karakter null",
      )
      .nullable()
      .optional()
      .transform((val) => (val === "" || !val ? null : val)),
    projectId: z
      .string()
      .trim()
      .min(1, "Project ID wajib diisi")
      .max(20, "Project ID maksimal 20 digit")
      .regex(/^[1-9]\d*$/, "Project ID harus berupa angka positif (contoh: 1)"),
  })
  .superRefine((data, ctx) => {
    // 1. Validasi Silang: Posisi harus sesuai dengan Departemen yang dipilih
    if (data.department && data.department in EMPLOYEE_POSITIONS) {
      const validPositions = EMPLOYEE_POSITIONS[data.department as EmployeeDepartment]
      if (data.position && !validPositions.includes(data.position)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["position"],
          message: `Posisi "${data.position}" tidak tersedia di departemen ${data.department}`,
        })
      }
    }

    // 2. Validasi Silang: Karyawan tidak boleh menjadi manajer untuk dirinya sendiri
    if (
      data.managerId &&
      data.employeeNumber &&
      data.managerId.trim().toLowerCase() === data.employeeNumber.trim().toLowerCase()
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["managerId"],
        message: "ID Manajer tidak boleh sama dengan Nomor Pegawai sendiri",
      })
    }
  })

export type EmployeeFormValues = z.infer<typeof employeeFormSchema>
export type EmployeeFormInput = z.input<typeof employeeFormSchema>

export const defaultEmployeeFormValues: EmployeeFormInput = {
  employeeNumber: "",
  fullName: "",
  email: "",
  phone: "",
  department: "",
  position: "",
  status: "active",
  hireDate: new Date().toISOString().split("T")[0],
  isManager: false,
  managerId: null,
  projectId: "1",
}
