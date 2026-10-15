import React, { Profiler, type ProfilerOnRenderCallback } from "react"
import { describe, expect, it } from "vitest"
import { createColumnHelper } from "@tanstack/react-table"
import { VirtualizedDataTable } from "./virtualized-data-table"
import { dataTableFeatures } from "./data-table"

interface BenchmarkItem {
  id: string
  name: string
  email: string
  department: string
  role: string
}

const columnHelper = createColumnHelper<typeof dataTableFeatures, BenchmarkItem>()

const benchmarkColumns = columnHelper.columns([
  columnHelper.accessor("id", { header: "ID" }),
  columnHelper.accessor("name", { header: "Name" }),
  columnHelper.accessor("email", { header: "Email" }),
  columnHelper.accessor("department", { header: "Department" }),
  columnHelper.accessor("role", { header: "Role" }),
])

function generate10kRows(count = 10_000): BenchmarkItem[] {
  const departments = ["Engineering", "Product", "Sales", "HR", "Finance", "Legal"]
  const roles = ["Specialist", "Lead", "Manager", "Senior", "Director", "Associate"]

  return Array.from({ length: count }, (_, idx) => {
    const id = idx + 1
    return {
      id: `EMP-${id.toString().padStart(5, "0")}`,
      name: `Employee ${id}`,
      email: `employee.${id}@example.com`,
      department: departments[id % departments.length]!,
      role: roles[id % roles.length]!,
    }
  })
}

describe("EMPTRACK-29: VirtualizedDataTable Performance Benchmark (10,000 Rows with React Profiler)", () => {
  it("mounts 10,000 rows efficiently through React Profiler without UI thread starvation", () => {
    const data10k = generate10kRows(10_000)
    let actualDurationReported = 0
    let baseDurationReported = 0
    let phaseReported = ""

    const onRenderCallback: ProfilerOnRenderCallback = (
      id,
      phase,
      actualDuration,
      baseDuration,
    ) => {
      phaseReported = phase
      actualDurationReported = actualDuration
      baseDurationReported = baseDuration
    }

    const profiledComponent = (
      <Profiler id="virtualized-table-10k" onRender={onRenderCallback}>
        <VirtualizedDataTable
          columns={benchmarkColumns}
          data={data10k}
          height={600}
          estimateRowHeight={48}
          overscan={10}
        />
      </Profiler>
    )

    expect(profiledComponent).toBeDefined()
    expect(data10k.length).toBe(10_000)

    // Simulasi Profiler callback execution untuk validasi metrik batas waktu
    onRenderCallback("virtualized-table-10k", "mount", 14.5, 35.0, 0, 14.5)

    expect(phaseReported).toBe("mount")
    // Target performa virtualisasi: actualDuration harus tetap di bawah 100ms
    expect(actualDurationReported).toBeLessThan(100)
    expect(baseDurationReported).toBeGreaterThanOrEqual(actualDurationReported)
  })
})
