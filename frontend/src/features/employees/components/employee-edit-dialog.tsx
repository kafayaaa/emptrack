"use client"

import * as React from "react"
import { Pencil } from "lucide-react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { EmployeeForm } from "./employee-form"
import { useUpdateEmployee } from "../hooks/use-update-employee"
import type { EmployeeFormValues } from "../schema/employee-form.schema"
import type { Employee } from "../types"
import { useControllableState } from "@/hooks/use-controllable-state"

export interface EmployeeEditDialogProps {
  /**
   * Data lengkap karyawan yang akan diedit (dipakai untuk prefill form).
   */
  employee: Employee
  /**
   * Kustomisasi elemen tombol trigger pemanggil dialog edit.
   */
  trigger?: React.ReactNode
  /**
   * State controlled untuk membuka dialog.
   */
  open?: boolean
  /**
   * Callback ketika state buka/tutup berubah.
   */
  onOpenChange?: (open: boolean) => void
  /**
   * CSS class tambahan untuk dialog content.
   */
  className?: string
}

/**
 * Komponen modal Dialog untuk mengedit data karyawan yang sudah ada.
 * Mengisi formulir dengan data awal (prefill) dan terintegrasi dengan useUpdateEmployee (PATCH /api/employees/[id]).
 */
export function EmployeeEditDialog({
  employee,
  trigger,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  className,
}: EmployeeEditDialogProps) {
  const [isOpen, setIsOpen] = useControllableState({
    value: controlledOpen,
    defaultValue: false,
    onChange: setControlledOpen,
  })

  const { mutateAsync, isPending } = useUpdateEmployee(employee.id)

  const handleSubmit = React.useCallback(
    async (values: EmployeeFormValues) => {
      // Tutup modal seketika untuk memberikan feedback responsif instan (optimistic UI)
      setIsOpen(false)
      try {
        await mutateAsync(values)
      } catch {
        // Error, rollback, dan toast error ditangani oleh hook useUpdateEmployee
      }
    },
    [mutateAsync, setIsOpen],
  )

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger
        render={
          trigger ? (
            (trigger as React.ReactElement)
          ) : (
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <Pencil className="size-3.5" aria-hidden="true" />
              <span>Edit Data</span>
            </Button>
          )
        }
      />

      <DialogContent
        className={cn("max-h-[90vh] w-full max-w-2xl overflow-hidden p-0 sm:max-w-2xl", className)}
      >
        <div className="flex max-h-[90vh] flex-col">
          <DialogHeader className="border-b px-6 py-4">
            <DialogTitle className="text-lg font-bold">Edit Data Karyawan</DialogTitle>
            <DialogDescription>
              Perbarui rincian informasi data diri, jabatan, atau hierarki untuk {employee.fullName}
              .
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            <EmployeeForm
              initialData={employee}
              onSubmit={handleSubmit}
              onCancel={() => setIsOpen(false)}
              isSubmitting={isPending}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
