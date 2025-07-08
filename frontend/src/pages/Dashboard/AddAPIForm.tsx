// src/components/dashboard/AddAPIForm.tsx
import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

export default function AddAPIForm({ userId }: { userId: string }) {
  const [name, setName] = useState("")
  const [url, setUrl] = useState("")
  const [method, setMethod] = useState("GET")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!name || !url || !method) return toast.error("All fields are required.")
    setLoading(true)

    const { error } = await supabase.from("watched_apis").insert([
      { name, url, method, user_id: userId }
    ])

    if (error) {
      toast.error(error.message)
    } else {
      toast.success("API added successfully")
      setName("")
      setUrl("")
      setMethod("GET")
    }

    setLoading(false)
  }

  return (
    <div className="space-y-3 bg-muted p-4 rounded-xl shadow-sm text-foreground">
      <h2 className="text-lg font-semibold">Add API to Monitor</h2>
      <Input placeholder="Name (e.g. Orders API)" value={name} onChange={e => setName(e.target.value)} />
      <Input placeholder="URL (e.g. https://api.example.com/orders)" value={url} onChange={e => setUrl(e.target.value)} />
      <select
        value={method}
        onChange={e => setMethod(e.target.value)}
        className="w-full p-2 rounded-md border bg-background text-foreground"
      >
        <option value="GET">GET</option>
        <option value="POST">POST</option>
        <option value="PUT">PUT</option>
        <option value="DELETE">DELETE</option>
      </select>
      <Button onClick={handleSubmit} disabled={loading} className="w-full">
        {loading ? "Saving..." : "Add API"}
      </Button>
    </div>
  )
}
