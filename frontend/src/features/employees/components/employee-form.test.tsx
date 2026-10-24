import React from "react"
import { describe, it, expect, vi } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import { EmployeeForm } from "./employee-form"
import type { Employee } from "../types"

describe("EmployeeForm component", () => {
  const dummyEmployee: Employee = {
    id: "emp-1",
    employeeNumber: "EMP-00042",
    fullName: "Siti Rahma",
    email: "siti.rahma@perusahaan.com",
    phone: "+62 811-2233-4455",
    department: "Engineering",
    position: "Frontend Developer",
    status: "active",
    hireDate: "2023-05-10",
    isManager: true,
    managerId: null,
    projectId: "5",
  }

  it("renders all form fields, labels, and placeholders in Create mode", () => {
    const handleSubmit = vi.fn()
    const html = renderToStaticMarkup(<EmployeeForm onSubmit={handleSubmit} />)

    // Sections
    expect(html).toContain("Informasi Pribadi &amp; Kontak")
    expect(html).toContain("Pekerjaan &amp; Penempatan")
    expect(html).toContain("Struktur Organisasi")

    // Labels
    expect(html).toContain("Nomor Pegawai")
    expect(html).toContain("Nama Lengkap")
    expect(html).toContain("Email Perusahaan")
    expect(html).toContain("Nomor Telepon")
    expect(html).toContain("Departemen")
    expect(html).toContain("Posisi / Jabatan")
    expect(html).toContain("Status Karyawan")
    expect(html).toContain("Tanggal Mulai Kerja")
    expect(html).toContain("ID Proyek")
    expect(html).toContain("Tingkat Manajer")
    expect(html).toContain("ID Manajer (Opsional)")

    // Button label
    expect(html).toContain("Tambah Karyawan")
  })

  it("pre-fills form inputs with initialData in Edit mode", () => {
    const handleSubmit = vi.fn()
    const html = renderToStaticMarkup(
      <EmployeeForm initialData={dummyEmployee} onSubmit={handleSubmit} />,
    )

    expect(html).toContain('value="EMP-00042"')
    expect(html).toContain('value="Siti Rahma"')
    expect(html).toContain('value="siti.rahma@perusahaan.com"')
    expect(html).toContain('value="+62 811-2233-4455"')
    expect(html).toContain('value="2023-05-10"')
    expect(html).toContain('value="5"')
    expect(html).toContain("Simpan Perubahan")
  })

  it("renders Cancel button when onCancel callback is provided", () => {
    const handleCancel = vi.fn()
    const html = renderToStaticMarkup(<EmployeeForm onSubmit={vi.fn()} onCancel={handleCancel} />)

    expect(html).toContain("Batal")
  })

  it("renders loading spinner and disabled state when isSubmitting is true", () => {
    const html = renderToStaticMarkup(<EmployeeForm onSubmit={vi.fn()} isSubmitting={true} />)

    expect(html).toContain("Menyimpan...")
    expect(html).toContain("disabled")
  })
})
