"use client"
import { useState } from "react"
import type { AnalyticsRange } from "@/lib/analytics/time-ranges"

type Server = {
  id: string
  externalId: number
  name: string
  playerCount: number
  history: { recordedAt: string; playerCount: number }[]
  stats: {
    peakPlayers: number
    averagePlayers: number
    averageOccupancy: number | null
    peakOccupancy: number | null
    snapshotCount: number
  }
}
const colors = ["#b4f11d", "#53c9ff", "#ffbd59", "#e887ff"]

function compareHref(selected: number[], range: AnalyticsRange) {
  const params = new URLSearchParams()
  params.set("range", range)
  for (const id of selected) params.append("servers", String(id))
  return `/compare?${params.toString()}`
}

export function ComparisonClient({
  servers,
  selectedIds,
  range,
}: {
  servers: Server[]
  selectedIds: number[]
  range: AnalyticsRange
}) {
  // The URL decides the selection, not "which servers happen to have history".
  const [selected, setSelected] = useState<number[]>(selectedIds)
  const visible = servers.filter((s) => selected.includes(s.externalId))

  // Shared scales so every server is plotted on the same time axis.
  let tMin = Infinity
  let tMax = -Infinity
  let max = 1
  for (const s of visible) {
    for (const p of s.history) {
      const t = Date.parse(p.recordedAt)
      if (t < tMin) tMin = t
      if (t > tMax) tMax = t
      if (p.playerCount > max) max = p.playerCount
    }
  }
  const span = tMax > tMin ? tMax - tMin : 1
  const canDraw = visible.some((s) => s.history.length >= 2)

  return (
    <>
      <form className="server-picker" action="/compare">
        <input type="hidden" name="range" value={range} />
        {servers.map((s) => {
          const isSelected = selected.includes(s.externalId)
          return (
            <label key={s.id}>
              <input
                type="checkbox"
                name="servers"
                value={s.externalId}
                checked={isSelected}
                disabled={!isSelected && selected.length === 4}
                onChange={(e) =>
                  setSelected(
                    e.target.checked
                      ? [...selected, s.externalId]
                      : selected.filter((x) => x !== s.externalId)
                  )
                }
              />{" "}
              {s.name}
            </label>
          )
        })}
        <button
          className="sync-button"
          type="submit"
          disabled={selected.length < 2}
        >
          Compare selected
        </button>
        <small>Select 2–4 servers.</small>
      </form>
      <div className="range-tabs compare-tabs">
        <a
          className={range === "24h" ? "active" : ""}
          href={compareHref(selected, "24h")}
        >
          24H
        </a>
        <a
          className={range === "7d" ? "active" : ""}
          href={compareHref(selected, "7d")}
        >
          7D
        </a>
      </div>
      {visible.length < 2 ? (
        <div className="chart-empty">
          Select at least two servers to compare historical activity.
        </div>
      ) : (
        <>
          <section className="analytics-card">
            <div className="table-heading">
              <div>
                <p className="eyebrow">HISTORICAL COMPARISON</p>
                <h2>
                  Players — Last {range === "24h" ? "24 hours" : "7 days"}
                </h2>
              </div>
              <div className="chart-legend">
                {visible.map((s, i) => (
                  <span key={s.id} style={{ color: colors[i] }}>
                    ● {s.name}
                    {s.history.length === 0 ? " (no data)" : ""}
                  </span>
                ))}
              </div>
            </div>
            {canDraw ? (
              <div className="chart-wrap">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none">
                  {visible.map((s, i) => {
                    if (s.history.length < 2) return null
                    const points = s.history
                      .map((p) => {
                        const x =
                          ((Date.parse(p.recordedAt) - tMin) / span) * 100
                        const y = 94 - (p.playerCount / max) * 84
                        return `${x},${y}`
                      })
                      .join(" ")
                    return (
                      <polyline
                        key={s.id}
                        points={points}
                        fill="none"
                        stroke={colors[i]}
                        strokeWidth="1.5"
                        vectorEffect="non-scaling-stroke"
                      />
                    )
                  })}
                </svg>
              </div>
            ) : (
              <div className="chart-empty">
                Not enough snapshots in this time range to draw a line yet (at
                least 2 per server are needed). Check the Snapshots column
                below.
              </div>
            )}
          </section>
          <section className="table-card comparison-table">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Server</th>
                    <th>Current</th>
                    <th>Peak</th>
                    <th>Average</th>
                    <th>Avg occupancy</th>
                    <th>Max occupancy</th>
                    <th>Snapshots</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((s) => (
                    <tr key={s.id}>
                      <td>{s.name}</td>
                      <td>{s.playerCount.toLocaleString()}</td>
                      <td>{s.stats.peakPlayers.toLocaleString()}</td>
                      <td>{s.stats.averagePlayers.toLocaleString()}</td>
                      <td>
                        {s.stats.averageOccupancy === null
                          ? "—"
                          : `${s.stats.averageOccupancy}%`}
                      </td>
                      <td>
                        {s.stats.peakOccupancy === null
                          ? "—"
                          : `${s.stats.peakOccupancy}%`}
                      </td>
                      <td>{s.stats.snapshotCount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </>
  )
}
