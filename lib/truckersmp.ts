import { TruckersMpApiError } from "@/lib/truckersmp/client"

const serversUrl = process.env.TRUCKERSMP_SERVERS_URL

export type TruckersMpServer = {
  id: number
  name: string
  ip?: string
  port?: number
  game?: string
  players: number
  maxplayers: number
  online: boolean
  information?: string
}

type ServersPayload = {
  error?: boolean | "false" | "true"
  response?: TruckersMpServer[] | { servers?: TruckersMpServer[] }
  descriptor?: string
}

export async function fetchTruckersMpServers() {
  let response: Response
  try {
    response = await fetch(serversUrl, {
      cache: "no-store",
      headers: {
        "User-Agent": "TMP-RADAR/3.0 (+https://truckersmp.com)",
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(10_000),
    })
  } catch {
    throw new TruckersMpApiError(
      "TruckersMP is not responding. Please try again in a moment."
    )
  }
  if (!response.ok)
    throw new TruckersMpApiError(
      `TruckersMP returned status ${response.status}.`
    )

  const payload = (await response.json()) as ServersPayload
  const servers = Array.isArray(payload.response)
    ? payload.response
    : payload.response?.servers
  if (
    payload.error === true ||
    payload.error === "true" ||
    !Array.isArray(servers)
  ) {
    throw new TruckersMpApiError(
      payload.descriptor ?? "TruckersMP returned an invalid server response."
    )
  }
  return servers
}
