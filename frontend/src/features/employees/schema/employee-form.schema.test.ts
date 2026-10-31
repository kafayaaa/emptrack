import { describe, it, expect } from "vitest"
import { employeeFormSchema, defaultEmployeeFormValues } from "./employee-form.schema"

describe("employeeFormSchema validation & error messages", () => {
  const validData = {
    employeeNumber: "EMP-00100",
    fullName: "Budi Santoso, S.Kom.",
    email: "budi.santoso@perusahaan.com",
    phone: "+62 812-3456-7890",
    department: "Engineering",
    position: "Frontend Developer",
    status: "active" as const,
    hireDate: "2024-01-15",
    isManager: false,
    managerId: "EMP-00001",
    projectId: "101",
  }

  it("passes validation with complete valid employee data", () => {
    const result = employeeFormSchema.safeParse(validData)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.fullName).toBe("Budi Santoso, S.Kom.")
      expect(result.data.managerId).toBe("EMP-00001")
    }
  })

  it("transforms empty string managerId to null", () => {
    const result = employeeFormSchema.safeParse({
      ...validData,
      managerId: "",
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.managerId).toBeNull()
    }
  })

  it("fails validation when employeeNumber contains invalid characters", () => {
    const result = employeeFormSchema.safeParse({
      ...validData,
      employeeNumber: "EMP@#123",
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain(
        "Format nomor pegawai hanya boleh berisi huruf, angka, dan tanda hubung",
      )
    }
  })

  it("fails validation when fullName contains numbers or disallowable characters", () => {
    const result = employeeFormSchema.safeParse({
      ...validData,
      fullName: "Budi123",
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain(
        "Nama lengkap hanya boleh berisi huruf, spasi, atau tanda baca nama",
      )
    }
  })

  it("fails validation when email format is invalid", () => {
    const result = employeeFormSchema.safeParse({
      ...validData,
      email: "invalid-email",
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "Format email tidak valid (contoh: nama@perusahaan.com)",
      )
    }
  })

  it("fails validation when phone format is invalid", () => {
    const tooShort = employeeFormSchema.safeParse({
      ...validData,
      phone: "12345",
    })
    expect(tooShort.success).toBe(false)
    if (!tooShort.success) {
      expect(tooShort.error.issues[0].message).toBe("Nomor telepon minimal 9 digit")
    }

    const invalidChars = employeeFormSchema.safeParse({
      ...validData,
      phone: "08123456789abc",
    })
    expect(invalidChars.success).toBe(false)
    if (!invalidChars.success) {
      expect(invalidChars.error.issues[0].message).toContain("Format nomor telepon tidak valid")
    }
  })

  it("fails validation when department is not in allowed departments", () => {
    const result = employeeFormSchema.safeParse({
      ...validData,
      department: "Unknown Department",
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Departemen yang dipilih tidak valid")
    }
  })

  it("fails cross-field validation when position does not belong to selected department", () => {
    const result = employeeFormSchema.safeParse({
      ...validData,
      department: "Engineering",
      position: "HR Generalist", // HR Generalist is in "Human Resources", not Engineering
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path[0] === "position")
      expect(issue).toBeDefined()
      expect(issue?.message).toBe('Posisi "HR Generalist" tidak tersedia di departemen Engineering')
    }
  })

  it("fails cross-field validation when managerId is the same as employeeNumber", () => {
    const result = employeeFormSchema.safeParse({
      ...validData,
      employeeNumber: "EMP-00100",
      managerId: "EMP-00100",
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path[0] === "managerId")
      expect(issue).toBeDefined()
      expect(issue?.message).toBe("ID Manajer tidak boleh sama dengan Nomor Pegawai sendiri")
    }
  })

  it("fails validation when hireDate is in the distant future", () => {
    const farFuture = new Date()
    farFuture.setFullYear(farFuture.getFullYear() + 2)
    const farFutureStr = farFuture.toISOString().split("T")[0]

    const result = employeeFormSchema.safeParse({
      ...validData,
      hireDate: farFutureStr,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain(
        "Tanggal mulai kerja tidak valid atau melebihi 1 tahun ke depan",
      )
    }
  })

  it("fails validation when projectId is zero or non-numeric", () => {
    const result = employeeFormSchema.safeParse({
      ...validData,
      projectId: "0",
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "Project ID harus berupa angka positif (contoh: 1)",
      )
    }
  })

  it("fails validation when managerId contains null bytes or exceeds 50 chars (EMPTRACK-110)", () => {
    expect(
      employeeFormSchema.safeParse({
        ...validData,
        managerId: "EMP\x00-001",
      }).success,
    ).toBe(false)

    expect(
      employeeFormSchema.safeParse({
        ...validData,
        managerId: "M".repeat(51),
      }).success,
    ).toBe(false)
  })

  it("fails validation when projectId exceeds 20 digits (EMPTRACK-110)", () => {
    expect(
      employeeFormSchema.safeParse({
        ...validData,
        projectId: "1".repeat(21),
      }).success,
    ).toBe(false)
  })

  it("has valid default structure in defaultEmployeeFormValues", () => {
    expect(defaultEmployeeFormValues.status).toBe("active")
    expect(defaultEmployeeFormValues.isManager).toBe(false)
    expect(defaultEmployeeFormValues.projectId).toBe("1")
  })
})
