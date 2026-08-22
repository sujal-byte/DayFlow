import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout } from '../../../components/auth/AuthLayout'
import { RoleSelector } from '../../../components/auth/RoleSelector'
import { useAuth } from '../AuthProvider'
import type { SignInCredentials } from '../types'

export function SignIn() {
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const [form, setForm] = useState<SignInCredentials>({ email: '', password: '', role: 'EMPLOYEE' })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const update = <K extends keyof SignInCredentials>(field: K, value: SignInCredentials[K]) => { setForm((current) => ({ ...current, [field]: value })); setError('') }
  const submit = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setIsSubmitting(true); setError(''); const result = await signIn(form); setIsSubmitting(false); if (!result.success) { setError(result.message ?? 'Incorrect credentials'); return }; navigate('/dashboard') }
  return <AuthLayout eyebrow="Welcome back" title="Sign in." description="Access your DayFlow workspace."><div className="mb-7"><RoleSelector value={form.role} onChange={(role) => update('role', role)} /></div><form onSubmit={submit} className="space-y-5"><label className="block text-sm font-semibold">Email<input required type="email" autoComplete="email" value={form.email} onChange={(event) => update('email', event.target.value)} placeholder="you@company.com" className="mt-2 w-full rounded-xl bg-white px-4 py-4 text-sm shadow-[0_1px_3px_rgba(0,0,0,0.08)] outline-none ring-1 ring-zinc-200 transition placeholder:text-zinc-400 focus:ring-2 focus:ring-zinc-950" /></label><label className="block text-sm font-semibold">Password<input required type="password" autoComplete="current-password" value={form.password} onChange={(event) => update('password', event.target.value)} placeholder="Enter your password" className="mt-2 w-full rounded-xl bg-white px-4 py-4 text-sm shadow-[0_1px_3px_rgba(0,0,0,0.08)] outline-none ring-1 ring-zinc-200 transition placeholder:text-zinc-400 focus:ring-2 focus:ring-zinc-950" /></label>{error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}<button disabled={isSubmitting} className="flex w-full items-center justify-center rounded-xl bg-zinc-950 px-4 py-4 text-sm font-bold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50">{isSubmitting ? 'Signing in...' : `Sign in as ${form.role === 'ADMIN' ? 'Admin' : 'Employee'}`}</button></form><p className="mt-8 text-center text-sm text-zinc-500">New to DayFlow? <Link to="/signup" className="font-bold text-zinc-950 hover:underline">Create an account</Link></p></AuthLayout>
}
