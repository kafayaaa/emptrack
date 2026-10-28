import { createQueryKeyFactory } from "@/lib/query-keys"
import type { AssetListInputQuery } from "../schema/asset.schema"

type InfiniteAssetParams = Omit<AssetListInputQuery, "page">

/**
 * Standardized Query Key Factory for Asset domain (EMPTRACK-87).
 *
 * Provides strictly typed, hierarchical query key tuples for cache access,
 * invalidations, optimistic updates, and prefetching across all asset views.
 *
 * Structure:
 * - assetKeys.all -> ["assets"]
 * - assetKeys.lists() -> ["assets", "list"]
 * - assetKeys.list(params) -> ["assets", "list", params]
 * - assetKeys.infiniteLists() -> ["assets", "infinite-list"]
 * - assetKeys.infiniteList(params) -> ["assets", "infinite-list", params]
 * - assetKeys.details() -> ["assets", "detail"]
 * - assetKeys.detail(id) -> ["assets", "detail", id]
 */
export const assetKeys = createQueryKeyFactory<
  "assets",
  AssetListInputQuery,
  InfiniteAssetParams,
  string
>("assets")
