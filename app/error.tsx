"use client"

export default function Error({ reset }: { reset: () => void }) {
  return (
    <main className="shell">
      <p className="eyebrow">Error</p>
      <h1>The radar is temporarily unavailable.</h1>
      <button className="sync-button" onClick={reset}>
        Try again
      </button>
    </main>
  )
}
