import { Routes, Route } from "react-router-dom"
import Dashboard from "./pages/Dashboard/page" 
import LoginPage from "./pages/Login/page";
import ProtectedRoute from "./components/shared/ProtectedRoute"
import APIDetailPage from "./components/api/APIDetailPage";


function App() {
  return (
    <Routes>
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard/api/:id" element={<APIDetailPage />} />
    </Routes>
  )
}

export default App;