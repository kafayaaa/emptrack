import * as React from "react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { AssetDetailContainer } from "@/features/assets"
import { getAssetByIdServer } from "@/features/assets/api/assets.server"

interface AssetDetailPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: AssetDetailPageProps): Promise<Metadata> {
  const { id } = await params
  const asset = await getAssetByIdServer(id)

  if (!asset) {
    return {
      title: "Asset Not Found",
      description: `Asset record with ID "${id}" could not be found.`,
      robots: {
        index: false,
        follow: false,
      },
    }
  }

  const title = `${asset.name} (${asset.assetTag})`
  const description = `Spesifikasi lengkap, status ${asset.status}, dan riwayat penugasan untuk ${asset.name} (${asset.assetTag}) di modul inventaris EmpTrack.`

  return {
    title,
    description,
    alternates: {
      canonical: `/assets/${asset.id}`,
    },
    openGraph: {
      title: `${asset.name} (${asset.assetTag}) | EmpTrack`,
      description,
      url: `/assets/${asset.id}`,
      type: "website",
    },
    twitter: {
      card: "summary",
      title: `${asset.name} (${asset.assetTag})`,
      description,
    },
  }
}

export default async function AssetDetailPage({ params }: AssetDetailPageProps) {
  const { id } = await params
  const asset = await getAssetByIdServer(id)

  if (!asset) {
    notFound()
  }

  return <AssetDetailContainer id={id} />
}
