import { FormEvent, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../features/auth/AuthProvider'
import './EmployeeDashboard.css'
import './EmployeeFeatures.css'

type Page = 'Dashboard' | 'Attendance' | 'Leave requests' | 'My profile' | 'Payroll'
type AttendanceStatus = 'Present' | 'Absent' | 'Half-day' | 'Leave'
type LeaveStatus = 'Pending' | 'Approved' | 'Rejected'

type Profile = { name: string; title: string; department: string; employeeId: string; email: string; phone: string; address: string; joined: string }
type Attendance = { date: string; checkIn?: string; checkOut?: string; status: AttendanceStatus }
type LeaveRequest = { id: string; type: string; startDate: string; endDate: string; reason: string; status: LeaveStatus }

const storageKey = 'dayflow-employee-workspace'
const dateKey = () => new Date().toISOString().slice(0, 10)
const currentTime = () => new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit' }).format(new Date())
const prettyDate = (value: string) => new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${value}T12:00:00`))

const defaultProfile: Profile = { name: 'Ananya Sharma', title: 'Product Designer', department: 'Product & Design', employeeId: 'DF-1042', email: 'ananya.sharma@dayflow.example', phone: '+91 98765 43210', address: 'Indiranagar, Bengaluru, Karnataka', joined: '12 June 2024' }
const defaultAttendance: Attendance[] = [
  { date: '2026-08-21', checkIn: '09:08 am', checkOut: '06:05 pm', status: 'Present' },
  { date: '2026-08-20', checkIn: '09:14 am', checkOut: '06:12 pm', status: 'Present' },
  { date: '2026-08-19', checkIn: '09:02 am', checkOut: '05:48 pm', status: 'Present' },
  { date: '2026-08-18', status: 'Leave' },
]
const defaultLeaves: LeaveRequest[] = [
  { id: 'leave-1', type: 'Annual leave', startDate: '2026-08-18', endDate: '2026-08-19', reason: 'Personal travel', status: 'Approved' },
  { id: 'leave-2', type: 'Sick leave', startDate: '2026-09-04', endDate: '2026-09-04', reason: 'Medical appointment', status: 'Pending' },
]

function restoreState() {
  try {
    const saved = localStorage.getItem(storageKey)
    if (saved) return JSON.parse(saved) as { profile: Profile; attendance: Attendance[]; leaves: LeaveRequest[] }
  } catch { localStorage.removeItem(storageKey) }
  return { profile: defaultProfile, attendance: defaultAttendance, leaves: defaultLeaves }
}

export default function EmployeeDashboard() {
  const { user, signOut } = useAuth()
  const stored = useMemo(restoreState, [])
  const [page, setPage] = useState<Page>('Dashboard')
  const [profile, setProfile] = useState<Profile>({ ...stored.profile, email: user?.email ?? stored.profile.email })
  const [attendance, setAttendance] = useState<Attendance[]>(stored.attendance)
  const [leaves, setLeaves] = useState<LeaveRequest[]>(stored.leaves)
  const [notice, setNotice] = useState('')

  useEffect(() => { localStorage.setItem(storageKey, JSON.stringify({ profile, attendance, leaves })) }, [profile, attendance, leaves])

  const todayRecord = attendance.find((record) => record.date === dateKey())
  const checkedIn = Boolean(todayRecord?.checkIn && !todayRecord.checkOut)
  const setCurrentPage = (next: Page) => { setPage(next); setNotice('') }
  const checkAttendance = () => {
    const time = currentTime()
    if (!todayRecord) {
      setAttendance((items) => [{ date: dateKey(), checkIn: time, status: 'Present' }, ...items])
      setNotice(`Checked in at ${time}. Have a productive day!`)
    } else if (!todayRecord.checkOut) {
      setAttendance((items) => items.map((item) => item.date === dateKey() ? { ...item, checkOut: time } : item))
      setNotice(`Checked out at ${time}. Your attendance has been saved.`)
    }
  }
  const submitLeave = (request: Omit<LeaveRequest, 'id' | 'status'>) => {
    setLeaves((items) => [{ ...request, id: crypto.randomUUID(), status: 'Pending' }, ...items])
    setNotice('Your leave request has been submitted for approval.')
    setPage('Leave requests')
  }
  const cancelLeave = (id: string) => { setLeaves((items) => items.filter((item) => item.id !== id)); setNotice('Your pending leave request was cancelled.') }

  const navItems: { label: Page; icon: string }[] = [
    { label: 'Dashboard', icon: '⌂' }, { label: 'Attendance', icon: '◷' }, { label: 'Leave requests', icon: '◫' }, { label: 'My profile', icon: '◉' }, { label: 'Payroll', icon: '₹' },
  ]

  return <main className="app-shell">
    <aside className="sidebar"><a className="brand" href="#employee" onClick={() => setCurrentPage('Dashboard')}><span className="brand-mark">D</span><span>dayflow</span></a>
      <nav aria-label="Employee navigation">{navItems.map((item) => <button className={`nav-item ${page === item.label ? 'active' : ''}`} key={item.label} onClick={() => setCurrentPage(item.label)}><span>{item.icon}</span>{item.label}</button>)}</nav>
      <button className="help-link" onClick={() => setNotice('For help, contact your HR team at hr@dayflow.example.')}>?<span>Help & support</span></button>
      <div className="profile-mini"><div className="avatar">{initials(profile.name)}</div><div><strong>{profile.name}</strong><span>{profile.title}</span></div><button className="more-button" onClick={signOut} title="Sign out">↪</button></div>
    </aside>
    <section className="content" id="employee"><header className="topbar"><button className="mobile-brand" aria-label="Open menu">☰</button><div className="topbar-actions"><button className="icon-button" onClick={() => setNotice('You have no new notifications.')} aria-label="View notifications">♧<span className="notification-dot" /></button><button className="top-avatar" onClick={() => setCurrentPage('My profile')}>{initials(profile.name)}</button></div></header>
      {notice && <div className="notice" role="status">{notice}<button onClick={() => setNotice('')} aria-label="Dismiss message">×</button></div>}
      {page === 'Dashboard' && <Overview profile={profile} attendance={attendance} leaves={leaves} checkedIn={checkedIn} onAttendance={checkAttendance} onNavigate={setCurrentPage} />}
      {page === 'Attendance' && <AttendancePage attendance={attendance} checkedIn={checkedIn} onAttendance={checkAttendance} />}
      {page === 'Leave requests' && <LeavePage leaves={leaves} onSubmit={submitLeave} onCancel={cancelLeave} />}
      {page === 'My profile' && <ProfilePage profile={profile} onSave={(next) => { setProfile(next); setNotice('Your profile has been updated.') }} />}
      {page === 'Payroll' && <PayrollPage profile={profile} />}
    </section>
  </main>
}

function Overview({ profile, attendance, leaves, checkedIn, onAttendance, onNavigate }: { profile: Profile; attendance: Attendance[]; leaves: LeaveRequest[]; checkedIn: boolean; onAttendance: () => void; onNavigate: (page: Page) => void }) {
  const today = new Intl.DateTimeFormat('en-IN', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())
  const approved = leaves.filter((leave) => leave.status === 'Approved').length
  return <><div className="page-heading"><div><p className="eyebrow">{today}</p><h1>Good morning, {profile.name.split(' ')[0]} <span>👋</span></h1><p className="subtitle">Here’s what’s happening with your workday.</p></div><button className="outline-button" onClick={() => onNavigate('My profile')}>View profile <span>→</span></button></div>
    <section className="overview-grid"><article className="attendance-card"><div className="card-label"><span className="card-icon indigo">◷</span> TODAY’S ATTENDANCE</div><div className="attendance-main"><div><h2>{checkedIn ? 'You’re checked in' : 'Ready to start?'}</h2><p>{checkedIn ? 'Your workday is currently in progress.' : 'Check in to begin your workday.'}</p></div><span className={`status-pill ${checkedIn ? 'present' : 'not-started'}`}>{checkedIn ? 'Present' : 'Not started'}</span></div><button className={`attendance-button ${checkedIn ? 'checkout' : ''}`} onClick={onAttendance}><span>{checkedIn ? '↗' : '↘'}</span>{checkedIn ? 'Check out' : 'Check in'}</button></article><article className="hours-card"><div className="card-label"><span className="card-icon orange">◔</span> THIS WEEK</div><div className="hours-value">32<span>h</span><small>18m</small></div><div className="progress-track"><div className="progress-fill" /></div><p><strong>80%</strong> of your weekly target (40h)</p></article></section>
    <section className="section-block"><div className="section-heading"><div><h2>Leave balance</h2><p>{approved} approved request{approved === 1 ? '' : 's'} this year.</p></div><button className="text-button" onClick={() => onNavigate('Leave requests')}>Request leave <span>→</span></button></div><div className="leave-grid"><LeaveCard label="Annual leave" remaining="12" total="18" color="purple" /><LeaveCard label="Sick leave" remaining="6" total="10" color="blue" /><LeaveCard label="Personal leave" remaining="2" total="4" color="orange" /></div></section>
    <section className="section-block activity-section"><div className="section-heading"><div><h2>Recent attendance</h2><p>Your latest workday records.</p></div><button className="text-button" onClick={() => onNavigate('Attendance')}>View all <span>→</span></button></div><div className="activity-list">{attendance.slice(0, 3).map((record) => <div className="activity" key={record.date}><span className="activity-dot success">✓</span><div><strong>{record.status} · {prettyDate(record.date)}</strong><p>{record.checkIn ? `${record.checkIn} – ${record.checkOut ?? 'Currently checked in'}` : 'No clock-in record'}</p></div><time>{record.status}</time></div>)}</div></section>
  </>
}

function AttendancePage({ attendance, checkedIn, onAttendance }: { attendance: Attendance[]; checkedIn: boolean; onAttendance: () => void }) {
  const sorted = [...attendance].sort((a, b) => b.date.localeCompare(a.date))
  return <PageHeader title="Attendance" description="Track your daily check-ins, check-outs, and work status." action={<button className={`attendance-button ${checkedIn ? 'checkout' : ''}`} onClick={onAttendance}>{checkedIn ? 'Check out' : 'Check in'}</button>}><div className="feature-card attendance-summary"><div><p className="eyebrow">TODAY</p><h2>{checkedIn ? 'Working day in progress' : 'Not checked in yet'}</h2><p>{checkedIn ? 'Remember to check out when you finish work.' : 'Your attendance will be saved as soon as you check in.'}</p></div><span className={`status-pill ${checkedIn ? 'present' : 'not-started'}`}>{checkedIn ? 'Present' : 'Not started'}</span></div><div className="feature-card"><h2 className="feature-title">Attendance history</h2><div className="employee-table"><div className="employee-row table-label"><span>DATE</span><span>CHECK-IN</span><span>CHECK-OUT</span><span>STATUS</span></div>{sorted.map((record) => <div className="employee-row" key={record.date}><strong>{prettyDate(record.date)}</strong><span>{record.checkIn ?? '—'}</span><span>{record.checkOut ?? '—'}</span><span className={`table-status ${record.status.toLowerCase().replace('-', '')}`}>{record.status}</span></div>)}</div></div></PageHeader>
}

function LeavePage({ leaves, onSubmit, onCancel }: { leaves: LeaveRequest[]; onSubmit: (request: Omit<LeaveRequest, 'id' | 'status'>) => void; onCancel: (id: string) => void }) {
  const [form, setForm] = useState({ type: 'Annual leave', startDate: '', endDate: '', reason: '' }); const [error, setError] = useState('')
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); if (!form.startDate || !form.endDate || form.endDate < form.startDate) { setError('Choose a valid start and end date.'); return }; onSubmit(form); setForm({ type: 'Annual leave', startDate: '', endDate: '', reason: '' }); setError('') }
  return <PageHeader title="Leave requests" description="Apply for time off and track every request."><div className="feature-grid"><form className="feature-card leave-form" onSubmit={submit}><h2 className="feature-title">Request time off</h2><label>Leave type<select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}><option>Annual leave</option><option>Sick leave</option><option>Personal leave</option><option>Unpaid leave</option></select></label><div className="two-inputs"><label>Start date<input type="date" value={form.startDate} onChange={(event) => setForm({ ...form, startDate: event.target.value })} /></label><label>End date<input type="date" value={form.endDate} onChange={(event) => setForm({ ...form, endDate: event.target.value })} /></label></div><label>Remarks<textarea value={form.reason} onChange={(event) => setForm({ ...form, reason: event.target.value })} placeholder="Tell your manager anything relevant." /></label>{error && <p className="form-error">{error}</p>}<button className="attendance-button" type="submit">Submit request</button></form><div className="feature-card"><h2 className="feature-title">Your requests</h2><div className="request-list">{leaves.map((leave) => <article className="leave-request-card" key={leave.id}><div><strong>{leave.type}</strong><p>{prettyDate(leave.startDate)} – {prettyDate(leave.endDate)}</p><small>{leave.reason || 'No remarks added'}</small></div><div><span className={`table-status ${leave.status.toLowerCase()}`}>{leave.status}</span>{leave.status === 'Pending' && <button className="cancel-button" onClick={() => onCancel(leave.id)}>Cancel</button>}</div></article>)}</div></div></div></PageHeader>
}

function ProfilePage({ profile, onSave }: { profile: Profile; onSave: (profile: Profile) => void }) {
  const [form, setForm] = useState(profile); const [editing, setEditing] = useState(false)
  return <PageHeader title="My profile" description="Keep your personal contact details up to date." action={<button className="outline-button" onClick={() => editing ? onSave(form) : setEditing(true)}>{editing ? 'Save changes' : 'Edit profile'}</button>}><div className="profile-page"><section className="feature-card profile-card"><div className="profile-avatar-large">{initials(form.name)}</div><h2>{form.name}</h2><p>{form.title} · {form.department}</p><small>Employee ID: {form.employeeId}</small></section><section className="feature-card profile-details"><h2 className="feature-title">Personal details</h2><div className="profile-form"><Field label="Full name" value={form.name} enabled={editing} onChange={(name) => setForm({ ...form, name })} /><Field label="Phone number" value={form.phone} enabled={editing} onChange={(phone) => setForm({ ...form, phone })} /><Field label="Email address" value={form.email} enabled={false} onChange={() => undefined} /><Field label="Address" value={form.address} enabled={editing} onChange={(address) => setForm({ ...form, address })} /></div><div className="job-details"><p><span>Department</span><strong>{form.department}</strong></p><p><span>Joined Dayflow</span><strong>{form.joined}</strong></p></div></section></div></PageHeader>
}

function PayrollPage({ profile }: { profile: Profile }) {
  const download = () => { const blob = new Blob([`Dayflow payslip\nEmployee: ${profile.name}\nMonth: August 2026\nNet salary: ₹84,500`], { type: 'text/plain' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'dayflow-payslip-august-2026.txt'; link.click(); URL.revokeObjectURL(url) }
  return <PageHeader title="Payroll" description="View your salary summary and download your latest payslip."><section className="feature-grid"><article className="feature-card salary-card"><p className="eyebrow">AUGUST 2026 · NET PAY</p><h2>₹84,500</h2><p>Your salary will be credited on 31 August 2026.</p><button className="attendance-button" onClick={download}>Download payslip</button></article><article className="feature-card"><h2 className="feature-title">Salary structure</h2><div className="salary-lines"><p><span>Base salary</span><strong>₹70,000</strong></p><p><span>Allowances</span><strong>₹18,000</strong></p><p><span>Deductions</span><strong>−₹3,500</strong></p><p className="net"><span>Net salary</span><strong>₹84,500</strong></p></div></article></section><section className="feature-card"><h2 className="feature-title">Recent payslips</h2><div className="payslip-row"><div><strong>July 2026</strong><p>Net pay: ₹84,500</p></div><button className="outline-button" onClick={download}>Download</button></div></section></PageHeader>
}

function PageHeader({ title, description, action, children }: { title: string; description: string; action?: React.ReactNode; children: React.ReactNode }) { return <><div className="page-heading feature-heading"><div><p className="eyebrow">EMPLOYEE WORKSPACE</p><h1>{title}</h1><p className="subtitle">{description}</p></div>{action}</div>{children}</> }
function Field({ label, value, enabled, onChange }: { label: string; value: string; enabled: boolean; onChange: (value: string) => void }) { return <label>{label}<input value={value} disabled={!enabled} onChange={(event) => onChange(event.target.value)} /></label> }
function LeaveCard({ label, remaining, total, color }: { label: string; remaining: string; total: string; color: string }) { return <article className="leave-card"><div className={`leave-icon ${color}`}>◒</div><div><p>{label}</p><h3>{remaining} <span>days left</span></h3><small>of {total} days</small></div></article> }
function initials(name: string) { return name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase() }
