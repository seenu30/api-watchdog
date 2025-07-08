import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Badge } from "@/components/ui/badge"
import { Loader2, Clock, Zap, AlertTriangle } from "lucide-react"

type Snapshot = {
  id: string
  created_at: string
  status_code: number | null
  response_time_ms: number | null
  summary_diff: string | null
  status_change: string | null
}

export default function APIHistoryTimeline({ apiId }: { apiId: string }) {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSnapshots = async () => {
      const { data, error } = await supabase
        .from("api_snapshots")
        .select("id, created_at, status_code, response_time_ms, summary_diff, status_change")
        .eq("api_id", apiId)
        .order("created_at", { ascending: false })

      if (!error) setSnapshots(data)
      setLoading(false)
    }

    fetchSnapshots()
  }, [apiId])

  if (loading) {
    return (
      <div className="flex justify-center mt-6">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!snapshots.length) {
    return (
      <p className="text-muted-foreground text-center italic mt-6">
        No snapshot history available.
      </p>
    )
  }

  return (
    <div className="border-l border-gray-700 pl-4 space-y-6 mt-6">
      {snapshots.map((snap) => (
        <div key={snap.id} className="relative pl-4">
          <div className="absolute left-[-10px] top-1.5 w-3 h-3 bg-foreground rounded-full border-2 border-background" />

          <div className="space-y-1">
            <div className="text-xs text-gray-400 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {new Date(snap.created_at).toLocaleString()}
            </div>

            <div className="flex flex-wrap gap-2 text-sm">
              {/* ✅ Fixed styling for status code */}
              <span className="bg-gray-800 text-white text-xs px-2 py-0.5 rounded border border-gray-600">
                Status: {snap.status_code ?? "?"}
              </span>

              {snap.status_change && (
                <Badge variant="destructive" className="text-xs">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {snap.status_change}
                </Badge>
              )}

              {snap.response_time_ms !== null && (
                <span className="bg-gray-800 text-white text-xs px-2 py-0.5 rounded border border-gray-600 flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  {snap.response_time_ms} ms
                </span>
              )}
            </div>

            <div className="text-sm whitespace-pre-wrap text-gray-400 mt-1">
              {snap.summary_diff || "No summary available."}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
