import { describe, it, expect } from "vitest"
import { dashboardKeys } from "./dashboard-keys"

describe("dashboardKeys", () => {
  it("menghasilkan struktur key yang konsisten", () => {
    expect(dashboardKeys.all).toEqual(["dashboard"])
    expect(dashboardKeys.summary()).toEqual(["dashboard", "summary"])
  })
})
