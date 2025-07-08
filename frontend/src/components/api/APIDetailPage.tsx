import { useParams, Link } from "react-router-dom"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import APIHistory from "@/components/api/APIHistory"
import APIHistoryTimeline from "@/components/api/APIHistoryTimeline"
import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@radix-ui/react-toggle-group"
import { ArrowLeft, Clock, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

type WatchedAPI = {
  id: string
  name: string
  method: string
  url: string
}

export default function APIDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [api, setApi] = useState<WatchedAPI | null>(null)
  const [viewMode, setViewMode] = useState<"timeline" | "detailed">("timeline")

  useEffect(() => {
    const fetchAPI = async () => {
      const { data, error } = await supabase
        .from("watched_apis")
        .select("*")
        .eq("id", id)
        .single()

      if (!error) setApi(data)
    }

    if (id) fetchAPI()
  }, [id])

  if (!api) return <p className="p-6">Loading API details...</p>

  return (
    <div className="min-h-screen p-6 text-white bg-black">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">{api.name}</h1>
          <p className="text-gray-400 text-sm">
            {api.method.toUpperCase()} {api.url}
          </p>
        </div>
        <Link to="/dashboard">
          <Button variant="ghost">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
        </Link>
      </div>

      {/* View Toggle (Sticky) */}
      <div className="sticky top-0 z-10 bg-black pb-4 pt-2 mb-4 border-b border-gray-800">
        <ToggleGroup
          type="single"
          value={viewMode}
          onValueChange={(v) => v && setViewMode(v as "timeline" | "detailed")}
          className="flex gap-2"
        >
          <ToggleGroupItem
            value="timeline"
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium border border-gray-600",
              viewMode === "timeline"
                ? "bg-white text-black border-white"
                : "bg-transparent text-white hover:bg-gray-800"
            )}
          >
            <Clock className="w-4 h-4 inline-block mr-1" /> Timeline View
          </ToggleGroupItem>

          <ToggleGroupItem
            value="detailed"
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium border border-gray-600",
              viewMode === "detailed"
                ? "bg-white text-black border-white"
                : "bg-transparent text-white hover:bg-gray-800"
            )}
          >
            <FileText className="w-4 h-4 inline-block mr-1" /> Detailed View
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Conditionally render based on view mode */}
      {viewMode === "timeline" ? (
        <APIHistoryTimeline apiId={api.id} />
      ) : (
        <APIHistory apiId={api.id} />
      )}
    </div>
  )
}
