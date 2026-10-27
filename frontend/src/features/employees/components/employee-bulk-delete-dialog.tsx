"use client"

import * as React from "react"
import { AlertTriangle, Loader2, Trash2 } from "lucide-react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
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

import { useBulkDeleteEmployees } from "../hooks/use-bulk-delete-employees"

export interface EmployeeBulkDeleteDialogProps {
  /**
   * Daftar ID karyawan yang akan dihapus secara bulk.
   */
  employeeIds: string[]
  /**
   * Kustomisasi elemen tombol trigger pemanggil dialog bulk delete.
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
   * Callback ketika proses bulk delete selesai dan berhasil.
   */
  onSuccess?: () => void
  /**
   * CSS class tambahan untuk dialog content.
   */
  className?: string
}

/**
 * Komponen modal AlertDialog untuk konfirmasi penghapusan massal data karyawan (bulk delete)
 * dilengkapi dengan visual progress indicator (EMPTRACK-78).
 */
export function EmployeeBulkDeleteDialog({
  employeeIds,
  trigger,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  onSuccess,
  className,
}: EmployeeBulkDeleteDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)

  const isControlled = controlledOpen !== undefined
  const isOpen = isControlled ? controlledOpen : uncontrolledOpen

  const { mutateAsync, isPending, progress, resetProgress } = useBulkDeleteEmployees({
    onSuccess: () => {
      onSuccess?.()
    },
  })

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      // Cegah menutup modal saat proses delete sedang berjalan
      if (isPending) return

      if (!isControlled) {
        setUncontrolledOpen(nextOpen)
      }
      setControlledOpen?.(nextOpen)

      if (!nextOpen) {
        resetProgress()
      }
    },
    [isControlled, isPending, resetProgress, setControlledOpen],
  )

  const handleConfirmDelete = React.useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault()
      if (employeeIds.length === 0) return

      try {
        await mutateAsync(employeeIds)
        if (!isControlled) {
          setUncontrolledOpen(false)
        }
        setControlledOpen?.(false)
        resetProgress()
      } catch {
        // Error telah ditangani dan dinotifikasikan via toast oleh useBulkDeleteEmployees
      }
    },
    [employeeIds, isControlled, mutateAsync, resetProgress, setControlledOpen],
  )

  const count = employeeIds.length

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      {trigger !== null && (
        <AlertDialogTrigger
          render={
            trigger ? (
              (trigger as React.ReactElement)
            ) : (
              <Button variant="destructive" size="sm" className="gap-1.5" disabled={count === 0}>
                <Trash2 className="size-4" aria-hidden="true" />
                <span>Hapus Terpilih ({count})</span>
              </Button>
            )
          }
        />
      )}

      <AlertDialogContent className={cn("sm:max-w-md", className)}>
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20">
            {isPending ? (
              <Loader2 className="size-6 animate-spin text-destructive" aria-hidden="true" />
            ) : (
              <AlertTriangle className="size-6" aria-hidden="true" />
            )}
          </AlertDialogMedia>
          <AlertDialogTitle>
            {isPending ? "Menghapus Karyawan..." : "Hapus Karyawan Terpilih"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isPending ? (
              "Mohon tunggu, sistem sedang memproses penghapusan karyawan terpilih..."
            ) : (
              <>
                Apakah Anda yakin ingin menghapus{" "}
                <strong className="font-semibold text-foreground">{count} karyawan terpilih</strong>
                ? Tindakan ini bersifat permanen dan data yang dihapus tidak dapat dipulihkan
                kembali.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Progress Indicator Section */}
        {isPending && (
          <div className="space-y-2 py-2" data-slot="bulk-delete-progress">
            <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
              <span>
                Menghapus {progress.current} dari {progress.total} karyawan...
              </span>
              <span className="font-semibold text-foreground">{progress.percentage}%</span>
            </div>
            <Progress value={progress.percentage} className="h-2.5 w-full bg-muted" />
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Batal</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={handleConfirmDelete}
            disabled={isPending || count === 0}
            className="gap-1.5"
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                <span>
                  Menghapus ({progress.current}/{progress.total})...
                </span>
              </>
            ) : (
              <span>Ya, Hapus ({count}) Karyawan</span>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
