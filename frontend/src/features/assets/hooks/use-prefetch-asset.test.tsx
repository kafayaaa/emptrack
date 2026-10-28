import { describe, it, expect, vi, beforeEach } from "vitest"
import * as React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { useQueryClient } from "@tanstack/react-query"
import { usePrefetchAsset } from "./use-prefetch-asset"
import { ASSET_DETAIL_CACHE_CONFIG } from "./use-asset"
import { assetKeys } from "../api/asset-keys"

vi.mock("@tanstack/react-query", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-query")>()
  return {
    ...actual,
    useQueryClient: vi.fn(),
  }
})

describe("usePrefetchAsset hook (EMPTRACK-92)", () => {
  const mockPrefetchQuery = vi.fn()
  let currentResult: ReturnType<typeof usePrefetchAsset> | null = null

  function TestHookComponent() {
    currentResult = usePrefetchAsset()
    return <div data-testid="test-hook" />
  }

  function renderHook(): ReturnType<typeof usePrefetchAsset> {
    currentResult = null
    renderToStaticMarkup(<TestHookComponent />)
    if (!currentResult) {
      throw new Error("Failed to render TestHookComponent")
    }
    return currentResult
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useQueryClient).mockReturnValue({
      prefetchQuery: mockPrefetchQuery,
    } as unknown as ReturnType<typeof useQueryClient>)
  })

  it("memanggil queryClient.prefetchQuery dengan queryKey dan staleTime yang tepat untuk ID valid", () => {
    const { prefetchAsset } = renderHook()

    prefetchAsset("ast-101")

    expect(mockPrefetchQuery).toHaveBeenCalledTimes(1)
    expect(mockPrefetchQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: assetKeys.detail("ast-101"),
        staleTime: ASSET_DETAIL_CACHE_CONFIG.STALE_TIME,
      }),
    )
  })

  it("mengabaikan panggilan prefetch jika ID bernilai null, undefined, atau string kosong", () => {
    const { prefetchAsset } = renderHook()

    prefetchAsset(null)
    prefetchAsset(undefined)
    prefetchAsset("   ")

    expect(mockPrefetchQuery).not.toHaveBeenCalled()
  })
})
