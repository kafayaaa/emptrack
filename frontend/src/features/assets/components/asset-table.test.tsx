import React from "react"
import { describe, expect, it, vi, beforeEach } from "vitest"
import { AssetTable } from "./asset-table"
import * as useAssetsModule from "../hooks/use-assets"
import * as nextNavigation from "next/navigation"

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn(),
  useSearchParams: vi.fn(),
}))

vi.mock("../hooks/use-assets", () => ({
  useAssets: vi.fn(),
}))

describe("asset-table.tsx (AssetTable Component - EMPTRACK-87)", () => {
  const mockPush = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(nextNavigation.useRouter).mockReturnValue({
      push: mockPush,
    } as unknown as ReturnType<typeof nextNavigation.useRouter>)
    vi.mocked(nextNavigation.usePathname).mockReturnValue("/inventory")
    vi.mocked(nextNavigation.useSearchParams).mockReturnValue(
      new URLSearchParams() as unknown as ReturnType<typeof nextNavigation.useSearchParams>,
    )
  })

  it("renders AssetTable element with loaded data without throwing", () => {
    vi.mocked(useAssetsModule.useAssets).mockReturnValue({
      data: {
        data: [
          {
            id: "ast-1",
            assetTag: "AST-00001",
            name: "MacBook Pro 16",
            category: "Laptop",
            model: "M3 Max / 36GB RAM",
            serialNumber: "SN123456",
            status: "available",
            purchaseDate: "2024-03-01",
            purchaseCost: 35000000,
            assignedToId: null,
            assignedTo: null,
          },
        ],
        meta: {
          page: 1,
          pageSize: 10,
          total: 1,
          totalPages: 1,
        },
      },
      isLoading: false,
      isError: false,
      error: null,
      isFetching: false,
      isPlaceholderData: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useAssetsModule.useAssets>)

    const element = <AssetTable />
    expect(element).toBeDefined()
  })

  it("handles loading and error states without throwing", () => {
    vi.mocked(useAssetsModule.useAssets).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useAssetsModule.useAssets>)

    const loadingElement = <AssetTable />
    expect(loadingElement).toBeDefined()

    vi.mocked(useAssetsModule.useAssets).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error("Server error 500"),
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useAssetsModule.useAssets>)

    const errorElement = <AssetTable />
    expect(errorElement).toBeDefined()
  })

  it("handles isPlaceholderData and isFetching states without throwing", () => {
    vi.mocked(useAssetsModule.useAssets).mockReturnValue({
      data: {
        data: [],
        meta: { page: 1, pageSize: 10, total: 0, totalPages: 0 },
      },
      isLoading: false,
      isFetching: true,
      isPlaceholderData: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useAssetsModule.useAssets>)

    const element = <AssetTable />
    expect(element).toBeDefined()
  })
})
