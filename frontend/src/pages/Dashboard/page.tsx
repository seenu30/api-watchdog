import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/components/shared/AuthProvider"
import { Plus } from "lucide-react"
import AddAPIForm from "./AddAPIForm"
import APIList from "./APIList"


export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate("/login")
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 space-y-6">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">API Watchdog 🐾</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">{user?.email}</span>
          <Button onClick={handleLogout} variant="ghost">
            Logout
          </Button>
        </div>
      </header>

      <main className="space-y-6">
        <section className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Monitored Endpoints</h2>
            <Button variant="default">
            <Plus className="w-4 h-4 mr-2" />
            Watch New API
            </Button>
        </section>

        {/* ➕ Add API Form */}
        <AddAPIForm userId={user?.id || ""} />

        <APIList userId={user?.id || ""} />
    </main>

    </div>
  )
}
