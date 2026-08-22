import { Navigate, Route, Routes } from 'react-router-dom'
import AdminDashboard from './admin/AdminDashboard'
import EmployeeDashboard from './employee/EmployeeDashboard'
import { useAuth } from './features/auth/AuthProvider'
import { SignIn } from './features/auth/pages/SignIn'
import { SignUp } from './features/auth/pages/SignUp'

function ProtectedDashboard() {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/signin" replace />
  }

  return user.role === 'ADMIN'
    ? <AdminDashboard />
    : <EmployeeDashboard />
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/signin" replace />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/dashboard" element={<ProtectedDashboard />} />
      <Route path="*" element={<Navigate to="/signin" replace />} />
    </Routes>
  )
}

export default App