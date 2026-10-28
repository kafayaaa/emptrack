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

import { AssetForm } from "./asset-form"
import { useCreateAsset } from "../hooks/use-create-asset"
import type { AssetFormValues } from "../schema/asset-form.schema"
import { useControllableState } from "@/hooks/use-controllable-state"

export interface AssetCreateDialogProps {
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
 * Komponen modal Dialog untuk membuat aset baru (EMPTRACK-91).
 * Terintegrasi langsung dengan hook useCreateAsset (POST /api/assets).
 */
export function AssetCreateDialog({
  trigger,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  className,
}: AssetCreateDialogProps) {
  const [isOpen, setIsOpen] = useControllableState({
    value: controlledOpen,
    defaultValue: false,
    onChange: setControlledOpen,
  })

  const { mutateAsync, isPending } = useCreateAsset()

  const handleSubmit = React.useCallback(
    async (values: AssetFormValues) => {
      await mutateAsync(values)
      setIsOpen(false)
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
            <Button size="sm" className="gap-2" data-testid="open-create-asset-dialog-button">
              <Plus className="size-4" aria-hidden="true" />
              <span>Tambah Aset</span>
            </Button>
          )
        }
      />

      <DialogContent
        data-testid="asset-create-dialog"
        className={cn("max-h-[90vh] overflow-y-auto sm:max-w-2xl", className)}
      >
        <DialogHeader>
          <DialogTitle>Tambah Aset Baru</DialogTitle>
          <DialogDescription>
            Masukkan spesifikasi lengkap, nomor seri, status operasional, dan nilai perolehan aset.
          </DialogDescription>
        </DialogHeader>

        <div className="pt-2">
          <AssetForm
            onSubmit={handleSubmit}
            onCancel={() => setIsOpen(false)}
            isSubmitting={isPending}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
