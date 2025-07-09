import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"

interface Snapshot {
  id: string
  summary_diff: string | null
  created_at: string
}

type WatchedAPI = {
  id: string
  name: string
  url: string
  method: string
  api_snapshots: Snapshot[]
  dismissed_alert?: {
    snapshot_id: string
  }[]
}

export default function APIList({
  userId,
  onAlertCountChange,
}: {
  userId: string
  onAlertCountChange: (count: number) => void
}) {
  const [apis, setApis] = useState<WatchedAPI[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const fetchAPIs = async () => {
    setLoading(true)

    const { data, error } = await supabase
      .from("watched_apis")
      .select(`
        id,
        name,
        url,
        method,
        api_snapshots (
          id,
          summary_diff,
          created_at
        ),
        dismissed_alert: dismissed_alerts (
          snapshot_id
        )
      `)
      .eq("user_id", userId)
      .order("id", { ascending: false })

    if (!error && data) {
      const formatted: WatchedAPI[] = data.map((api: any) => ({
        ...api,
        api_snapshots: (api.api_snapshots || []).sort(
          (a: Snapshot, b: Snapshot) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ),
        dismissed_alert: api.dismissed_alert || []
      }))


      setApis(formatted)

      const alertCount = formatted.filter(api => {
        const [latest, previous] = api.api_snapshots
        const latestDiff = latest?.summary_diff?.toLowerCase().trim() || ""
        const prevDiff = previous?.summary_diff?.toLowerCase().trim() || ""
        const dismissedSnapshotIds = api.dismissed_alert?.map(d => d.snapshot_id) || []

        const noChangePhrases = [
          "no major changes",
          "no changes",
          "no significant changes",
          "first snapshot – no previous version."
        ]

        return (
          latestDiff.length > 0 &&
          !noChangePhrases.some(p => latestDiff.includes(p)) &&
          latestDiff !== prevDiff &&
          !dismissedSnapshotIds.includes(latest?.id || "")
        )
      }).length

      onAlertCountChange(alertCount)
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchAPIs()
  }, [userId, onAlertCountChange])

  const handleDismiss = async (apiId: string, snapshotTime: string) => {
    const { data: existing } = await supabase
      .from("dismissed_alerts")
      .select("id")
      .eq("api_id", apiId)
      .eq("snapshot_created_at", snapshotTime)
      .maybeSingle()

    if (!existing) {
      const { error } = await supabase.from("dismissed_alerts").insert({
        api_id: apiId,
        snapshot_created_at: snapshotTime
      })

      if (!error) {
        await fetchAPIs()
      }
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center mt-8">
        <Loader2 className="animate-spin w-6 h-6 text-muted-foreground" />
      </div>
    )
  }

  if (apis.length === 0) {
    return (
      <div className="text-muted-foreground text-center mt-8">
        You haven’t added any APIs yet.
      </div>
    )
  }

  return (
    <div className="space-y-4 mt-6">
      {apis.map(api => {
        const [latest, previous] = api.api_snapshots
        const latestDiff = latest?.summary_diff?.toLowerCase().trim() || ""
        const prevDiff = previous?.summary_diff?.toLowerCase().trim() || ""

        const dismissedSnapshotIds = api.dismissed_alert?.map(d => d.snapshot_id) || []

        const showAlert =
          latestDiff.length > 0 &&
          !["no major changes", "no changes", "no significant changes", "first snapshot – no previous version."]
            .some(p => latestDiff.includes(p)) &&
          latestDiff !== prevDiff &&
          !dismissedSnapshotIds.includes(latest?.id || "")

        console.log(latestDiff)
        console.log(prevDiff)
        console.log(dismissedSnapshotIds)

        return (
          <Card
            key={api.id}
            className="p-4 bg-muted flex flex-col gap-1 text-foreground"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{api.name}</span>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="uppercase">
                  {api.method}
                </Badge>
                {showAlert && latest && (
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Change Detected
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs underline text-muted-foreground"
                      onClick={() => handleDismiss(api.id, latest.created_at)}
                    >
                      Dismiss
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <p className="text-sm break-all text-muted-foreground">{api.url}</p>

            <div className="mt-2 flex justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate(`/dashboard/api/${api.id}`)}
              >
                View Details
              </Button>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
