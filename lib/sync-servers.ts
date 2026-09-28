import { db } from "@/lib/db"
import { fetchTruckersMpServers } from "@/lib/truckersmp"

export async function syncServers() {
  const servers = await fetchTruckersMpServers()
  const syncedAt = new Date()

  const recordedAt = new Date(Math.floor(syncedAt.getTime() / 300_000) * 300_000)
  await db.$transaction(
    servers.map((server) =>
      db.server.upsert({
        where: { externalId: server.id },
        create: {
          externalId: server.id,
          name: server.name,
          ipAddress: server.ip ?? null,
          port: server.port ?? null,
          game: server.game ?? null,
          playerCount: server.players,
          maxPlayers: server.maxplayers,
          isOnline: server.online,
          information: server.information ?? null,
          lastSyncedAt: syncedAt,
          snapshots: { createMany: { data: [{ playerCount: server.players, maxPlayers: server.maxplayers, isOnline: server.online, recordedAt }], skipDuplicates: true } },
        },
        update: {
          name: server.name,
          ipAddress: server.ip ?? null,
          port: server.port ?? null,
          game: server.game ?? null,
          playerCount: server.players,
          maxPlayers: server.maxplayers,
          isOnline: server.online,
          information: server.information ?? null,
          lastSyncedAt: syncedAt,
          snapshots: { createMany: { data: [{ playerCount: server.players, maxPlayers: server.maxplayers, isOnline: server.online, recordedAt }], skipDuplicates: true } },
        },
      })
    )
  )
  return { count: servers.length, syncedAt }
}
