import { db } from "@/lib/db"
import {
  getBucketMinutes,
  getRangeWindow,
  type AnalyticsRange,
} from "./time-ranges"

export type HistoryPoint = {
  recordedAt: string
  playerCount: number
  occupancy: number | null
}
export type ServerStats = {
  peakPlayers: number
  minimumPlayers: number
  averagePlayers: number
  peakOccupancy: number | null
  averageOccupancy: number | null
  snapshotCount: number
}

type SnapshotRow = {
  recordedAt: Date
  playerCount: number
  maxPlayers: number | null
  isOnline: boolean | null
}

function round(value: number | null) {
  return value === null ? null : Math.round(value * 10) / 10
}

async function loadSnapshots(
  serverId: string,
  range: AnalyticsRange
): Promise<SnapshotRow[]> {
  const { start, end } = getRangeWindow(range)
  return db.serverSnapshot.findMany({
    where: { serverId, recordedAt: { gte: start, lte: end } },
    orderBy: { recordedAt: "asc" },
    select: {
      recordedAt: true,
      playerCount: true,
      maxPlayers: true,
      isOnline: true,
    },
  })
}

function occupancyOf(row: SnapshotRow): number | null {
  return row.isOnline && row.maxPlayers && row.maxPlayers > 0
    ? (row.playerCount / row.maxPlayers) * 100
    : null
}

function computeStats(rows: SnapshotRow[]): ServerStats {
  if (rows.length === 0) {
    return {
      peakPlayers: 0,
      minimumPlayers: 0,
      averagePlayers: 0,
      peakOccupancy: null,
      averageOccupancy: null,
      snapshotCount: 0,
    }
  }

  let peak = -Infinity
  let min = Infinity
  let total = 0
  let peakOcc = -Infinity
  let occTotal = 0
  let occCount = 0

  for (const row of rows) {
    if (row.playerCount > peak) peak = row.playerCount
    if (row.playerCount < min) min = row.playerCount
    total += row.playerCount

    const occ = occupancyOf(row)
    if (occ !== null) {
      if (occ > peakOcc) peakOcc = occ
      occTotal += occ
      occCount += 1
    }
  }

  return {
    peakPlayers: peak,
    minimumPlayers: min,
    averagePlayers: round(total / rows.length) ?? 0,
    peakOccupancy: occCount ? round(peakOcc) : null,
    averageOccupancy: occCount ? round(occTotal / occCount) : null,
    snapshotCount: rows.length,
  }
}

function computeHistory(
  rows: SnapshotRow[],
  range: AnalyticsRange
): HistoryPoint[] {
  const bucketMs = getBucketMinutes(range) * 60 * 1000
  const buckets = new Map<
    number,
    { total: number; count: number; occTotal: number; occCount: number }
  >()

  for (const row of rows) {
    const key = Math.floor(row.recordedAt.getTime() / bucketMs) * bucketMs
    const bucket = buckets.get(key) ?? {
      total: 0,
      count: 0,
      occTotal: 0,
      occCount: 0,
    }
    bucket.total += row.playerCount
    bucket.count += 1
    const occ = occupancyOf(row)
    if (occ !== null) {
      bucket.occTotal += occ
      bucket.occCount += 1
    }
    buckets.set(key, bucket)
  }

  return Array.from(buckets.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([key, bucket]) => ({
      recordedAt: new Date(key).toISOString(),
      playerCount: Math.round(bucket.total / bucket.count),
      occupancy: bucket.occCount
        ? round(bucket.occTotal / bucket.occCount)
        : null,
    }))
}

export async function getServerStats(
  serverId: string,
  range: AnalyticsRange
): Promise<ServerStats> {
  return computeStats(await loadSnapshots(serverId, range))
}

export async function getServerHistory(
  serverId: string,
  range: AnalyticsRange
): Promise<HistoryPoint[]> {
  return computeHistory(await loadSnapshots(serverId, range), range)
}

export async function getServerAnalytics(
  serverId: string,
  range: AnalyticsRange
) {
  const rows = await loadSnapshots(serverId, range)
  return { history: computeHistory(rows, range), stats: computeStats(rows) }
}

export async function getServerComparison(
  serverIds: string[],
  range: AnalyticsRange
) {
  const servers = await db.server.findMany({
    where: { id: { in: serverIds } },
    select: { id: true, externalId: true, name: true, playerCount: true },
  })
  return Promise.all(
    servers.map(async (server) => ({
      ...server,
      ...(await getServerAnalytics(server.id, range)),
    }))
  )
}
