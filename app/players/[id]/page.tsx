/* eslint-disable @next/next/no-img-element */
import Link from "next/link"
import { notFound } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { getPlayer } from "@/lib/truckersmp/players"
export default async function PlayerPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const id = Number((await params).id)
  if (!Number.isInteger(id)) notFound()
  let player
  try {
    player = await getPlayer(id)
  } catch {
    return (
      <main className="shell">
        <SiteHeader />
        <section className="notice error">
          Unable to load this player. Check the TruckersMP ID and try again.
        </section>
      </main>
    )
  }
  return (
    <main className="shell">
      <SiteHeader />
      <Link className="back" href="/search">
        ← Search
      </Link>
      <section className="detail-hero">
        {player.avatar && <img className="avatar" src={player.avatar} alt="" />}
        <p className="eyebrow">{player.groupName ?? "Player"}</p>
        <h1>{player.name}</h1>
        <p className="lede">TruckersMP player #{player.id}</p>
      </section>
      <section className="detail-grid">
        <article className="detail-card">
          <p>Joined</p>
          <strong className="date-value">
            {player.joinDate
              ? new Intl.DateTimeFormat("en-GB", {
                  dateStyle: "medium",
                }).format(new Date(`${player.joinDate.replace(" ", "T")}Z`))
              : "Not provided"}
          </strong>
        </article>
        <article className="detail-card">
          <p>VTC</p>
          <strong className="date-value">
            {player.vtc?.inVTC ? player.vtc.name : "No VTC"}
          </strong>
          {player.vtc?.inVTC && (
            <Link className="details-link" href={`/vtcs/${player.vtc.id}`}>
              View VTC →
            </Link>
          )}
        </article>
      </section>
    </main>
  )
}
