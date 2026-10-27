/**
 * Generic Query Key Factory for TanStack Query.
 *
 * Implements a standardized, hierarchical key structure following TkDodo / TanStack Query best practices.
 * Guarantees type safety, autocompletion, and consistent cache invalidation across all domains (EMPTRACK-79).
 *
 * Hierarchy:
 * - [feature] -> Root key for invalidating all queries of this feature
 * - [feature, 'list'] -> Target all paginated list queries
 * - [feature, 'list', params] -> Target a specific list query with exact filters
 * - [feature, 'infinite-list'] -> Target all infinite scroll queries
 * - [feature, 'infinite-list', params] -> Target a specific infinite list query
 * - [feature, 'detail'] -> Target all detail queries
 * - [feature, 'detail', id] -> Target a specific item detail query
 */

export interface BaseQueryKeyFactory<
  TFeature extends string,
  TListParams = unknown,
  TInfiniteParams = unknown,
  TDetailId = string,
> {
  readonly all: readonly [TFeature]
  readonly lists: () => readonly [TFeature, "list"]
  readonly list: (params?: TListParams) => readonly [TFeature, "list", TListParams | undefined]
  readonly infiniteLists: () => readonly [TFeature, "infinite-list"]
  readonly infiniteList: (
    params?: TInfiniteParams,
  ) => readonly [TFeature, "infinite-list", TInfiniteParams | undefined]
  readonly details: () => readonly [TFeature, "detail"]
  readonly detail: (id: TDetailId) => readonly [TFeature, "detail", TDetailId]
}

export function createQueryKeyFactory<
  TFeature extends string,
  TListParams = unknown,
  TInfiniteParams = unknown,
  TDetailId = string,
>(feature: TFeature): BaseQueryKeyFactory<TFeature, TListParams, TInfiniteParams, TDetailId>

export function createQueryKeyFactory<
  TFeature extends string,
  TListParams,
  TInfiniteParams,
  TDetailId,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TExtra extends Record<string, (...args: any[]) => readonly unknown[]>,
>(
  feature: TFeature,
  extra: TExtra,
): BaseQueryKeyFactory<TFeature, TListParams, TInfiniteParams, TDetailId> & TExtra

export function createQueryKeyFactory<
  TFeature extends string,
  TListParams = unknown,
  TInfiniteParams = unknown,
  TDetailId = string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TExtra extends Record<string, (...args: any[]) => readonly unknown[]> = Record<string, never>,
>(feature: TFeature, extra?: TExtra) {
  const base: BaseQueryKeyFactory<TFeature, TListParams, TInfiniteParams, TDetailId> = {
    all: [feature] as const,
    lists: () => [feature, "list"] as const,
    list: (params?: TListParams) => [feature, "list", params] as const,
    infiniteLists: () => [feature, "infinite-list"] as const,
    infiniteList: (params?: TInfiniteParams) => [feature, "infinite-list", params] as const,
    details: () => [feature, "detail"] as const,
    detail: (id: TDetailId) => [feature, "detail", id] as const,
  }

  return extra ? Object.assign(base, extra) : base
}
