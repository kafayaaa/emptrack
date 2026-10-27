import { describe, it, expect } from "vitest"
import { createQueryKeyFactory } from "./query-keys"

describe("createQueryKeyFactory (EMPTRACK-79)", () => {
  it("generates correct base hierarchical query keys", () => {
    const keys = createQueryKeyFactory("items")

    expect(keys.all).toEqual(["items"])
    expect(keys.lists()).toEqual(["items", "list"])
    expect(keys.list({ page: 1 })).toEqual(["items", "list", { page: 1 }])
    expect(keys.infiniteLists()).toEqual(["items", "infinite-list"])
    expect(keys.infiniteList({ search: "abc" })).toEqual([
      "items",
      "infinite-list",
      { search: "abc" },
    ])
    expect(keys.details()).toEqual(["items", "detail"])
    expect(keys.detail("item-123")).toEqual(["items", "detail", "item-123"])
  })

  it("supports extending with domain-specific extra query keys", () => {
    const keys = createQueryKeyFactory("users", {
      stats: (year: number) => ["users", "stats", year] as const,
      roles: () => ["users", "roles"] as const,
    })

    expect(keys.all).toEqual(["users"])
    expect(keys.stats(2026)).toEqual(["users", "stats", 2026])
    expect(keys.roles()).toEqual(["users", "roles"])
  })
})
