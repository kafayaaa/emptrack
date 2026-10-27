import { describe, it, expect, vi, beforeEach } from "vitest"
import type { InfiniteData, QueryClient } from "@tanstack/react-query"
import {
  snapshotEmployeeLists,
  rollbackEmployeeLists,
  invalidateEmployeeLists,
  optimisticallyRemoveEmployeesFromCache,
  type EmployeeListsCacheSnapshot,
  type EmployeeListSnapshot,
  type EmployeeInfiniteListSnapshot,
} from "./employee-cache-utils"
import { employeeKeys } from "../api/employees.api"
import type { Employee, EmployeeListResponse } from "../schema/employee.schema"

describe("employee-cache-utils (EMPTRACK-82)", () => {
  let mockQueryClient: QueryClient

  beforeEach(() => {
    vi.clearAllMocks()
    mockQueryClient = {
      getQueriesData: vi.fn(),
      setQueryData: vi.fn(),
      setQueriesData: vi.fn(),
      invalidateQueries: vi.fn().mockResolvedValue(undefined),
    } as unknown as QueryClient
  })

  describe("snapshotEmployeeLists", () => {
    it("memanggil getQueriesData untuk lists dan infiniteLists", () => {
      snapshotEmployeeLists(mockQueryClient)

      expect(mockQueryClient.getQueriesData).toHaveBeenCalledWith({
        queryKey: employeeKeys.lists(),
      })
      expect(mockQueryClient.getQueriesData).toHaveBeenCalledWith({
        queryKey: employeeKeys.infiniteLists(),
      })
    })
  })

  describe("rollbackEmployeeLists", () => {
    it("melakukan setQueryData untuk setiap snapshot yang tersimpan", () => {
      const previousLists: EmployeeListSnapshot = [
        [employeeKeys.lists(), { data: [], meta: {} } as unknown as EmployeeListResponse],
      ]
      const previousInfiniteLists: EmployeeInfiniteListSnapshot = [
        [
          employeeKeys.infiniteLists(),
          { pages: [], pageParams: [] } as unknown as InfiniteData<EmployeeListResponse>,
        ],
      ]
      const mockSnapshot: EmployeeListsCacheSnapshot = {
        previousLists,
        previousInfiniteLists,
      }

      rollbackEmployeeLists(mockQueryClient, mockSnapshot)

      expect(mockQueryClient.setQueryData).toHaveBeenCalledTimes(2)
      expect(mockQueryClient.setQueryData).toHaveBeenCalledWith(
        employeeKeys.lists(),
        previousLists[0][1],
      )
      expect(mockQueryClient.setQueryData).toHaveBeenCalledWith(
        employeeKeys.infiniteLists(),
        previousInfiniteLists[0][1],
      )
    })

    it("tidak melempar error jika snapshot bernilai undefined", () => {
      expect(() => rollbackEmployeeLists(mockQueryClient, undefined)).not.toThrow()
    })
  })

  describe("invalidateEmployeeLists", () => {
    it("menginvalidasi queries lists dan infiniteLists", async () => {
      await invalidateEmployeeLists(mockQueryClient)

      expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: employeeKeys.lists(),
      })
      expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: employeeKeys.infiniteLists(),
      })
    })
  })

  describe("optimisticallyRemoveEmployeesFromCache", () => {
    it("memanggil setQueriesData untuk lists dan infiniteLists saat diberikan ID tunggal atau array", () => {
      optimisticallyRemoveEmployeesFromCache(mockQueryClient, "emp-1")

      expect(mockQueryClient.setQueriesData).toHaveBeenCalledWith(
        { queryKey: employeeKeys.lists() },
        expect.any(Function),
      )
      expect(mockQueryClient.setQueriesData).toHaveBeenCalledWith(
        { queryKey: employeeKeys.infiniteLists() },
        expect.any(Function),
      )
    })

    it("mengupdate state paginated list dengan benar saat updater function dijalankan", () => {
      optimisticallyRemoveEmployeesFromCache(mockQueryClient, ["emp-1"])

      const setQueriesDataCalls = vi.mocked(mockQueryClient.setQueriesData).mock.calls
      const paginatedUpdater = setQueriesDataCalls[0][1] as (
        old: EmployeeListResponse | undefined,
      ) => EmployeeListResponse

      const oldData: EmployeeListResponse = {
        data: [
          { id: "emp-1", fullName: "Budi" } as unknown as Employee,
          { id: "emp-2", fullName: "Siti" } as unknown as Employee,
        ],
        meta: { page: 1, pageSize: 10, total: 2, totalPages: 1 },
      }

      const updated = paginatedUpdater(oldData)

      expect(updated.data).toHaveLength(1)
      expect(updated.data[0].id).toBe("emp-2")
      expect(updated.meta.total).toBe(1)
    })

    it("tidak melakukan apa-apa jika array ids kosong", () => {
      optimisticallyRemoveEmployeesFromCache(mockQueryClient, [])
      expect(mockQueryClient.setQueriesData).not.toHaveBeenCalled()
    })
  })
})
