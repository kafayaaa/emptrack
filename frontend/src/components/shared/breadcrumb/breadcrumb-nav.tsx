import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb"
import { Home } from "lucide-react"
import Link from "next/link"
import BreadcrumbLists from "./breadcrumb-lists"

export default function BreadcrumbNav() {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="hidden md:block">
          <BreadcrumbLink render={<Link href="/dashboard" />}>
            <Home className="size-4" />
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbLists />
      </BreadcrumbList>
    </Breadcrumb>
  )
}
