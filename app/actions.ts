"use server"

import { revalidatePath } from "next/cache"
import { syncServers } from "@/lib/sync-servers"

export async function syncServersAction() {
  try {
    await syncServers()
    revalidatePath("/")
    return { ok: true as const }
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "Synchronization failed.",
    }
  }
}
