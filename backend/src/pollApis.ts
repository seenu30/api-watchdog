import "dotenv/config"
import { createClient } from "@supabase/supabase-js"
import axios from "axios"
import { OpenAI } from "openai"

// Initialize Supabase & OpenAI
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

// Axios: track response time
axios.interceptors.request.use(config => {
  (config as any).metadata = { startTime: new Date() }
  return config
})

axios.interceptors.response.use(response => {
  const start = (response.config as any).metadata.startTime
  const end = new Date()
  const duration = end.getTime() - start.getTime()
  response.headers["x-response-time"] = duration.toString()
  return response
})

function sleep(ms: number) {
  return new Promise(res => setTimeout(res, ms))
}

async function fetchWithRetry(config: any, retries = 2): Promise<any> {
  try {
    return await axios(config)
  } catch (err) {
    if (retries > 0) {
      const delay = 1000 * Math.pow(2, 2 - retries) // 1s → 2s
      console.warn(`⚠️ Retry in ${delay}ms...`)
      await sleep(delay)
      return fetchWithRetry(config, retries - 1)
    }
    throw err
  }
}

export async function runPoller() {
  console.log("📡 Polling watched APIs...")

  const { data: apis, error } = await supabase
    .from("watched_apis")
    .select("*")

  if (error) {
    console.error("❌ Error fetching APIs:", error.message)
    return
  }

  for (const api of apis) {
    console.log(`🔍 Checking ${api.name} (${api.url})`)

    try {
      const response = await fetchWithRetry({
        url: api.url,
        method: api.method || "GET",
        headers: api.headers || {},
        data: api.body || undefined,
        timeout: 8000
      })

      const newJson = response.data
      const statusCode = response.status
      const responseTime = parseInt(response.headers["x-response-time"] || "0")

      // Fetch previous snapshot
      const { data: lastSnap } = await supabase
        .from("api_snapshots")
        .select("response_json, status_code")
        .eq("api_id", api.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()

      let summaryDiff = "First snapshot – no previous version."
      let statusChange: string | null = null
      let oldResponseJson = null

      if (lastSnap) {
        oldResponseJson = lastSnap.response_json

        // Detect status code change
        if (lastSnap.status_code && lastSnap.status_code !== statusCode) {
          statusChange = `${lastSnap.status_code} → ${statusCode}`
        }

        // Prepare prompt for diffing (currently skipped)
        const prompt = `
Compare these two API responses and describe only meaningful changes (structure, key names, types, major values). Ignore minor numerical changes.

OLD:
${JSON.stringify(oldResponseJson, null, 2)}

NEW:
${JSON.stringify(newJson, null, 2)}

Respond with a plain-language summary of the changes.`

        // Optional OpenAI logic
        // const chat = await openai.chat.completions.create({
        //   model: "gpt-3.5-turbo",
        //   messages: [{ role: "user", content: prompt }]
        // })
        // summaryDiff = chat.choices[0].message.content || "No major changes"

        summaryDiff = "panda"
      }

      // Insert snapshot with all fields
      const { error: insertError } = await supabase.from("api_snapshots").insert({
        api_id: api.id,
        response_json: newJson,
        old_response_json: oldResponseJson,
        summary_diff: summaryDiff,
        created_at: new Date().toISOString(),
        status_code: statusCode,
        status_change: statusChange,
        response_time_ms: responseTime
      })

      if (insertError) {
        console.error("❌ Failed to insert snapshot:", insertError.message)
      } else {
        console.log("✅ Snapshot saved.")
      }

    } catch (err: any) {
      console.error(`❌ Error fetching ${api.url}:`, err.message)
    }
  }

  console.log("✅ Done.")
}
