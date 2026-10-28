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

import { useDeleteAsset } from "../hooks/use-delete-asset"
import type { Asset } from "../types"
import { useControllableState } from "@/hooks/use-controllable-state"

export interface AssetDeleteDialogProps {
  /**
   * Data identitas aset yang akan dihapus.
   */
  asset: Pick<Asset, "id" | "name" | "assetTag">
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
   * Mengarahkan pengguna kembali ke daftar aset (/assets) setelah berhasil dihapus.
   * Default: false (true saat digunakan di detail page).
   */
  redirectToIndex?: boolean
  /**
   * CSS class tambahan untuk dialog content.
   */
  className?: string
}

/**
 * Komponen modal AlertDialog untuk konfirmasi penghapusan satu data aset (EMPTRACK-93).
 * Mencegah penghapusan tidak disengaja, terintegrasi dengan useDeleteAsset dan Sonner toast.
 */
export function AssetDeleteDialog({
  asset,
  trigger,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  redirectToIndex = false,
  className,
}: AssetDeleteDialogProps) {
  const [isOpen, setIsOpen] = useControllableState({
    value: controlledOpen,
    defaultValue: false,
    onChange: setControlledOpen,
  })

  const { mutateAsync, isPending } = useDeleteAsset({
    assetName: asset.name,
    redirectToIndex,
  })

  const handleConfirmDelete = React.useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault()
      try {
        await mutateAsync(asset.id)
        setIsOpen(false)
      } catch {
        // Rollback dan notifikasi toast kegagalan ditangani di dalam hook useDeleteAsset
      }
    },
    [asset.id, mutateAsync, setIsOpen],
  )

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger
        render={
          trigger ? (
            (trigger as React.ReactElement)
          ) : (
            <Button
              variant="destructive"
              size="sm"
              className="gap-2 text-xs"
              aria-label={`Hapus aset ${asset.name}`}
              data-testid={`open-delete-asset-dialog-button-${asset.id}`}
            >
              <Trash2 className="size-3.5" aria-hidden="true" />
              <span>Hapus Data</span>
            </Button>
          )
        }
      />

      <AlertDialogContent
        data-testid="asset-delete-dialog"
        className={cn("sm:max-w-md", className)}
      >
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive">
            <Trash2 className="size-6" aria-hidden="true" />
          </AlertDialogMedia>

          <AlertDialogTitle>Hapus Data Aset</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus data aset{" "}
            <span className="font-semibold text-foreground">&quot;{asset.name}&quot;</span> (
            <span className="font-mono font-medium text-foreground">{asset.assetTag}</span>)?
            Tindakan ini bersifat permanen dan data inventaris akan dihapus dari sistem.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Batal</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={handleConfirmDelete}
            disabled={isPending}
            aria-busy={isPending}
            data-testid="confirm-delete-asset-button"
          >
            {isPending && <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />}
            {isPending ? "Menghapus..." : "Hapus Aset"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
