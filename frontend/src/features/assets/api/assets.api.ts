import { z } from "zod"
import { apiClient } from "@/lib/api-client"
import {
  assetSchema,
  type Asset,
  type AssetListInputQuery,
  type AssetListResponse,
} from "../schema/asset.schema"
import type { AssetFormValues } from "../schema/asset-form.schema"

export const assetListResponseSchema = z.object({
  data: z.array(assetSchema),
  meta: z.object({
    page: z.number().int().positive(),
    pageSize: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
  }),
})

export { assetKeys } from "./asset-keys"

export interface RequestSignalOptions {
  signal?: AbortSignal
}

export async function getAssets(
  params?: AssetListInputQuery,
  options?: RequestSignalOptions,
): Promise<AssetListResponse> {
  return apiClient.get<AssetListResponse>("/api/assets", {
    params: params as Record<string, string | number | boolean | null | undefined>,
    schema: assetListResponseSchema,
    signal: options?.signal,
  })
}

export async function getAssetById(id: string, options?: RequestSignalOptions): Promise<Asset> {
  return apiClient.get<Asset>(`/api/assets/${id}`, {
    schema: assetSchema,
    signal: options?.signal,
  })
}

export async function createAsset(
  data: AssetFormValues,
  options?: RequestSignalOptions,
): Promise<Asset> {
  return apiClient.post<Asset>("/api/assets", data, {
    schema: assetSchema,
    signal: options?.signal,
  })
}

export async function updateAsset(
  id: string,
  data: Partial<AssetFormValues>,
  options?: RequestSignalOptions,
): Promise<Asset> {
  return apiClient.patch<Asset>(`/api/assets/${id}`, data, {
    schema: assetSchema,
    signal: options?.signal,
  })
}

export async function deleteAsset(id: string, options?: RequestSignalOptions): Promise<void> {
  return apiClient.delete<void>(`/api/assets/${id}`, {
    signal: options?.signal,
  })
}
