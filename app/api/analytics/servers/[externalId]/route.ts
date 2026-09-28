import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { getServerAnalytics } from "@/lib/analytics/server-analytics"
import { isAnalyticsRange } from "@/lib/analytics/time-ranges"

export const dynamic = "force-dynamic"
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ externalId: string }> }
) {
  const { externalId } = await context.params
  const id = Number(externalId)
  const range = request.nextUrl.searchParams.get("range")
  if (!Number.isInteger(id) || !isAnalyticsRange(range))
    return Response.json(
      { error: "Invalid server or analytics range." },
      { status: 400 }
    )
  try {
    const server = await db.server.findUnique({
      where: { externalId: id },
      select: { id: true },
    })
    if (!server)
      return Response.json({ error: "Server not found." }, { status: 404 })
    return Response.json(await getServerAnalytics(server.id, range))
  } catch {
    return Response.json(
      { error: "Historical analytics are temporarily unavailable." },
      { status: 503 }
    )
  }
}
