import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"

type WatchedAPI = {
  id: string // Make sure it's string if your DB uses UUID
  name: string
  url: string
  method: string
}

export default function APIList({ userId }: { userId: string }) {
  const [apis, setApis] = useState<WatchedAPI[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchAPIs = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from("watched_apis")
        .select("*")
        .eq("user_id", userId)
        .order("id", { ascending: false })

      if (!error && data) {
        setApis(data)
      }

      setLoading(false)
    }

    fetchAPIs()
  }, [userId])

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
      {apis.map(api => (
        <Card
          key={api.id}
          className="p-4 bg-muted flex flex-col gap-1 text-foreground"
        >
          <div className="flex items-center justify-between">
            <span className="font-medium">{api.name}</span>
            <Badge variant="outline" className="uppercase">
              {api.method}
            </Badge>
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
      ))}
    </div>
  )
}
