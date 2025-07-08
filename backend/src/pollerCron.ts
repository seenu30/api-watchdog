// backend/pollerCron.ts
import cron from "node-cron"
import { runPoller } from "./pollAPIs"

console.log("⏰ Starting API Watchdog Cron Job...")

// Run every 5 minutes
cron.schedule("*/5 * * * *", async () => {
  console.log(`🔁 Running poll at ${new Date().toLocaleTimeString()}`)
  await runPoller()
})

// Optionally run once on startup
runPoller()
