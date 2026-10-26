"use client"

import * as React from "react"
import { Loader2, Trash2 } from "lucide-react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import { useDeleteEmployee } from "../hooks/use-delete-employee"
import type { Employee } from "../types"

export interface EmployeeDeleteDialogProps {
  /**
   * Data identitas karyawan yang akan dihapus.
   */
  employee: Pick<Employee, "id" | "fullName" | "employeeNumber">
  /**
   * Kustomisasi elemen tombol trigger pemanggil dialog delete.
   */
  trigger?: React.ReactNode
  /**
   * State controlled untuk membuka dialog konfirmasi.
   */
  open?: boolean
  /**
   * Callback ketika state buka/tutup berubah.
   */
  onOpenChange?: (open: boolean) => void
  /**
   * Mengarahkan pengguna kembali ke daftar karyawan (/employees) setelah berhasil dihapus.
   * Umumnya bernilai true ketika tombol berada di halaman detail karyawan.
   */
  redirectToIndex?: boolean
  /**
   * CSS class tambahan untuk dialog content.
   */
  className?: string
}

/**
 * Komponen modal AlertDialog untuk konfirmasi penghapusan data karyawan (EMPTRACK-74).
 * Mencegah penghapusan tidak disengaja, terintegrasi dengan useDeleteEmployee dan Sonner toast.
 */
export function EmployeeDeleteDialog({
  employee,
  trigger,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  redirectToIndex = false,
  className,
}: EmployeeDeleteDialogProps) {
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

  const { mutateAsync, isPending } = useDeleteEmployee({
    employeeName: employee.fullName,
    redirectToIndex,
  })

  const handleConfirmDelete = React.useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault()
      try {
        await mutateAsync(employee.id)
        handleOpenChange(false)
      } catch {
        // Error telah ditangani dan dinotifikasikan via toast oleh useDeleteEmployee
      }
    },
    [employee.id, mutateAsync, handleOpenChange],
  )

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger
        render={
          trigger ? (
            (trigger as React.ReactElement)
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs text-destructive hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive dark:hover:bg-destructive/20"
            >
              <Trash2 className="size-3.5" aria-hidden="true" />
              <span>Hapus Data</span>
            </Button>
          )
        }
      />

      <AlertDialogContent className={cn("sm:max-w-md", className)}>
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20">
            <Trash2 className="size-6" aria-hidden="true" />
          </AlertDialogMedia>
          <AlertDialogTitle>Hapus Data Karyawan</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus data karyawan{" "}
            <strong className="font-semibold text-foreground">{employee.fullName}</strong> (
            <span className="font-mono">{employee.employeeNumber}</span>)? Tindakan ini bersifat
            permanen dan data tidak dapat dipulihkan.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Batal</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={handleConfirmDelete}
            disabled={isPending}
            className="gap-1.5"
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                <span>Menghapus...</span>
              </>
            ) : (
              <span>Ya, Hapus Karyawan</span>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
