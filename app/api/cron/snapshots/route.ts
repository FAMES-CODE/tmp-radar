import { syncServers } from "@/lib/sync-servers"

export const dynamic = "force-dynamic"
async function run(request: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`)
    return new Response("Unauthorized", { status: 401 })
  try {
    const result = await syncServers()
    console.info("[cron] server synchronization succeeded", result)
    return Response.json({ ok: true, ...result })
  } catch (error) {
    console.error("Snapshot synchronization failed", error)
    return Response.json(
      { ok: false, error: "Snapshot synchronization failed." },
      { status: 503 }
    )
  }
}
export async function GET(request: Request) {
  return run(request)
}
export async function POST(request: Request) {
  return run(request)
}
