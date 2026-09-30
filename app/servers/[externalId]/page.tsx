import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, CircleAlert, Network, Users } from "lucide-react"
import { db } from "@/lib/db"
import { ActivityChart } from "@/components/activity-chart"
export default async function ServerPage({
  params,
}: PageProps<"/servers/[externalId]">) {
  const { externalId } = await params
  const id = Number(externalId)
  if (!Number.isInteger(id)) notFound()
  let server
  try {
    server = await db.server.findUnique({ where: { externalId: id } })
  } catch {
    return (
      <main className="shell">
        <Link href="/" className="back">
          <ArrowLeft size={16} /> Dashboard
        </Link>
        <section className="notice error">
          <CircleAlert size={20} />
          <p>Could not connect to the database.</p>
        </section>
      </main>
    )
  }
  if (!server) notFound()
  const usage = server.maxPlayers
    ? Math.round((server.playerCount / server.maxPlayers) * 100)
    : 0
  return (
    <main className="shell detail">
      <Link href="/" className="back">
        <ArrowLeft size={16} /> Dashboard
      </Link>
      <Link href="/compare" className="compare-link">
        Compare servers →
      </Link>
      <section className="detail-hero">
        <p className="eyebrow">SERVER #{server.externalId}</p>
        <div className="detail-title">
          <div>
            <h1>{server.name}</h1>
            <p>
              {server.game ?? "Game not provided"} ·{" "}
              {server.ipAddress
                ? `${server.ipAddress}${server.port ? `:${server.port}` : ""}`
                : "Address not published"}
            </p>
          </div>
          <span className={server.isOnline ? "badge online" : "badge offline"}>
            {server.isOnline ? "Online" : "Offline"}
          </span>
        </div>
      </section>
      <ActivityChart externalId={server.externalId} />
      <section className="detail-grid">
        <article className="detail-card">
          <Users />
          <p>Active players</p>
          <strong>
            {server.playerCount.toLocaleString("en-GB")}{" "}
            <small>/ {server.maxPlayers.toLocaleString("en-GB")}</small>
          </strong>
          <div className="progress">
            <i style={{ width: `${Math.min(usage, 100)}%` }} />
          </div>
          <span>{usage}% capacity</span>
        </article>
        <article className="detail-card">
          <Network />
          <p>Last synchronization</p>
          <strong className="date-value">
            {new Intl.DateTimeFormat("en-GB", {
              dateStyle: "full",
              timeStyle: "short",
            }).format(server.lastSyncedAt)}
          </strong>
          <span>Data is sourced from the official TruckersMP Web API.</span>
        </article>
      </section>
      {server.information && (
        <section className="information">
          <p className="eyebrow">SERVER INFORMATION</p>
          <p>{server.information}</p>
        </section>
      )}
    </main>
  )
}
