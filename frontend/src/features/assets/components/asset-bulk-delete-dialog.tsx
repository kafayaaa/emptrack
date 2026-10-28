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
import { useBulkDeleteAssets } from "../hooks/use-bulk-delete-assets"
import { useControllableState } from "@/hooks/use-controllable-state"

export interface AssetBulkDeleteDialogProps {
  /**
   * Daftar ID aset yang akan dihapus secara bulk.
   */
  assetIds: string[]
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
 * Komponen modal AlertDialog untuk konfirmasi penghapusan massal data aset (bulk delete)
 * dilengkapi dengan visual progress indicator (EMPTRACK-93).
 */
export function AssetBulkDeleteDialog({
  assetIds,
  trigger,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  onSuccess,
  className,
}: AssetBulkDeleteDialogProps) {
  const [isOpen, setIsOpen] = useControllableState({
    value: controlledOpen,
    defaultValue: false,
    onChange: setControlledOpen,
  })

  const { mutateAsync, isPending, progress, resetProgress } = useBulkDeleteAssets({
    onSuccess: () => {
      onSuccess?.()
    },
  })

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      // Cegah menutup modal saat proses delete sedang berjalan
      if (isPending) return

      setIsOpen(nextOpen)

      if (!nextOpen) {
        resetProgress()
      }
    },
    [isPending, resetProgress, setIsOpen],
  )

  const handleConfirmDelete = React.useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault()
      try {
        await mutateAsync(assetIds)
        setIsOpen(false)
      } catch {
        // Rollback dan notifikasi kegagalan ditangani di hook useBulkDeleteAssets
      }
    },
    [assetIds, mutateAsync, setIsOpen],
  )

  const count = assetIds.length

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger
        render={
          trigger ? (
            (trigger as React.ReactElement)
          ) : (
            <Button
              variant="destructive"
              size="sm"
              disabled={count === 0}
              className="gap-2 text-xs"
              data-testid="open-bulk-delete-asset-dialog-button"
            >
              <Trash2 className="size-3.5" aria-hidden="true" />
              <span>Hapus Terpilih ({count})</span>
            </Button>
          )
        }
      />

      <AlertDialogContent
        data-testid="asset-bulk-delete-dialog"
        className={cn("sm:max-w-md", className)}
      >
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive">
            <AlertTriangle className="size-6" aria-hidden="true" />
          </AlertDialogMedia>

          <AlertDialogTitle>Hapus {count} Aset Terpilih?</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus{" "}
            <span className="font-semibold text-foreground">{count} data aset</span> yang telah
            dipilih? Seluruh record inventaris dan relasi penugasan hardware ini akan dihapus secara
            permanen. Tindakan ini tidak dapat dibatalkan.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Visual Progress Bar saat proses penghapusan berlangsung */}
        {isPending && (
          <div
            data-testid="bulk-delete-asset-progress-container"
            className="flex flex-col gap-2 rounded-lg border border-border/60 bg-muted/30 p-3"
          >
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5 font-medium text-foreground">
                <Loader2 className="size-3.5 animate-spin text-primary" aria-hidden="true" />
                Menghapus aset...
              </span>
              <span className="font-mono text-[11px] font-semibold text-foreground">
                {progress.current} / {progress.total} ({progress.percentage}%)
              </span>
            </div>
            <Progress value={progress.percentage} className="h-2 w-full" />
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Batal</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={handleConfirmDelete}
            disabled={isPending || count === 0}
            aria-busy={isPending}
            data-testid="confirm-bulk-delete-asset-button"
          >
            {isPending && <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />}
            {isPending ? "Memproses..." : `Hapus ${count} Aset`}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
