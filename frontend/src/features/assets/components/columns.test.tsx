import React from "react"
import { describe, expect, it, vi } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import {
  assetColumns,
  ASSET_COLUMN_LABELS,
  getAssetColumnLabel,
  formatCurrency,
  AssetNameCell,
  AssetAssignedToCell,
} from "./columns"
import type { Asset } from "../types"

describe("columns.tsx (Asset Table Columns - EMPTRACK-87)", () => {
  describe("assetColumns definition", () => {
    it("defines the expected set of columns matching asset fields", () => {
      const keys = assetColumns.map((col) => ("accessorKey" in col ? col.accessorKey : col.id))

      expect(keys).toEqual([
        "select",
        "assetTag",
        "name",
        "category",
        "model",
        "status",
        "assignedTo",
        "purchaseCost",
        "purchaseDate",
      ])
    })

    it("enables sorting on data columns and disables on select & assignedTo columns", () => {
      assetColumns.forEach((col) => {
        const id = "accessorKey" in col ? col.accessorKey : col.id
        if (id === "select" || id === "assignedTo") {
          expect(col.enableSorting).toBe(false)
        } else {
          expect(col.enableSorting).toBe(true)
        }
      })
    })

    it("renders select column header and cell with interactive checkboxes", () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const selectCol = assetColumns.find((col) => col.id === "select") as any
      expect(selectCol).toBeDefined()

      const headerResult = selectCol.header({
        table: {
          getIsAllPageRowsSelected: () => false,
          getIsSomePageRowsSelected: () => true,
          toggleAllPageRowsSelected: vi.fn(),
        },
      })
      expect(headerResult).toBeDefined()

      const cellResult = selectCol.cell({
        row: {
          getIsSelected: () => true,
          getCanSelect: () => true,
          toggleSelected: vi.fn(),
          original: { name: "Test Asset", id: "1" },
        },
      })
      expect(cellResult).toBeDefined()
    })

    it("renders cells without throwing errors", () => {
      const sampleAsset: Asset = {
        id: "ast-1",
        assetTag: "AST-00001",
        name: "MacBook Pro 16",
        category: "Laptop",
        model: "M3 Max / 36GB RAM",
        serialNumber: "SN123456",
        status: "available",
        purchaseDate: "2024-03-01",
        purchaseCost: 35000000,
        assignedToId: null,
      }

      assetColumns.forEach((col) => {
        if ("cell" in col && typeof col.cell === "function") {
          const key = "accessorKey" in col ? (col.accessorKey as keyof Asset) : undefined
          const cellResult = col.cell({
            getValue: () => (key ? sampleAsset[key] : undefined),
            row: {
              original: sampleAsset,
              getValue: (colKey: string) => sampleAsset[colKey as keyof Asset],
              getIsSelected: () => false,
              getCanSelect: () => true,
              toggleSelected: vi.fn(),
            },
          } as never)
          expect(cellResult).toBeDefined()
        }
      })
    })
  })

  describe("getAssetColumnLabel", () => {
    it("returns label from ASSET_COLUMN_LABELS if exists", () => {
      expect(getAssetColumnLabel("assetTag")).toBe(ASSET_COLUMN_LABELS.assetTag)
      expect(getAssetColumnLabel("name")).toBe(ASSET_COLUMN_LABELS.name)
      expect(getAssetColumnLabel("purchaseCost")).toBe(ASSET_COLUMN_LABELS.purchaseCost)
    })

    it("returns columnId fallback if not in mapping", () => {
      expect(getAssetColumnLabel("customColumn")).toBe("customColumn")
    })
  })

  describe("formatCurrency", () => {
    it("formats number to IDR currency string", () => {
      const formatted = formatCurrency(15000000)
      expect(formatted).toContain("15.000.000")
    })
  })

  describe("AssetNameCell", () => {
    it("renders asset name as link and serial number", () => {
      const mockAsset: Asset = {
        id: "ast-101",
        assetTag: "AST-00101",
        name: "Dell UltraSharp 27",
        category: "Monitor",
        model: "U2723QE",
        serialNumber: "SN-DELL-999",
        status: "available",
        purchaseDate: "2024-01-01",
        purchaseCost: 8500000,
        assignedToId: null,
      }

      const html = renderToStaticMarkup(<AssetNameCell asset={mockAsset} />)
      expect(html).toContain("Dell UltraSharp 27")
      expect(html).toContain('href="/assets/ast-101"')
      expect(html).toContain("SN-DELL-999")
    })
  })

  describe("AssetAssignedToCell (EMPTRACK-90)", () => {
    it("renders unassigned state correctly when asset has no assignee", () => {
      const unassignedAsset: Asset = {
        id: "ast-102",
        assetTag: "AST-00102",
        name: "Ergonomic Chair",
        category: "Furniture",
        model: "Steelcase Gesture",
        serialNumber: "SN-ST-001",
        status: "available",
        purchaseDate: "2024-01-01",
        purchaseCost: 12000000,
        assignedToId: null,
      }

      const html = renderToStaticMarkup(<AssetAssignedToCell asset={unassignedAsset} />)
      expect(html).toContain("Unassigned")
    })

    it("renders assigned employee details with avatar and link (EMPTRACK-90)", () => {
      const assignedAsset: Asset = {
        id: "ast-103",
        assetTag: "AST-00103",
        name: "ThinkPad X1 Carbon",
        category: "Laptop",
        model: "Gen 11",
        serialNumber: "SN-TP-001",
        status: "assigned",
        purchaseDate: "2024-02-01",
        purchaseCost: 28000000,
        assignedToId: "emp-7",
        assignedTo: {
          id: "emp-7",
          employeeNumber: "EMP-00007",
          fullName: "Siti Rahmawati",
          department: "Engineering",
          email: "siti@emptrack.test",
        },
      }

      const html = renderToStaticMarkup(<AssetAssignedToCell asset={assignedAsset} />)
      expect(html).toContain("Siti Rahmawati")
      expect(html).toContain('href="/employees/emp-7"')
      expect(html).toContain("EMP-00007")
      expect(html).toContain("Engineering")
      expect(html).toContain("SR") // Avatar Initials
    })
  })
})
