"use client"

import * as React from "react"
import { DataTableSelectFilter } from "@/components/shared/data-table"
import {
  EMPLOYEE_DEPARTMENTS,
  EMPLOYEE_POSITIONS,
  ALL_EMPLOYEE_POSITIONS,
  EMPLOYEE_STATUS_OPTIONS,
  type EmployeeDepartment,
} from "../constants"

export interface EmployeeFiltersState {
  department?: string
  position?: string
  status?: string
}

export interface EmployeeFiltersProps {
  /**
   * Current filter values.
   */
  filters: EmployeeFiltersState
  /**
   * Callback fired when any filter value changes.
   */
  onFiltersChange: (filters: EmployeeFiltersState) => void
  /**
   * Additional wrapper className.
   */
  className?: string
}

/**
 * Filter dropdown bar for employees (Department, Position, Status).
 * Position options adapt dynamically based on the selected Department.
 */
export function EmployeeFilters({ filters, onFiltersChange, className }: EmployeeFiltersProps) {
  const { department, position, status } = filters

  const handleDepartmentChange = React.useCallback(
    (nextDept: string) => {
      // If position is no longer valid in new department, reset position
      let nextPos = position
      if (nextDept && position) {
        const validPositions = EMPLOYEE_POSITIONS[nextDept as EmployeeDepartment] ?? []
        if (!validPositions.includes(position)) {
          nextPos = undefined
        }
      }
      onFiltersChange({
        ...filters,
        department: nextDept || undefined,
        position: nextPos,
      })
    },
    [filters, onFiltersChange, position],
  )

  const handlePositionChange = React.useCallback(
    (nextPos: string) => {
      onFiltersChange({
        ...filters,
        position: nextPos || undefined,
      })
    },
    [filters, onFiltersChange],
  )

  const handleStatusChange = React.useCallback(
    (nextStatus: string) => {
      onFiltersChange({
        ...filters,
        status: nextStatus || undefined,
      })
    },
    [filters, onFiltersChange],
  )

  // Dynamic position options based on selected department
  const positionOptions = React.useMemo(() => {
    if (department && department in EMPLOYEE_POSITIONS) {
      return EMPLOYEE_POSITIONS[department as EmployeeDepartment]
    }
    return ALL_EMPLOYEE_POSITIONS
  }, [department])

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className ?? ""}`.trim()}>
      <DataTableSelectFilter
        title="Departemen"
        options={EMPLOYEE_DEPARTMENTS}
        value={department}
        onValueChange={handleDepartmentChange}
        ariaLabel="Filter departemen karyawan"
      />

      <DataTableSelectFilter
        title="Posisi"
        options={positionOptions}
        value={position}
        onValueChange={handlePositionChange}
        ariaLabel="Filter posisi karyawan"
      />

      <DataTableSelectFilter
        title="Status"
        options={EMPLOYEE_STATUS_OPTIONS}
        value={status}
        onValueChange={handleStatusChange}
        ariaLabel="Filter status karyawan"
      />
    </div>
  )
}
