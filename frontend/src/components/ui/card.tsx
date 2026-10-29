import * as React from "react"
import { cn } from "cn"

type CardProps<T extends React.ElementType = "div"> = {
  as?: T
} & React.ComponentPropsWithoutRef<T>

function Card<T extends React.ElementType = "div">({ as, className, ...props }: CardProps<T>) {
  const Component = as || "div"
  return (
    <Component
      data-slot="card"
      className={cn(
        "rounded-xl border border-border bg-card text-card-foreground shadow-2xs",
        className,
      )}
      {...props}
    />
  )
}

type CardHeaderProps<T extends React.ElementType = "div"> = {
  as?: T
} & React.ComponentPropsWithoutRef<T>

function CardHeader<T extends React.ElementType = "div">({
  as,
  className,
  ...props
}: CardHeaderProps<T>) {
  const Component = as || "div"
  return (
    <Component
      data-slot="card-header"
      className={cn("flex flex-col gap-1.5 p-5 sm:p-6", className)}
      {...props}
    />
  )
}

type CardTitleProps<T extends React.ElementType = "div"> = {
  as?: T
} & React.ComponentPropsWithoutRef<T>

function CardTitle<T extends React.ElementType = "div">({
  as,
  className,
  ...props
}: CardTitleProps<T>) {
  const Component = as || "div"
  return (
    <Component
      data-slot="card-title"
      className={cn("leading-none font-semibold tracking-tight text-foreground", className)}
      {...props}
    />
  )
}

type CardDescriptionProps<T extends React.ElementType = "div"> = {
  as?: T
} & React.ComponentPropsWithoutRef<T>

function CardDescription<T extends React.ElementType = "div">({
  as,
  className,
  ...props
}: CardDescriptionProps<T>) {
  const Component = as || "div"
  return (
    <Component
      data-slot="card-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

type CardContentProps<T extends React.ElementType = "div"> = {
  as?: T
} & React.ComponentPropsWithoutRef<T>

function CardContent<T extends React.ElementType = "div">({
  as,
  className,
  ...props
}: CardContentProps<T>) {
  const Component = as || "div"
  return <Component data-slot="card-content" className={cn("p-5 sm:p-6", className)} {...props} />
}

type CardFooterProps<T extends React.ElementType = "div"> = {
  as?: T
} & React.ComponentPropsWithoutRef<T>

function CardFooter<T extends React.ElementType = "div">({
  as,
  className,
  ...props
}: CardFooterProps<T>) {
  const Component = as || "div"
  return (
    <Component
      data-slot="card-footer"
      className={cn("flex items-center p-5 sm:p-6", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="card-action" className={cn("flex items-center gap-2", className)} {...props} />
  )
}

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, CardAction }
