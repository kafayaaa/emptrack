import React from "react"
import { describe, it, expect } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import { AssetMobileCard } from "./asset-mobile-card"
import type { Asset } from "../types"

describe("AssetMobileCard (EMPTRACK-87)", () => {
  const mockAsset: Asset = {
    id: "ast-1",
    assetTag: "AST-00001",
    name: "MacBook Pro 16",
    category: "Laptop",
    model: "M3 Max, 36GB RAM",
    serialNumber: "SN123456",
    status: "available",
    purchaseDate: "2024-03-01",
    purchaseCost: 35000000,
    assignedToId: null,
    assignedTo: null,
  }

  it("renders asset basic information correctly", () => {
    const html = renderToStaticMarkup(<AssetMobileCard asset={mockAsset} />)

    expect(html).toContain("MacBook Pro 16")
    expect(html).toContain("AST-00001")
    expect(html).toContain("Laptop")
    expect(html).toContain("M3 Max, 36GB RAM")
    expect(html).toContain("Available")
    expect(html).toContain("Unassigned")
  })

  it("renders assigned employee name when assignedTo is present", () => {
    const assignedAsset: Asset = {
      ...mockAsset,
      status: "assigned",
      assignedToId: "emp-1",
      assignedTo: {
        id: "emp-1",
        employeeNumber: "EMP-00001",
        fullName: "Ahmad Dahlan",
        department: "IT",
        email: "ahmad@emptrack.test",
      },
    }

    const html = renderToStaticMarkup(<AssetMobileCard asset={assignedAsset} />)
    expect(html).toContain("Ahmad Dahlan")
    expect(html).toContain("Assigned")
  })

  it("creates selected mobile card element with data-selected attribute", () => {
    const html = renderToStaticMarkup(
      <AssetMobileCard asset={mockAsset} isSelected={true} onSelectChange={() => {}} />,
    )
    expect(html).toContain('data-selected="true"')
  })
})
