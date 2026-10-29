import { describe, it, expect, vi, beforeEach } from "vitest"
import { useQuery } from "@tanstack/react-query"
import { useDashboardSummary } from "./use-dashboard-summary"
import * as apiModule from "../api/dashboard.api"
import { dashboardKeys } from "../api/dashboard-keys"
import type { DashboardSummary } from "../types"

vi.mock("@tanstack/react-query", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-query")>()
  return {
    ...actual,
    useQuery: vi.fn(),
  }
})

describe("useDashboardSummary hook (EMPTRACK-94)", () => {
  const dummySummary: DashboardSummary = {
    employees: {
      total: 10,
      active: 8,
      onLeave: 1,
      inactive: 1,
      departments: [],
    },
    assets: {
      total: 20,
      assigned: 15,
      available: 5,
      maintenance: 0,
      retired: 0,
      allocationRate: 75,
      totalValue: 500000000,
      categories: [],
    },
    recentAssets: [],
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("menginisialisasi useQuery dengan queryKey dashboardKeys.summary()", () => {
    vi.mocked(useQuery).mockReturnValue({
      data: dummySummary,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useQuery>)

    const hook = useDashboardSummary({ initialData: dummySummary })

    expect(useQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: dashboardKeys.summary(),
        initialData: dummySummary,
      }),
    )
    expect(hook.data).toEqual(dummySummary)
  })

  it("memanggil getDashboardSummary API di dalam queryFn", async () => {
    const getSummarySpy = vi.spyOn(apiModule, "getDashboardSummary").mockResolvedValue(dummySummary)

    useDashboardSummary()

    const queryConfig = vi.mocked(useQuery).mock.calls[0][0] as unknown as {
      queryFn: (ctx: { signal?: AbortSignal }) => Promise<DashboardSummary>
    }

    const abortController = new AbortController()
    const result = await queryConfig.queryFn({ signal: abortController.signal })

    expect(getSummarySpy).toHaveBeenCalledWith({ signal: abortController.signal })
    expect(result).toEqual(dummySummary)
  })
})
