import { describe, it, expect } from "vitest"
import { assetKeys } from "./asset-keys"
import type { AssetListInputQuery } from "../schema/asset.schema"

describe("assetKeys Query Key Factory (EMPTRACK-87)", () => {
  it("generates root key matching all asset queries", () => {
    expect(assetKeys.all).toEqual(["assets"])
  })

  it("generates correct keys for paginated lists and filtered lists", () => {
    expect(assetKeys.lists()).toEqual(["assets", "list"])

    const filters: AssetListInputQuery = {
      page: 2,
      pageSize: 20,
      category: "Laptop",
      search: "MacBook",
    }
    expect(assetKeys.list(filters)).toEqual(["assets", "list", filters])
  })

  it("generates correct keys for infinite scroll lists", () => {
    expect(assetKeys.infiniteLists()).toEqual(["assets", "infinite-list"])

    const infiniteParams = {
      pageSize: 50,
      status: "available" as const,
    }
    expect(assetKeys.infiniteList(infiniteParams)).toEqual([
      "assets",
      "infinite-list",
      infiniteParams,
    ])
  })

  it("generates correct keys for asset details", () => {
    expect(assetKeys.details()).toEqual(["assets", "detail"])
    expect(assetKeys.detail("ast-42")).toEqual(["assets", "detail", "ast-42"])
  })
})
