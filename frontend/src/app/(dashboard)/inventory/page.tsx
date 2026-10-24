import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Inventory",
}

export default function InventoryPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Inventory</h1>
        <p className="text-sm text-muted-foreground">
          Track and manage company hardware, equipment, and assets.
        </p>
      </div>
    </div>
  )
}
