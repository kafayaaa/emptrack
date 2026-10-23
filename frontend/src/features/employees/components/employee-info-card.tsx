import * as React from "react"
import type { LucideIcon } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { cn } from "cn"

export interface EmployeeInfoCardProps extends React.ComponentProps<typeof Card> {
  id: string
  title: string
  icon?: LucideIcon
  action?: React.ReactNode
  children: React.ReactNode
}

export function EmployeeInfoCard({
  id,
  title,
  icon: Icon,
  action,
  children,
  className,
  ...props
}: EmployeeInfoCardProps) {
  return (
    <Card
      as="section"
      aria-labelledby={id}
      className={cn("flex flex-col gap-4 p-5 shadow-2xs", className)}
      {...props}
    >
      <CardHeader className="flex flex-row items-center justify-between border-b border-border/60 p-0 pb-3">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="size-4 text-primary" aria-hidden="true" />}
          <CardTitle as="h2" id={id} className="text-sm font-semibold text-foreground">
            {title}
          </CardTitle>
        </div>
        {action}
      </CardHeader>
      <CardContent className="p-0">{children}</CardContent>
    </Card>
  )
}
