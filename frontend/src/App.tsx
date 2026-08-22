<<<<<<< HEAD
import { Navigate, Route, Routes } from 'react-router-dom'
import { Dashboard } from './components/auth/Dashboard'
import { useAuth } from './features/auth/AuthProvider'
import { SignIn } from './features/auth/pages/SignIn'
import { SignUp } from './features/auth/pages/SignUp'

function ProtectedDashboard() {
  const { user } = useAuth()
  return user ? <Dashboard /> : <Navigate to="/signin" replace />
}

function App() {
  return <Routes><Route path="/" element={<Navigate to="/signin" replace />} /><Route path="/signin" element={<SignIn />} /><Route path="/signup" element={<SignUp />} /><Route path="/dashboard" element={<ProtectedDashboard />} /><Route path="*" element={<Navigate to="/signin" replace />} /></Routes>
=======
import AdminDashboard from './admin/AdminDashboard'

function App() {
  return <AdminDashboard />
>>>>>>> origin/srajan
}

export default App
