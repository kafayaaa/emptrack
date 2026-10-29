import * as React from "react"
import Link from "next/link"
import { LucideIcon, ArrowUpRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "cn"

export interface DashboardStatCardProps {
  title: string
  value: string | number
  description?: string
  icon: LucideIcon
  iconColorClass?: string
  iconBgClass?: string
  href?: string
  badge?: React.ReactNode
  className?: string
  "data-testid"?: string
}

export function DashboardStatCard({
  title,
  value,
  description,
  icon: Icon,
  iconColorClass = "text-primary",
  iconBgClass = "bg-primary/10",
  href,
  badge,
  className,
  "data-testid": testId,
}: DashboardStatCardProps) {
  const content = (
    <Card
      data-testid={testId}
      className={cn(
        "group relative overflow-hidden transition-all duration-200 hover:shadow-md",
        href && "cursor-pointer hover:border-primary/50",
        className,
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {value}
              </span>
              {badge}
            </div>
            {description && (
              <p className="pt-0.5 text-xs text-muted-foreground/80">{description}</p>
            )}
          </div>
          <div
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105",
              iconBgClass,
              iconColorClass,
            )}
          >
            <Icon className="size-5.5" aria-hidden="true" />
          </div>
        </div>

        {href && (
          <div className="mt-3.5 flex items-center gap-1 text-[11px] font-medium text-primary opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <span>Lihat detail</span>
            <ArrowUpRight className="size-3" aria-hidden="true" />
          </div>
        )}
      </CardContent>
    </Card>
  )

  if (href) {
    return (
      <Link href={href} className="block no-underline">
        {content}
      </Link>
    )
  }

  return content
}
