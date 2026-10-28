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
import { AssetForm } from "./asset-form"
import { useUpdateAsset } from "../hooks/use-update-asset"
import type { AssetFormValues } from "../schema/asset-form.schema"
import type { Asset } from "../types"
import { useControllableState } from "@/hooks/use-controllable-state"

export interface AssetEditDialogProps {
  /**
   * Data lengkap aset yang akan diedit (dipakai untuk prefill form).
   */
  asset: Asset
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
 * Komponen modal Dialog untuk mengedit data aset inventaris (EMPTRACK-91).
 * Mengisi formulir dengan data awal (prefill) dan terintegrasi dengan useUpdateAsset (PATCH /api/assets/[id]).
 */
export function AssetEditDialog({
  asset,
  trigger,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  className,
}: AssetEditDialogProps) {
  const [isOpen, setIsOpen] = useControllableState({
    value: controlledOpen,
    defaultValue: false,
    onChange: setControlledOpen,
  })

  const { mutateAsync, isPending } = useUpdateAsset(asset.id)

  const handleSubmit = React.useCallback(
    async (values: AssetFormValues) => {
      // Tutup modal seketika untuk memberikan feedback responsif instan (optimistic UI)
      setIsOpen(false)
      try {
        await mutateAsync(values)
      } catch {
        // Error, rollback, dan toast error ditangani oleh hook useUpdateAsset
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
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Edit data aset ${asset.name}`}
              data-testid={`open-edit-asset-dialog-button-${asset.id}`}
            >
              <Pencil className="size-3.5" aria-hidden="true" />
            </Button>
          )
        }
      />

      <DialogContent
        data-testid="asset-edit-dialog"
        className={cn("max-h-[90vh] overflow-y-auto sm:max-w-2xl", className)}
      >
        <DialogHeader>
          <DialogTitle>Edit Data Aset</DialogTitle>
          <DialogDescription>
            Perbarui informasi spesifikasi, status penugasan, atau catatan untuk{" "}
            <span className="font-medium text-foreground">{asset.name}</span> (
            <span className="font-mono text-foreground">{asset.assetTag}</span>).
          </DialogDescription>
        </DialogHeader>

        <div className="pt-2">
          <AssetForm
            initialData={asset}
            onSubmit={handleSubmit}
            onCancel={() => setIsOpen(false)}
            isSubmitting={isPending}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
