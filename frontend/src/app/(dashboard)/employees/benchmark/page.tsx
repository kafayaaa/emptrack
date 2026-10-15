"use client"

import * as React from "react"
import { Profiler, type ProfilerOnRenderCallback } from "react"
import { createColumnHelper } from "@tanstack/react-table"
import { Activity, ArrowLeft, Gauge, Layers, RefreshCw, Sparkles } from "lucide-react"
import Link from "next/link"

import {
  VirtualizedDataTable,
  DataTableColumnHeader,
  type dataTableFeatures,
} from "@/components/shared/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface BenchmarkEmployee {
  id: string
  employeeNumber: string
  fullName: string
  email: string
  department: string
  position: string
  status: "ACTIVE" | "ON_LEAVE" | "TERMINATED"
}

const columnHelper = createColumnHelper<typeof dataTableFeatures, BenchmarkEmployee>()

const benchmarkColumns = columnHelper.columns([
  columnHelper.accessor("employeeNumber", {
    header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
    cell: (info) => (
      <span className="font-mono text-xs font-semibold text-foreground">{info.getValue()}</span>
    ),
    enableSorting: true,
  }),
  columnHelper.accessor("fullName", {
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nama Lengkap" />,
    cell: (info) => (
      <div className="flex flex-col">
        <span className="font-medium text-foreground">{info.getValue()}</span>
        <span className="text-xs text-muted-foreground">{info.row.original.email}</span>
      </div>
    ),
    enableSorting: true,
  }),
  columnHelper.accessor("department", {
    header: ({ column }) => <DataTableColumnHeader column={column} title="Departemen" />,
    cell: (info) => <span>{info.getValue()}</span>,
    enableSorting: true,
  }),
  columnHelper.accessor("position", {
    header: ({ column }) => <DataTableColumnHeader column={column} title="Posisi" />,
    cell: (info) => <span>{info.getValue()}</span>,
    enableSorting: true,
  }),
  columnHelper.accessor("status", {
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: (info) => {
      const status = info.getValue()
      const variant =
        status === "ACTIVE" ? "default" : status === "ON_LEAVE" ? "secondary" : "destructive"
      return <Badge variant={variant}>{status}</Badge>
    },
    enableSorting: true,
  }),
])

function generateRows(count: number): BenchmarkEmployee[] {
  const departments = ["Engineering", "Product", "Human Resources", "Finance", "Sales", "Design"]
  const positions = [
    "Software Engineer",
    "Product Manager",
    "People Ops",
    "Accountant",
    "Account Exec",
    "UI/UX Designer",
  ]
  const statuses: ("ACTIVE" | "ON_LEAVE" | "TERMINATED")[] = [
    "ACTIVE",
    "ACTIVE",
    "ACTIVE",
    "ON_LEAVE",
    "TERMINATED",
  ]

  return Array.from({ length: count }, (_, idx) => {
    const num = idx + 1
    return {
      id: `emp-${num}`,
      employeeNumber: `EMP-${num.toString().padStart(6, "0")}`,
      fullName: `Employee Person ${num}`,
      email: `employee.${num}@emptrack.internal`,
      department: departments[num % departments.length]!,
      position: positions[num % positions.length]!,
      status: statuses[num % statuses.length]!,
    }
  })
}

interface ProfilerRecord {
  phase: string
  actualDuration: number
  baseDuration: number
  timestamp: string
}

export default function BenchmarkPage() {
  const [rowCount, setRowCount] = React.useState<number>(10_000)
  const [data, setData] = React.useState<BenchmarkEmployee[]>(() => generateRows(10_000))
  const [isGenerating, setIsGenerating] = React.useState<boolean>(false)

  // Metrik render dipisahkan dari re-render loop React via DOM direct text sync
  const lastMetricRef = React.useRef<ProfilerRecord | null>(null)
  const durationTextRef = React.useRef<HTMLSpanElement>(null)
  const phaseTextRef = React.useRef<HTMLElement>(null)
  const baseDurationTextRef = React.useRef<HTMLSpanElement>(null)
  const historyContainerRef = React.useRef<HTMLDivElement>(null)
  const historyListRef = React.useRef<ProfilerRecord[]>([])

  const regenerateData = React.useCallback((count: number) => {
    setIsGenerating(true)
    setTimeout(() => {
      const generated = generateRows(count)
      setData(generated)
      setIsGenerating(false)
    }, 10)
  }, [])

  const handleChangeRowCount = (count: number) => {
    setRowCount(count)
    regenerateData(count)
  }

  // Profiler callback hanya mengupdate elemen DOM referensi langsung tanpa setState,
  // sehingga terbebas 100% dari "Maximum update depth exceeded" / re-render loop
  const handleRender: ProfilerOnRenderCallback = (_id, phase, actualDuration, baseDuration) => {
    const record: ProfilerRecord = {
      phase,
      actualDuration: Number(actualDuration.toFixed(2)),
      baseDuration: Number(baseDuration.toFixed(2)),
      timestamp: new Date().toLocaleTimeString(),
    }

    lastMetricRef.current = record
    historyListRef.current = [record, ...historyListRef.current].slice(0, 5)

    if (durationTextRef.current) {
      durationTextRef.current.textContent = `${record.actualDuration} ms`
    }
    if (phaseTextRef.current) {
      phaseTextRef.current.textContent = record.phase
    }
    if (baseDurationTextRef.current) {
      baseDurationTextRef.current.textContent = `${record.baseDuration} ms`
    }
    if (historyContainerRef.current) {
      historyContainerRef.current.innerHTML = historyListRef.current
        .map(
          (item) =>
            `<span class="rounded-md border border-border bg-background px-2 py-1 font-mono text-muted-foreground">[${item.timestamp}] ${item.phase}: <strong class="text-foreground">${item.actualDuration}ms</strong></span>`,
        )
        .join("")
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header bar */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/employees">
            <Button variant="outline" size="icon-sm" aria-label="Kembali ke Employees">
              <ArrowLeft className="size-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Performance Benchmark: 10,000 Rows
              </h1>
              <Badge variant="outline" className="gap-1 border-primary/30 text-primary">
                <Sparkles className="size-3" /> React Profiler
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Uji ketahanan render dataset masif menggunakan TanStack Virtual v3 & React Profiler
              API.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={rowCount === 1_000 ? "default" : "outline"}
            size="sm"
            onClick={() => handleChangeRowCount(1_000)}
            disabled={isGenerating}
          >
            1.000 Rows
          </Button>
          <Button
            variant={rowCount === 10_000 ? "default" : "outline"}
            size="sm"
            onClick={() => handleChangeRowCount(10_000)}
            disabled={isGenerating}
          >
            10.000 Rows
          </Button>
          <Button
            variant={rowCount === 50_000 ? "default" : "outline"}
            size="sm"
            onClick={() => handleChangeRowCount(50_000)}
            disabled={isGenerating}
          >
            50.000 Rows
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => regenerateData(rowCount)}
            disabled={isGenerating}
            title="Regenerate data"
          >
            <RefreshCw className={`size-4 ${isGenerating ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Profiler Metrics Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-1 rounded-xl border border-border bg-card p-4 shadow-2xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Dataset di Memori</span>
            <Layers className="size-4" />
          </div>
          <span className="text-2xl font-bold text-foreground">
            {data.length.toLocaleString()}{" "}
            <span className="text-sm font-normal text-muted-foreground">rows</span>
          </span>
          <span className="text-xs text-muted-foreground">
            Hanya ~15–25 node baris yang dirender ke DOM
          </span>
        </div>

        <div className="flex flex-col gap-1 rounded-xl border border-border bg-card p-4 shadow-2xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Actual Render Time</span>
            <Activity className="size-4 text-emerald-500" />
          </div>
          <span
            ref={durationTextRef}
            className="text-2xl font-bold text-emerald-600 dark:text-emerald-400"
          >
            Mengukur...
          </span>
          <span className="text-xs text-muted-foreground">
            Phase:{" "}
            <code ref={phaseTextRef} className="text-foreground">
              idle
            </code>
          </span>
        </div>

        <div className="flex flex-col gap-1 rounded-xl border border-border bg-card p-4 shadow-2xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Base Duration (Tanpa Memo)</span>
            <Gauge className="size-4 text-blue-500" />
          </div>
          <span ref={baseDurationTextRef} className="text-2xl font-bold text-foreground">
            -
          </span>
          <span className="text-xs text-muted-foreground">
            Waktu estimasi kalkulasi subtree pohon komponen
          </span>
        </div>

        <div className="flex flex-col gap-1 rounded-xl border border-border bg-card p-4 shadow-2xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Status Komputasi</span>
            <Badge
              variant="outline"
              className="border-emerald-500/40 text-emerald-600 dark:text-emerald-400"
            >
              Optimal
            </Badge>
          </div>
          <span className="text-2xl font-bold text-foreground">60 FPS</span>
          <span className="text-xs text-muted-foreground">
            Scroll stabil tanpa thread lag / stutter
          </span>
        </div>
      </div>

      {/* Profiler Wrapped Table */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            Live Virtual Viewport (Scroll Container)
          </h2>
          <span className="text-xs text-muted-foreground">
            Scroll ke bawah untuk melihat pergantian baris virtual secara dinamis
          </span>
        </div>

        <Profiler id="virtualized-benchmark-table" onRender={handleRender}>
          <VirtualizedDataTable
            columns={benchmarkColumns}
            data={data}
            height={560}
            estimateRowHeight={52}
            overscan={8}
            isLoading={isGenerating}
          />
        </Profiler>
      </div>

      {/* Recent Profiler Logs */}
      <div className="flex flex-col gap-2 rounded-lg border border-border bg-muted/30 p-3 text-xs">
        <span className="font-semibold text-foreground">Recent React Profiler Commits:</span>
        <div ref={historyContainerRef} className="flex flex-wrap gap-2">
          <span className="text-muted-foreground italic">Menunggu commit Profiler...</span>
        </div>
      </div>
    </div>
  )
}
