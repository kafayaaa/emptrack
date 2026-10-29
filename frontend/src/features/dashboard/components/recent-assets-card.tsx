import * as React from "react"
import Link from "next/link"
import { ArrowUpRight, Laptop, Calendar } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AssetStatusBadge } from "@/features/assets/components/asset-status-badge"
import type { DashboardRecentAsset } from "../types"

export interface RecentAssetsCardProps {
  assets: DashboardRecentAsset[]
}

export function RecentAssetsCard({ assets }: RecentAssetsCardProps) {
  return (
    <Card data-testid="recent-assets-card" className="flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-base font-semibold text-foreground">
            Aset Baru &amp; Terkini
          </CardTitle>
          <CardDescription className="text-xs">
            Inventaris perangkat keras yang tercatat dalam sistem.
          </CardDescription>
        </div>
        <Link href="/assets">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <span>Semua Aset</span>
            <ArrowUpRight className="size-3.5" aria-hidden="true" />
          </Button>
        </Link>
      </CardHeader>

      <CardContent>
        {assets.length === 0 ? (
          <div className="flex h-36 flex-col items-center justify-center text-center text-xs text-muted-foreground">
            <Laptop className="mb-2 size-8 stroke-1 text-muted-foreground/50" aria-hidden="true" />
            <p>Belum ada data aset tercatat.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {assets.map((asset) => (
              <div
                key={asset.id}
                data-testid={`recent-asset-item-${asset.id}`}
                className="group flex items-center justify-between py-3 transition-colors hover:bg-muted/30"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Laptop className="size-4" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <Link
                      href={`/assets/${asset.id}`}
                      className="truncate text-xs font-semibold text-foreground group-hover:text-primary hover:underline"
                    >
                      {asset.name}
                    </Link>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <span className="font-mono">{asset.assetTag}</span>
                      <span>•</span>
                      <span>{asset.category}</span>
                      {asset.purchaseDate && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="size-3" aria-hidden="true" />
                            {asset.purchaseDate}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 pl-3">
                  <AssetStatusBadge status={asset.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
