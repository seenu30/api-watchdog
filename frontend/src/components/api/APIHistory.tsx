import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ClipboardCopy } from "lucide-react"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter/dist/cjs"
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism"

type Snapshot = {
  id: string
  summary_diff: string
  response_json: any
  old_response_json?: any // optional
  created_at: string
  status_code?: number
}

export default function APIHistory({ apiId }: { apiId: string }) {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [filter, setFilter] = useState<"all" | "2xx" | "4xx">("all")

  useEffect(() => {
    const fetchSnapshots = async () => {
      const { data, error } = await supabase
        .from("api_snapshots")
        .select("*")
        .eq("api_id", apiId)
        .order("created_at", { ascending: false })

      if (!error) setSnapshots(data)
      setLoading(false)
    }

    fetchSnapshots()
  }, [apiId])

  const filtered = snapshots.filter(snap => {
    if (filter === "2xx") return snap.status_code && snap.status_code < 300
    if (filter === "4xx") return snap.status_code && snap.status_code >= 400
    return true
  })

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert("Copied!")
  }

  if (loading) return <p className="text-gray-400">Loading history...</p>
  if (!snapshots.length) return <p className="italic text-gray-500">No history found.</p>

  return (
    <div className="space-y-6">
      {/* 🔍 Filter Controls */}
      <div className="flex gap-4 text-sm">
        <Button
          variant={filter === "all" ? "default" : "ghost"}
          onClick={() => setFilter("all")}
        >
          All
        </Button>
        <Button
          variant={filter === "2xx" ? "default" : "ghost"}
          onClick={() => setFilter("2xx")}
        >
          ✅ 2xx
        </Button>
        <Button
          variant={filter === "4xx" ? "default" : "ghost"}
          onClick={() => setFilter("4xx")}
        >
          ❌ 4xx+
        </Button>
      </div>

      {filtered.map((snap) => {
        const isExpanded = expandedId === snap.id
        return (
          <Card key={snap.id} className="bg-muted text-foreground">
            <CardContent className="p-4 space-y-4">
              {/* Metadata */}
              <div className="flex justify-between text-xs text-gray-500">
                <span>{new Date(snap.created_at).toLocaleString()}</span>
                {snap.status_code !== undefined && (
                  <span
                    className={cn(
                      "font-semibold",
                      snap.status_code >= 400
                        ? "text-red-500"
                        : snap.status_code >= 300
                        ? "text-yellow-500"
                        : "text-green-500"
                    )}
                  >
                    HTTP {snap.status_code}
                  </span>
                )}
              </div>

              {/* Summary Diff */}
              <div className="text-sm whitespace-pre-wrap">
                {snap.summary_diff}
              </div>

              {/* Toggle JSON Diff View */}
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setExpandedId(isExpanded ? null : snap.id)}
              >
                {isExpanded ? "Hide JSON Diff" : "View JSON Diff"}
              </Button>

              {isExpanded && (
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Old JSON */}
                  <div>
                    <div className="flex justify-between items-center mb-1 text-sm text-gray-400">
                      <span>Old Response</span>
                      <ClipboardCopy
                        className="w-4 h-4 cursor-pointer"
                        onClick={() =>
                          copyToClipboard(
                            JSON.stringify(snap.old_response_json || {}, null, 2)
                          )
                        }
                      />
                    </div>
                    <SyntaxHighlighter
                      language="json"
                      style={oneDark}
                      customStyle={{
                        maxHeight: 300,
                        overflow: "auto",
                        fontSize: "0.75rem",
                        backgroundColor: "#1e1e1e",
                        borderRadius: "0.5rem",
                      }}
                    >
                      {JSON.stringify(snap.old_response_json || {}, null, 2)}
                    </SyntaxHighlighter>
                  </div>

                  {/* New JSON */}
                  <div>
                    <div className="flex justify-between items-center mb-1 text-sm text-gray-400">
                      <span>New Response</span>
                      <ClipboardCopy
                        className="w-4 h-4 cursor-pointer"
                        onClick={() =>
                          copyToClipboard(
                            JSON.stringify(snap.response_json || {}, null, 2)
                          )
                        }
                      />
                    </div>
                    <SyntaxHighlighter
                      language="json"
                      style={oneDark}
                      customStyle={{
                        maxHeight: 300,
                        overflow: "auto",
                        fontSize: "0.75rem",
                        backgroundColor: "#1e1e1e",
                        borderRadius: "0.5rem",
                      }}
                    >
                      {JSON.stringify(snap.response_json || {}, null, 2)}
                    </SyntaxHighlighter>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
