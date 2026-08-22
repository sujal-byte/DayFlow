import type { Role } from '../../features/auth/types'

interface RoleSelectorProps { value: Role; onChange: (role: Role) => void }
const labels: Record<Role, string> = { EMPLOYEE: 'Employee', ADMIN: 'Admin' }

export function RoleSelector({ value, onChange }: RoleSelectorProps) {
  return <div className="grid grid-cols-2 rounded-xl bg-zinc-200 p-1" aria-label="Select your role">{(['EMPLOYEE', 'ADMIN'] as const).map((role) => <button key={role} type="button" onClick={() => onChange(role)} className={`rounded-lg px-4 py-3 text-sm font-bold transition ${value === role ? 'bg-white text-zinc-950 shadow-sm' : 'text-zinc-500 hover:text-zinc-800'}`}>{labels[role]}</button>)}</div>
}
