import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './features/auth/AuthProvider'
import { SignIn } from './features/auth/pages/SignIn'
import { SignUp } from './features/auth/pages/SignUp'
import AdminDashboard from './admin/AdminDashboard'
import EmployeeDashboard from './employee/EmployeeDashboard'

function ProtectedDashboard() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950 text-white font-medium">
        Loading DayFlow...
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/signin" replace />
  }

  return user.role === 'ADMIN' ? <AdminDashboard /> : <EmployeeDashboard />
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/dashboard" element={<ProtectedDashboard />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/employee" element={<EmployeeDashboard />} />
      <Route path="*" element={<Navigate to="/signin" replace />} />
    </Routes>
  )
}

export default App
