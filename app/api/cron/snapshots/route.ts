import { syncServers } from "@/lib/sync-servers"

export const dynamic = "force-dynamic"
export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`)
    return new Response("Unauthorized", { status: 401 })
  try {
    return Response.json({ ok: true, ...(await syncServers()) })
  } catch (error) {
    console.error("Snapshot synchronization failed", error)
    return Response.json(
      { ok: false, error: "Snapshot synchronization failed." },
      { status: 503 }
    )
  }
}
