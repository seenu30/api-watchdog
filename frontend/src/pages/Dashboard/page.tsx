import { useState } from "react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/components/shared/AuthProvider"
import { Plus, Bell } from "lucide-react"
import AddAPIForm from "./AddAPIForm"
import APIList from "./APIList"

export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [alertCount, setAlertCount] = useState(0)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate("/login")
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 space-y-6">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">API Watchdog 🐾</h1>
        <div className="flex items-center gap-4 relative">
          <span className="text-sm text-gray-400">{user?.email}</span>

          {/* 🔔 Bell with count */}
          <div className="relative">
            <Bell className="w-5 h-5 text-white" />
            {alertCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                {alertCount}
              </span>
            )}
          </div>

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

        <AddAPIForm userId={user?.id || ""} />

        <APIList userId={user?.id || ""} onAlertCountChange={setAlertCount} />
      </main>
    </div>
  )
}
