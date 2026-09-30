/* eslint-disable @next/next/no-img-element */
import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { getEvents, type TruckersMpEvent } from "@/lib/truckersmp/events"
export const dynamic = "force-dynamic"
function date(value: string) {
  return (
    new Intl.DateTimeFormat("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "UTC",
    }).format(new Date(`${value.replace(" ", "T")}Z`)) + " UTC"
  )
}
export default async function EventsPage() {
  let events: TruckersMpEvent[] = []
  let failed = false
  try {
    const data = await getEvents()
    const seen = new Set<number>()
    events = Object.values(data)
      .flatMap((group) => group ?? [])
      .filter((e) => !seen.has(e.id) && !!seen.add(e.id))
  } catch (error) {
    console.error("[events] failed", error)
    failed = true
  }
  return (
    <main className="shell">
      <SiteHeader />
      <section className="detail-hero">
        <p className="eyebrow">TRUCKERSMP EVENTS</p>
        <h1>Plan your next convoy.</h1>
        <p className="lede">
          Featured and upcoming community events from TruckersMP.
        </p>
      </section>
      {failed ? (
        <section className="notice error">
          Unable to load events. TruckersMP may be temporarily unavailable;
          please try again.
        </section>
      ) : events.length === 0 ? (
        <section className="empty">
          <h2>No events available</h2>
          <p>TruckersMP did not return any events right now.</p>
        </section>
      ) : (
        <section className="directory-grid">
          {events.map((event) => (
            <Link
              href={`/events/${event.id}`}
              className="directory-card"
              key={event.id}
            >
              {event.banner && <img src={event.banner} alt="" />}
              <p className="eyebrow">
                {event.event_type.name} · {event.game}
              </p>
              <h2>{event.name}</h2>
              <p>{date(event.start_at)}</p>
              <span>
                {event.server.name} · {event.language}
              </span>
            </Link>
          ))}
        </section>
      )}
    </main>
  )
}
