import { apiGet } from "./client"

export type Vtc = {
  id: number
  name: string
  owner_id: number
  owner_username: string
  slogan?: string | null
  tag?: string | null
  logo?: string | null
  cover?: string | null
  information?: string | null
  rules?: string | null
  requirements?: string | null
  website?: string | null
  members_count: number
  recruitment: string
  language: string
  languages: string[]
  verified: boolean
  created: string
}
type VtcDiscovery = { recent?: Vtc[]; featured?: Vtc[]; featured_cover?: Vtc[] }
export async function getVtcDirectory() {
  const data = await apiGet<VtcDiscovery>("/vtc", 20 * 60_000)
  const seen = new Set<number>()
  return Object.values(data)
    .flat()
    .filter((vtc) => !seen.has(vtc.id) && !!seen.add(vtc.id))
}
export const getVtc = (id: number) => apiGet<Vtc>(`/vtc/${id}`, 20 * 60_000)
