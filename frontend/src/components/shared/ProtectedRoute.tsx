// src/components/ProtectedRoute.tsx
import { useAuth } from "./AuthProvider"
import { Navigate } from "react-router-dom"

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) return <div className="p-4">Loading...</div>
  if (!user) return <Navigate to="/login" />

  return <>{children}</>
}
