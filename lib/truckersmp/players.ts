import { apiGet } from "./client"
export type Player = {
  id: number
  name: string
  avatar?: string
  joinDate?: string
  groupName?: string
  groupColor?: string
  banned?: boolean
  bansCount?: number
  vtc?: { id: number; name: string; tag: string; inVTC: boolean }
}
export const getPlayer = (id: number) =>
  apiGet<Player>(`/player/${id}`, 2 * 60_000)
