import { apiGet } from "./client"

export type TruckersMpEvent = {
  id: number
  name: string
  slug: string
  game: string
  language: string
  event_type: { key: string; name: string }
  server: { id: number; name: string }
  departure?: { location?: string; city?: string }
  arrive?: { location?: string; city?: string }
  meetup_at: string
  start_at: string
  banner?: string
  description?: string
  user?: { id: number; username: string }
  attendances?: { confirmed: number; unsure: number; vtcs: number }
}
export type EventsResponse = {
  featured?: TruckersMpEvent[]
  upcoming?: TruckersMpEvent[]
  [key: string]: TruckersMpEvent[] | undefined
}
export const getEvents = () => apiGet<EventsResponse>("/events", 10 * 60_000)
export const getEvent = (id: number) =>
  apiGet<TruckersMpEvent>(`/events/${id}`, 10 * 60_000)
