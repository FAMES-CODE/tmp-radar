import Link from "next/link"
import { ComparisonClient } from "@/components/comparison-client"
import { db } from "@/lib/db"
import { getServerComparison } from "@/lib/analytics/server-analytics"
import {
  isAnalyticsRange,
  type AnalyticsRange,
} from "@/lib/analytics/time-ranges"

export const dynamic = "force-dynamic"
export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{
    range?: string | string[]
    servers?: string | string[]
  }>
}) {
  const query = await searchParams
  const requestedRange = typeof query.range === "string" ? query.range : null
  const range: AnalyticsRange = isAnalyticsRange(requestedRange)
    ? requestedRange
    : "24h"
  const raw = query.servers
  // Number("") is 0, so drop anything that isn't a positive integer, and dedupe.
  const ids = Array.from(
    new Set(
      (Array.isArray(raw) ? raw : raw ? [raw] : [])
        .map(Number)
        .filter((n) => Number.isInteger(n) && n > 0)
    )
  ).slice(0, 4)
  const data = await loadComparison(ids, range)
  if (!data)
    return (
      <main className="shell">
        <Link href="/" className="back">
          ← Dashboard
        </Link>
        <section className="notice error">
          Historical comparison is temporarily unavailable. Please try again
          shortly.
        </section>
      </main>
    )
  return (
    <main className="shell">
      <Link href="/" className="back">
        ← Dashboard
      </Link>
      <section className="detail-hero">
        <p className="eyebrow">ANALYTICS</p>
        <h1>Compare servers</h1>
        <p className="lede">
          Compare historical player activity using snapshots collected by
          TMP-RADAR.
        </p>
      </section>
      <ComparisonClient
        key={`${range}:${data.selectedIds.join(",")}`}
        servers={data.servers}
        selectedIds={data.selectedIds}
        range={range}
      />
    </main>
  )
}

async function loadComparison(ids: number[], range: AnalyticsRange) {
  try {
    const all = await db.server.findMany({
      orderBy: { playerCount: "desc" },
      take: 30,
      select: { id: true, externalId: true, name: true, playerCount: true },
    })
    // Selection comes from the URL; fall back to the top 2 servers when the
    // URL has no (valid) servers.
    const requested = all.filter((s) => ids.includes(s.externalId))
    const selected = requested.length ? requested : all.slice(0, 2)
    const details = await getServerComparison(
      selected.map((s) => s.id),
      range
    )
    const servers = all.map(
      (s) =>
        details.find((d) => d.id === s.id) ?? {
          ...s,
          history: [],
          stats: {
            peakPlayers: 0,
            minimumPlayers: 0,
            averagePlayers: 0,
            averageOccupancy: null,
            peakOccupancy: null,
            snapshotCount: 0,
          },
        }
    )
    return { servers, selectedIds: selected.map((s) => s.externalId) }
  } catch (error) {
    console.error("[compare] failed to load comparison", error)
    return null
  }
}
