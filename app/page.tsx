import Link from "next/link"
import { Activity, CircleAlert, Database, Server, Users } from "lucide-react"
import { SyncButton } from "@/components/sync-button"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

type DashboardServer = {
  id: string
  externalId: number
  name: string
  ipAddress: string | null
  port: number | null
  game: string | null
  playerCount: number
  maxPlayers: number
  isOnline: boolean
  lastSyncedAt: Date
}
function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date)
}
export default async function Page() {
  let servers: DashboardServer[] = []
  let databaseError = false
  try {
    servers = (await db.server.findMany({
      orderBy: [{ isOnline: "desc" }, { playerCount: "desc" }],
    })) as DashboardServer[]
  } catch {
    databaseError = true
  }
  const online = servers.filter((server) => server.isOnline)
  const players = online.reduce((sum, server) => sum + server.playerCount, 0)
  const capacity = online.reduce((sum, server) => sum + server.maxPlayers, 0)
  const lastSyncedAt = servers.reduce<Date | undefined>(
    (latest, server) =>
      !latest || server.lastSyncedAt > latest ? server.lastSyncedAt : latest,
    undefined
  )
  return (
    <main className="shell">
      <header className="topbar">
        <Link className="brand" href="/">
          <span className="brand-mark">R</span>
          <span>TMP-RADAR</span>
        </Link>
        <SyncButton />
      </header>
      <section className="hero">
        <div>
          <p className="eyebrow">
            <Activity size={14} /> LIVE MONITORING
          </p>
          <h1>
            The TruckersMP network,
            <br />
            <em>at a glance.</em>
          </h1>
          <p className="lede">
            An operational server view, ready to become your traffic analytics
            control centre.
          </p>
        </div>
        <div className="sync-status">
          <span className={lastSyncedAt ? "status-dot" : "status-dot muted"} />
          {lastSyncedAt
            ? `Synced ${formatDate(lastSyncedAt)}`
            : "Waiting for data"}
        </div>
      </section>
      {databaseError ? (
        <section className="notice error">
          <CircleAlert size={20} />
          <div>
            <strong>Database unavailable</strong>
            <p>
              Add <code>DATABASE_URL</code> and run{" "}
              <code>npx prisma migrate deploy</code>. The dashboard will fill
              after the first successful sync.
            </p>
          </div>
        </section>
      ) : (
        <>
          <section className="metrics">
            <Metric
              icon={<Server />}
              label="Servers online"
              value={`${online.length} / ${servers.length}`}
            />
            <Metric
              icon={<Users />}
              label="Players online"
              value={players.toLocaleString("en-GB")}
            />
            <Metric
              icon={<Activity />}
              label="Capacity in use"
              value={
                capacity ? `${Math.round((players / capacity) * 100)}%` : "—"
              }
            />
          </section>
          {servers.length === 0 ? (
            <section className="empty">
              <Database size={28} />
              <h2>Your radar is ready.</h2>
              <p>
                The database does not contain any measurements yet. Run your
                first sync to import TruckersMP servers.
              </p>
              <SyncButton />
            </section>
          ) : (
            <section className="table-card">
              <div className="table-heading">
                <div>
                  <p className="eyebrow">SERVER FLEET</p>
                  <h2>Current status</h2>
                </div>
                <span>{servers.length} tracked servers</span>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Server</th>
                      <th>Game</th>
                      <th>Status</th>
                      <th>Players</th>
                      <th>Last sync</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {servers.map((server) => (
                      <tr key={server.id}>
                        <td>
                          <Link
                            href={`/servers/${server.externalId}`}
                            className="server-name"
                          >
                            {server.name}
                          </Link>
                          <span className="endpoint">
                            {server.ipAddress
                              ? `${server.ipAddress}${server.port ? `:${server.port}` : ""}`
                              : "Address not published"}
                          </span>
                        </td>
                        <td>{server.game ?? "—"}</td>
                        <td>
                          <span
                            className={
                              server.isOnline ? "badge online" : "badge offline"
                            }
                          >
                            {server.isOnline ? "Online" : "Offline"}
                          </span>
                        </td>
                        <td>
                          <strong>
                            {server.playerCount.toLocaleString("en-GB")}
                          </strong>
                          <span className="capacity">
                            {" "}
                            / {server.maxPlayers.toLocaleString("en-GB")}
                          </span>
                        </td>
                        <td className="muted-text">
                          {formatDate(server.lastSyncedAt)}
                        </td>
                        <td>
                          <Link
                            className="details-link"
                            href={`/servers/${server.externalId}`}
                          >
                            Details →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </>
      )}
    </main>
  )
}
function Metric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <article className="metric">
      <span>{icon}</span>
      <p>{label}</p>
      <strong>{value}</strong>
    </article>
  )
}
