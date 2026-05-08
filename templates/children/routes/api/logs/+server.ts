import { getActivityLogs } from "$lib/db/log"
import { json } from "@sveltejs/kit"

export async function GET({ url }) {
  const logs = await getActivityLogs()
  return json(logs)
}
