import { cached } from "@/lib/cache"

const baseUrl = process.env.TRUCKERSMP_SERVERS_URL
const userAgent = "TMP-RADAR/3.0 (+https://truckersmp.com)"
export class TruckersMpApiError extends Error {}

export async function apiGet<T>(path: string, ttlMs?: number): Promise<T> {
  const load = async () => {
    let response: Response
    try {
      response = await fetch(`${baseUrl}${path}`, {
        headers: { "User-Agent": userAgent, Accept: "application/json" },
        cache: "no-store",
        signal: AbortSignal.timeout(10_000),
      })
    } catch {
      throw new TruckersMpApiError(
        "TruckersMP is not responding. Please try again shortly."
      )
    }
    if (!response.ok)
      throw new TruckersMpApiError(
        `TruckersMP returned status ${response.status}.`
      )
    const payload = (await response.json()) as {
      error?: boolean
      descriptor?: string
      response?: T
    }
    if (payload.error || payload.response === undefined)
      throw new TruckersMpApiError(
        payload.descriptor ?? "TruckersMP returned an invalid response."
      )
    return payload.response
  }
  return ttlMs ? cached(`truckersmp:${path}`, ttlMs, load) : load()
}
