import React from "react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import EmployeeDetailPage, { generateMetadata } from "./page"
import * as serverApiModule from "@/features/employees/api/employees.server"
import type { Employee } from "@/features/employees/schema/employee.schema"

const mockNotFound = vi.fn()
vi.mock("next/navigation", () => ({
  notFound: () => {
    mockNotFound()
    throw new Error("NEXT_NOT_FOUND")
  },
}))

vi.mock("@/features/employees", () => ({
  EmployeeDetailContainer: ({ id }: { id: string }) => (
    <div data-testid="mock-employee-detail-container">Container ID: {id}</div>
  ),
  EmployeeDetailSkeleton: () => <div data-testid="mock-skeleton">Skeleton</div>,
}))

vi.mock("@/features/employees/api/employees.server", () => ({
  getEmployeeByIdServer: vi.fn(),
}))

describe("EmployeeDetailPage (/employees/[id]) - Page & SEO (EMPTRACK-54)", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const mockEmployee: Employee = {
    id: "1",
    employeeNumber: "EMP-00001",
    fullName: "Daruna Daruna Oktovian",
    email: "daruna.daruna.oktovian.1@emptrack.test",
    phone: "0849 938 826",
    department: "Engineering",
    position: "Manager",
    status: "active",
    hireDate: "2017-01-18",
    isManager: true,
    managerId: null,
    projectId: "1281",
  }

  describe("generateMetadata", () => {
    it("menghasilkan metadata SEO dinamis lengkap saat karyawan ditemukan", async () => {
      vi.spyOn(serverApiModule, "getEmployeeByIdServer").mockResolvedValue(mockEmployee)

      const metadata = await generateMetadata({
        params: Promise.resolve({ id: "1" }),
      })

      // Title & Description
      expect(metadata.title).toBe("Daruna Daruna Oktovian - Manager")
      expect(metadata.description).toContain("Daruna Daruna Oktovian")
      expect(metadata.description).toContain("EMP-00001")
      expect(metadata.description).toContain("Engineering")

      // Canonical URL
      expect(metadata.alternates?.canonical).toBe("/employees/1")

      // OpenGraph Profile
      const og = metadata.openGraph as Record<string, unknown> | undefined
      expect(og?.title).toBe("Daruna Daruna Oktovian - Manager | EmpTrack")
      expect(og?.type).toBe("profile")
      expect(og?.url).toBe("/employees/1")
      expect(og?.firstName).toBe("Daruna")
      expect(og?.username).toBe("EMP-00001")

      // Twitter Card
      expect(metadata.twitter).toEqual({
        card: "summary",
        title: "Daruna Daruna Oktovian - Manager",
        description: expect.stringContaining("Daruna Daruna Oktovian"),
      })
    })

    it("menghasilkan fallback metadata (Employee Not Found & noindex) saat karyawan tidak ditemukan", async () => {
      vi.spyOn(serverApiModule, "getEmployeeByIdServer").mockResolvedValue(null)

      const metadata = await generateMetadata({
        params: Promise.resolve({ id: "999999" }),
      })

      expect(metadata.title).toBe("Employee Not Found")
      expect(metadata.description).toContain('Employee record with ID "999999" could not be found.')
      expect(metadata.robots).toEqual({
        index: false,
        follow: false,
      })
    })
  })

  describe("Page component rendering", () => {
    it("merender EmployeeDetailContainer dengan ID yang di-resolve dari params saat karyawan ditemukan", async () => {
      vi.spyOn(serverApiModule, "getEmployeeByIdServer").mockResolvedValue(mockEmployee)

      const pageJsx = await EmployeeDetailPage({
        params: Promise.resolve({ id: "1" }),
      })

      const html = renderToStaticMarkup(pageJsx)
      expect(html).toContain("Container ID: 1")
      expect(html).toContain('data-testid="mock-employee-detail-container"')
    })

    it("memanggil notFound() saat karyawan tidak ditemukan di server", async () => {
      vi.spyOn(serverApiModule, "getEmployeeByIdServer").mockResolvedValue(null)

      await expect(
        EmployeeDetailPage({
          params: Promise.resolve({ id: "999999" }),
        }),
      ).rejects.toThrow("NEXT_NOT_FOUND")

      expect(mockNotFound).toHaveBeenCalledTimes(1)
    })
  })
})
