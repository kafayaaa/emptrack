import React from "react"
import { describe, expect, it, vi, beforeEach } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import { EmployeeAssignedAssets } from "./employee-assigned-assets"
import * as useAssetsHook from "../hooks/use-assets"
import type { Asset } from "../types"

vi.mock("../hooks/use-assets", () => ({
  useAssets: vi.fn(),
}))

describe("EmployeeAssignedAssets component (EMPTRACK-90)", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("merender skeleton loading saat data sedang dimuat", () => {
    vi.mocked(useAssetsHook.useAssets).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
      isFetching: false,
    } as unknown as ReturnType<typeof useAssetsHook.useAssets>)

    const html = renderToStaticMarkup(
      <EmployeeAssignedAssets employeeId="emp-1" employeeName="Budi Santoso" />,
    )

    expect(html).toContain('data-testid="assigned-assets-loading"')
    expect(html).toContain("Assigned Assets &amp; Hardware")
  })

  it("merender error state dengan pesan dan tombol coba lagi jika fetch gagal", () => {
    vi.mocked(useAssetsHook.useAssets).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error("Network timeout"),
      refetch: vi.fn(),
      isFetching: false,
    } as unknown as ReturnType<typeof useAssetsHook.useAssets>)

    const html = renderToStaticMarkup(
      <EmployeeAssignedAssets employeeId="emp-1" employeeName="Budi Santoso" />,
    )

    expect(html).toContain('data-testid="assigned-assets-error"')
    expect(html).toContain("Gagal memuat data aset karyawan")
    expect(html).toContain("Network timeout")
    expect(html).toContain("Coba Lagi")
  })

  it("merender empty state informatif jika karyawan tidak memiliki aset", () => {
    vi.mocked(useAssetsHook.useAssets).mockReturnValue({
      data: {
        data: [],
        meta: { page: 1, pageSize: 50, total: 0, totalPages: 0 },
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
      isFetching: false,
    } as unknown as ReturnType<typeof useAssetsHook.useAssets>)

    const html = renderToStaticMarkup(
      <EmployeeAssignedAssets employeeId="emp-1" employeeName="Budi Santoso" />,
    )

    expect(html).toContain('data-testid="assigned-assets-empty"')
    expect(html).toContain("Belum ada aset yang ditugaskan")
  })

  it("merender daftar aset yang terhubung ke karyawan dengan link dan status", () => {
    const mockAssets: Asset[] = [
      {
        id: "ast-1",
        assetTag: "AST-00001",
        name: "MacBook Pro 16",
        category: "Laptop",
        model: "M3 Pro, 18GB RAM",
        serialNumber: "SN-MBP-01",
        status: "assigned",
        purchaseDate: "2024-01-10",
        purchaseCost: 32000000,
        assignedToId: "emp-1",
      },
      {
        id: "ast-2",
        assetTag: "AST-00002",
        name: "Dell UltraSharp 32",
        category: "Monitor",
        model: "U3223QE 4K",
        serialNumber: "SN-DEL-02",
        status: "assigned",
        purchaseDate: "2024-01-15",
        purchaseCost: 11000000,
        assignedToId: "emp-1",
      },
    ]

    vi.mocked(useAssetsHook.useAssets).mockReturnValue({
      data: {
        data: mockAssets,
        meta: { page: 1, pageSize: 50, total: 2, totalPages: 1 },
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
      isFetching: false,
    } as unknown as ReturnType<typeof useAssetsHook.useAssets>)

    const html = renderToStaticMarkup(
      <EmployeeAssignedAssets employeeId="emp-1" employeeName="Budi Santoso" />,
    )

    expect(html).toContain('data-testid="assigned-assets-list"')
    expect(html).toContain("2 Aset Terhubung")
    expect(html).toContain("MacBook Pro 16")
    expect(html).toContain('href="/assets/ast-1"')
    expect(html).toContain("Dell UltraSharp 32")
    expect(html).toContain('href="/assets/ast-2"')
    expect(html).toContain('href="/assets?assignedToId=emp-1"')
    expect(html).toContain("Filter Aset Karyawan Ini")
  })
})
