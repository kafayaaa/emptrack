import { z } from "zod"

export const employeeFormSchema = z.object({
  employeeNumber: z
    .string()
    .trim()
    .min(1, "Nomor pegawai wajib diisi")
    .max(50, "Nomor pegawai maksimal 50 karakter"),
  fullName: z
    .string()
    .trim()
    .min(2, "Nama lengkap minimal 2 karakter")
    .max(100, "Nama lengkap maksimal 100 karakter"),
  email: z.string().trim().min(1, "Email wajib diisi").email("Format email tidak valid"),
  phone: z
    .string()
    .trim()
    .min(8, "Nomor telepon minimal 8 karakter")
    .max(20, "Nomor telepon maksimal 20 karakter")
    .regex(/^[+0-9\s\-()]+$/, "Format nomor telepon tidak valid"),
  department: z.string().trim().min(1, "Departemen wajib dipilih"),
  position: z.string().trim().min(1, "Posisi wajib dipilih"),
  status: z.enum(["active", "on_leave", "inactive"], {
    error: "Status tidak valid",
  }),
  hireDate: z
    .string()
    .trim()
    .min(1, "Tanggal mulai kerja wajib diisi")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD"),
  isManager: z.boolean().default(false),
  managerId: z
    .string()
    .trim()
    .nullable()
    .optional()
    .transform((val) => (val === "" || !val ? null : val)),
  projectId: z
    .string()
    .trim()
    .min(1, "Project ID wajib diisi")
    .regex(/^\d+$/, "Project ID harus berupa angka"),
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
