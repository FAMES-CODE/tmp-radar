"use client"

import { useState, useTransition } from "react"
import { RefreshCw } from "lucide-react"
import { syncServersAction } from "@/app/actions"

export function SyncButton() {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  return (
    <span className="sync-control">
      <button
        className="sync-button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            setError(null)
            const result = await syncServersAction()
            if (!result.ok) setError(result.error)
          })
        }
      >
        <RefreshCw size={16} className={pending ? "spin" : ""} />
        {pending ? "Syncing…" : "Sync now"}
      </button>
      {error && (
        <span className="sync-error" role="alert">
          {error}
        </span>
      )}
    </span>
  )
}
