"use client"

import * as React from "react"
import { Plus } from "lucide-react"
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
import { useCreateEmployee } from "../hooks/use-create-employee"
import type { EmployeeFormValues } from "../schema/employee-form.schema"

export interface EmployeeCreateDialogProps {
  /**
   * Kustomisasi elemen tombol trigger pemanggil dialog.
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
 * Komponen modal Dialog untuk membuat karyawan baru.
 * Terintegrasi langsung dengan hook useCreateEmployee (POST /api/employees).
 */
export function EmployeeCreateDialog({
  trigger,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  className,
}: EmployeeCreateDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)

  const isControlled = controlledOpen !== undefined
  const isOpen = isControlled ? controlledOpen : uncontrolledOpen

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(nextOpen)
      }
      setControlledOpen?.(nextOpen)
    },
    [isControlled, setControlledOpen],
  )

  const { mutateAsync, isPending } = useCreateEmployee()

  const handleSubmit = React.useCallback(
    async (values: EmployeeFormValues) => {
      await mutateAsync(values)
      handleOpenChange(false)
    },
    [mutateAsync, handleOpenChange],
  )

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          trigger ? (
            (trigger as React.ReactElement)
          ) : (
            <Button size="sm" className="gap-2">
              <Plus className="size-4" aria-hidden="true" />
              <span>Tambah Karyawan</span>
            </Button>
          )
        }
      />

      <DialogContent
        className={cn("max-h-[90vh] w-full max-w-2xl overflow-hidden p-0 sm:max-w-2xl", className)}
      >
        <div className="flex max-h-[90vh] flex-col">
          <DialogHeader className="border-b px-6 py-4">
            <DialogTitle className="text-lg font-bold">Tambah Karyawan Baru</DialogTitle>
            <DialogDescription>
              Isi data lengkap di bawah ini untuk mendaftarkan karyawan baru ke dalam sistem
              EmpTrack.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            <EmployeeForm
              onSubmit={handleSubmit}
              onCancel={() => handleOpenChange(false)}
              isSubmitting={isPending}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
