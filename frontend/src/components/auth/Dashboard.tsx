import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../features/auth/AuthProvider'

export function Dashboard() {
  const navigate = useNavigate(); const { user, signOut } = useAuth()
  const signOutAndReturn = () => { signOut(); navigate('/signin') }
  return <main className="min-h-screen bg-zinc-950 px-6 py-12 text-white"><div className="mx-auto max-w-3xl"><div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white font-black text-zinc-950">D</div><span className="text-lg font-bold">DayFlow</span></div><button type="button" onClick={signOutAndReturn} className="rounded-xl border border-white/20 px-4 py-2 text-sm font-bold hover:bg-white/10">Sign out</button></div><section className="mt-16 rounded-3xl bg-white p-8 text-zinc-950 shadow-2xl"><p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">Temporary dashboard</p><h1 className="mt-3 text-4xl font-black tracking-[-0.04em]">Welcome to DayFlow.</h1><p className="mt-4 text-zinc-500">You signed in as {user?.email} with the {user?.role === 'ADMIN' ? 'Admin' : 'Employee'} role.</p></section></div></main>
}
