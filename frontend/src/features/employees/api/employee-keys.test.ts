import { describe, it, expect } from "vitest"
import { employeeKeys } from "./employee-keys"
import type { EmployeeListInputQuery } from "../schema/employee.schema"

describe("employeeKeys Query Key Factory (EMPTRACK-79)", () => {
  it("generates root key matching all employee queries", () => {
    expect(employeeKeys.all).toEqual(["employees"])
  })

  it("generates correct keys for paginated lists and filtered lists", () => {
    expect(employeeKeys.lists()).toEqual(["employees", "list"])

    const filters: EmployeeListInputQuery = {
      page: 2,
      pageSize: 20,
      department: "Engineering",
      search: "Budi",
    }
    expect(employeeKeys.list(filters)).toEqual(["employees", "list", filters])
  })

  it("generates correct keys for infinite scroll lists", () => {
    expect(employeeKeys.infiniteLists()).toEqual(["employees", "infinite-list"])

    const infiniteParams = {
      pageSize: 50,
      status: "active" as const,
    }
    expect(employeeKeys.infiniteList(infiniteParams)).toEqual([
      "employees",
      "infinite-list",
      infiniteParams,
    ])
  })

  it("generates correct keys for employee details", () => {
    expect(employeeKeys.details()).toEqual(["employees", "detail"])
    expect(employeeKeys.detail("emp-42")).toEqual(["employees", "detail", "emp-42"])
  })

  it("generates correct keys for checkEmail validation queries", () => {
    expect(employeeKeys.checkEmail("Budi.Santoso@Perusahaan.com", "emp-42")).toEqual([
      "employees",
      "check-email",
      "budi.santoso@perusahaan.com",
      "emp-42",
    ])
  })
})
