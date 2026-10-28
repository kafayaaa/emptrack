import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { cn } from "cn"
import type { AssetStatus } from "../types"

export const ASSET_STATUS_CONFIG: Record<
  AssetStatus,
  { label: string; variant: "success" | "default" | "warning" | "secondary" }
> = {
  available: {
    label: "Available",
    variant: "success",
  },
  assigned: {
    label: "Assigned",
    variant: "default",
  },
  maintenance: {
    label: "Maintenance",
    variant: "warning",
  },
  retired: {
    label: "Retired",
    variant: "secondary",
  },
}

export interface AssetStatusBadgeProps {
  status: AssetStatus | string
  className?: string
}

function BaseAssetStatusBadge({ status, className }: AssetStatusBadgeProps) {
  const config =
    status in ASSET_STATUS_CONFIG
      ? ASSET_STATUS_CONFIG[status as AssetStatus]
      : {
          label: status,
          variant: "outline" as const,
        }

  return (
    <Badge variant={config.variant} className={cn("capitalize", className)}>
      {config.label}
    </Badge>
  )
}

export const AssetStatusBadge = React.memo(BaseAssetStatusBadge)
