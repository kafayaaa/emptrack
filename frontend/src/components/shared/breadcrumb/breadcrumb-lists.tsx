"use client"

import {
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { formatTitle, toSingular } from "@/lib/string"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function BreadcrumbLists() {
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean)

  if (segments.length === 0 || segments[0] === "dashboard") {
    return null
  }

  return (
    <>
      {segments.map((segment, index) => {
        const href = `/${segments.slice(0, index + 1).join("/")}`
        const isLast = index === segments.length - 1

        const isId = /^[0-9]+$/.test(segment) || /^[0-9a-fA-F-]{16,}$/.test(segment)
        const prevSegment = segments[index - 1]

        let label: string
        if (isId && prevSegment) {
          label = `Detail ${formatTitle(toSingular(prevSegment))}`
        } else {
          label = formatTitle(segment)
        }

        return (
          <div key={href} className="inline-flex items-center gap-1.5 sm:gap-2.5">
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              {isLast ? (
                <BreadcrumbPage>{label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink render={<Link href={href} />}>{label}</BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </div>
        )
      })}
    </>
  )
}
