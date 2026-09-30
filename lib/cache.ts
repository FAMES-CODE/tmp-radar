type Entry<T> = { value: T; expiresAt: number }

// Process-local on purpose: it needs no new service for this deployment. The
// API service remains the only place that knows how keys are formed.
const entries = new Map<string, Entry<unknown>>()

export async function cached<T>(
  key: string,
  ttlMs: number,
  load: () => Promise<T>
) {
  const current = entries.get(key) as Entry<T> | undefined
  if (current && current.expiresAt > Date.now()) return current.value
  const value = await load()
  entries.set(key, { value, expiresAt: Date.now() + ttlMs })
  return value
}

export function invalidateCache(key: string) {
  entries.delete(key)
}
