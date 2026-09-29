"use client"

import { useEffect, useMemo, useState } from "react"
import type { AnalyticsRange } from "@/lib/analytics/time-ranges"

type Point = { recordedAt: string; playerCount: number }
type Analytics = {
  history: Point[]
  stats: {
    peakPlayers: number
    minimumPlayers: number
    averagePlayers: number
    peakOccupancy: number | null
    averageOccupancy: number | null
    snapshotCount: number
  }
}
function label(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date))
}

export function ActivityChart({ externalId }: { externalId: number }) {
  const [range, setRange] = useState<AnalyticsRange>("24h")
  const [data, setData] = useState<Analytics | null>(null)
  const [error, setError] = useState(false)
  useEffect(() => {
    let live = true
    fetch(`/api/analytics/servers/${externalId}?range=${range}`)
      .then(async (r) => {
        if (!r.ok) throw new Error()
        return r.json()
      })
      .then((value) => {
        if (live) {
          setData(value)
          setError(false)
        }
      })
      .catch(() => live && setError(true))
    return () => {
      live = false
    }
  }, [externalId, range])
  const polyline = useMemo(() => {
    const points = data?.history ?? []
    if (points.length < 2) return ""
    const max = Math.max(...points.map((p) => p.playerCount), 1)
    return points
      .map(
        (p, i) =>
          `${(i / (points.length - 1)) * 100},${94 - (p.playerCount / max) * 84}`
      )
      .join(" ")
  }, [data])
  return (
    <section className="analytics-card">
      <div className="table-heading">
        <div>
          <p className="eyebrow">HISTORICAL DATA</p>
          <h2>
            Player activity — Last {range === "24h" ? "24 hours" : "7 days"}
          </h2>
        </div>
        <div className="range-tabs">
          {(["24h", "7d"] as const).map((item) => (
            <button
              key={item}
              className={range === item ? "active" : ""}
              onClick={() => setRange(item)}
            >
              {item.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      {error ? (
        <div className="chart-empty">
          Historical analytics are temporarily unavailable.
        </div>
      ) : !data || data.history.length < 2 ? (
        <div className="chart-empty">
          {data ? (
            <>
              Not enough historical data yet.
              <br />
              <span>
                TMP-RADAR is collecting snapshots every 5 minutes. Check back
                later to see activity.
              </span>
            </>
          ) : (
            "Loading historical activity…"
          )}
        </div>
      ) : (
        <>
          <div className="chart-wrap">
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              role="img"
              aria-label="Historical player activity"
            >
              <polyline
                points={polyline}
                fill="none"
                stroke="#b4f11d"
                strokeWidth="1.5"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>
          <div className="chart-axis">
            <span>{label(data.history[0].recordedAt)}</span>
            <span>{label(data.history.at(-1)!.recordedAt)}</span>
          </div>
          <div className="stat-strip">
            <span>
              <b>{data.stats.peakPlayers.toLocaleString()}</b> peak
            </span>
            <span>
              <b>{data.stats.averagePlayers.toLocaleString()}</b> average
            </span>
            <span>
              <b>{data.stats.minimumPlayers.toLocaleString()}</b> minimum
            </span>
            <span>
              <b>
                {data.stats.averageOccupancy ?? "—"}
                {data.stats.averageOccupancy !== null && "%"}
              </b>{" "}
              avg occupancy
            </span>
            <span>
              <b>{data.stats.snapshotCount}</b> snapshots
            </span>
          </div>
        </>
      )}
    </section>
  )
}
