import { getPlayer } from "@/lib/truckersmp/players"
import { getVtcDirectory } from "@/lib/truckersmp/vtcs"
export const dynamic = "force-dynamic"
export async function GET(request: Request) {
  const q =
    new URL(request.url).searchParams.get("q")?.trim().toLowerCase() ?? ""
  if (q.length < 2) return Response.json({ vtcs: [], players: [] })
  try {
    const vtcs = (await getVtcDirectory())
      .filter((v) => `${v.name} ${v.tag ?? ""}`.toLowerCase().includes(q))
      .slice(0, 6)
    const players = /^\d+$/.test(q) ? [await getPlayer(Number(q))] : []
    return Response.json({ vtcs, players })
  } catch (error) {
    console.error("[search] failed", error)
    return Response.json(
      { error: "Search temporarily unavailable." },
      { status: 503 }
    )
  }
}
