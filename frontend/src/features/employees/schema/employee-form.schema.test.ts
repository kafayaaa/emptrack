import { describe, it, expect } from "vitest"
import { employeeFormSchema, defaultEmployeeFormValues } from "./employee-form.schema"

describe("employeeFormSchema", () => {
  const validData = {
    employeeNumber: "EMP-00100",
    fullName: "Budi Santoso",
    email: "budi.santoso@example.com",
    phone: "+62 812-3456-7890",
    department: "Engineering",
    position: "Frontend Developer",
    status: "active" as const,
    hireDate: "2024-01-15",
    isManager: false,
    managerId: null,
    projectId: "101",
  }

  it("passes validation with complete valid employee data", () => {
    const result = employeeFormSchema.safeParse(validData)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.fullName).toBe("Budi Santoso")
      expect(result.data.managerId).toBeNull()
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

  it("fails validation when email format is invalid", () => {
    const result = employeeFormSchema.safeParse({
      ...validData,
      email: "invalid-email",
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Format email tidak valid")
    }
  })

  it("fails validation when hireDate format is not YYYY-MM-DD", () => {
    const result = employeeFormSchema.safeParse({
      ...validData,
      hireDate: "15/01/2024",
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Format tanggal harus YYYY-MM-DD")
    }
  })

  it("fails validation when projectId is not numeric", () => {
    const result = employeeFormSchema.safeParse({
      ...validData,
      projectId: "abc",
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Project ID harus berupa angka")
    }
  })

  it("has valid default structure in defaultEmployeeFormValues", () => {
    expect(defaultEmployeeFormValues.status).toBe("active")
    expect(defaultEmployeeFormValues.isManager).toBe(false)
    expect(defaultEmployeeFormValues.projectId).toBe("1")
  })
})
