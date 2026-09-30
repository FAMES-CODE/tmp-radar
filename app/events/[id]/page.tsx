/* eslint-disable @next/next/no-img-element */
import Link from "next/link"
import { notFound } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { RichContent } from "@/components/rich-content"
import { getEvent } from "@/lib/truckersmp/events"
function date(value: string) {
  return (
    new Intl.DateTimeFormat("en-GB", {
      dateStyle: "full",
      timeStyle: "short",
      timeZone: "UTC",
    }).format(new Date(`${value.replace(" ", "T")}Z`)) + " UTC"
  )
}
export default async function EventPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const id = Number((await params).id)
  if (!Number.isInteger(id)) notFound()
  let event
  try {
    event = await getEvent(id)
  } catch {
    return (
      <main className="shell">
        <SiteHeader />
        <section className="notice error">
          Unable to load this event. It may no longer be available.
        </section>
      </main>
    )
  }
  return (
    <main className="shell">
      <SiteHeader />
      <Link className="back" href="/events">
        ← Events
      </Link>
      <section className="detail-hero">
        {event.banner && (
          <img className="event-banner" src={event.banner} alt="" />
        )}
        <p className="eyebrow">
          {event.event_type.name} · {event.game}
        </p>
        <h1>{event.name}</h1>
        <p className="lede">
          {date(event.start_at)} · {event.server.name}
        </p>
      </section>
      <section className="detail-grid">
        <article className="detail-card">
          <p>Meetup</p>
          <strong className="date-value">{date(event.meetup_at)}</strong>
        </article>
        <article className="detail-card">
          <p>Route</p>
          <strong className="date-value">
            {event.departure?.city ?? "Not provided"} →{" "}
            {event.arrive?.city ?? "Not provided"}
          </strong>
        </article>
      </section>
      <section className="information">
        <p className="eyebrow">EVENT DETAILS</p>
        <RichContent
          content={event.description ?? "No event description was provided."}
        />
        {event.user && (
          <p>
            Organized by {event.user.username}.{" "}
            {event.attendances &&
              `${event.attendances.confirmed} confirmed attendees.`}
          </p>
        )}
      </section>
    </main>
  )
}
