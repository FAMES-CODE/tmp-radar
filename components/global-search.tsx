"use client"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"

type Result = {
  vtcs: {
    id: number
    name: string
    tag?: string | null
    members_count: number
  }[]
  players: { id: number; name: string; groupName?: string }[]
}
export function GlobalSearch() {
  const [query, setQuery] = useState("")
  const [state, setState] = useState<"idle" | "loading" | "error" | "done">(
    "idle"
  )
  const [results, setResults] = useState<Result>({ vtcs: [], players: [] })
  const request = useRef(0)
  useEffect(() => {
    const q = query.trim()
    if (q.length < 2) return
    const id = ++request.current
    const timer = setTimeout(async () => {
      setState("loading")
      try {
        const r = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
        if (!r.ok) throw new Error()
        const data = (await r.json()) as Result
        if (id === request.current) {
          setResults(data)
          setState("done")
        }
      } catch {
        if (id === request.current) setState("error")
      }
    }, 320)
    return () => clearTimeout(timer)
  }, [query])
  return (
    <div className="search-panel">
      <input
        autoFocus
        value={query}
        onChange={(e) => {
          const value = e.target.value
          setQuery(value)
          if (value.trim().length < 2) {
            setState("idle")
            setResults({ vtcs: [], players: [] })
          }
        }}
        placeholder="Search VTCs or enter a player ID…"
        aria-label="Search TruckersMP"
      />
      {state === "loading" && (
        <p className="search-status">Searching TruckersMP…</p>
      )}
      {state === "error" && (
        <p className="notice compact">
          Search is temporarily unavailable. Please try again.
        </p>
      )}
      {state === "idle" && (
        <p className="search-status">
          Enter at least 2 characters. Player lookups use a TruckersMP numeric
          ID.
        </p>
      )}
      {state === "done" && (
        <div className="search-results">
          {results.vtcs.length === 0 && results.players.length === 0 ? (
            <p className="search-status">No matching VTCs or players found.</p>
          ) : (
            <>
              {results.vtcs.length > 0 && (
                <section>
                  <p className="eyebrow">VTCs</p>
                  {results.vtcs.map((v) => (
                    <Link
                      className="search-result"
                      href={`/vtcs/${v.id}`}
                      key={v.id}
                    >
                      <b>🚛 {v.name}</b>
                      <span>
                        {v.tag ?? "VTC"} · {v.members_count} members
                      </span>
                    </Link>
                  ))}
                </section>
              )}
              {results.players.length > 0 && (
                <section>
                  <p className="eyebrow">Players</p>
                  {results.players.map((p) => (
                    <Link
                      className="search-result"
                      href={`/players/${p.id}`}
                      key={p.id}
                    >
                      <b>👤 {p.name}</b>
                      <span>{p.groupName ?? "Player"}</span>
                    </Link>
                  ))}
                </section>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
