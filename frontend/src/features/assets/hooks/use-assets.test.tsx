import { describe, it, expect, vi, beforeEach } from "vitest"
import { useQuery, keepPreviousData } from "@tanstack/react-query"
import { useAssets, ASSET_CACHE_CONFIG } from "./use-assets"
import * as apiModule from "../api/assets.api"
import { assetKeys } from "../api/assets.api"

vi.mock("@tanstack/react-query", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-query")>()
  return {
    ...actual,
    useQuery: vi.fn(),
  }
})

describe("useAssets (EMPTRACK-87)", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("calls useQuery with queryKey, queryFn, and keepPreviousData", () => {
    const mockUseQuery = vi.mocked(useQuery)
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isSuccess: false,
      isError: false,
    } as unknown as ReturnType<typeof useQuery>)

    const params = { page: 1, pageSize: 20, search: "ThinkPad", sortOrder: "asc" as const }
    useAssets(params)

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: assetKeys.list(params),
        placeholderData: keepPreviousData,
      }),
    )

    // Test queryFn
    const queryOptions = mockUseQuery.mock.calls[0][0] as {
      queryFn?: (...args: unknown[]) => unknown
    }
    const getAssetsSpy = vi.spyOn(apiModule, "getAssets").mockResolvedValue({
      data: [],
      meta: { page: 1, pageSize: 20, total: 0, totalPages: 0 },
    })

    const controller = new AbortController()
    if (queryOptions.queryFn) {
      queryOptions.queryFn({ signal: controller.signal })
    }
    expect(getAssetsSpy).toHaveBeenCalledWith(params, { signal: controller.signal })
  })

  it("applies PAGE_ONE_STALE_TIME (5 minutes) for page 1 or undefined params", () => {
    const mockUseQuery = vi.mocked(useQuery)
    mockUseQuery.mockReturnValue({
      data: undefined,
    } as unknown as ReturnType<typeof useQuery>)

    useAssets()
    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        staleTime: ASSET_CACHE_CONFIG.PAGE_ONE_STALE_TIME,
        gcTime: ASSET_CACHE_CONFIG.GC_TIME,
      }),
    )

    mockUseQuery.mockClear()
    useAssets({ page: 1 })
    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        staleTime: ASSET_CACHE_CONFIG.PAGE_ONE_STALE_TIME,
      }),
    )
  })

  it("applies DEFAULT_STALE_TIME (1 minute) for page 2 and beyond", () => {
    const mockUseQuery = vi.mocked(useQuery)
    mockUseQuery.mockReturnValue({
      data: undefined,
    } as unknown as ReturnType<typeof useQuery>)

    useAssets({ page: 2 })
    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        staleTime: ASSET_CACHE_CONFIG.DEFAULT_STALE_TIME,
      }),
    )
  })
})
