import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthProvider'
import './EmployeeDashboard.css'

type NavItem = 'Dashboard' | 'Attendance' | 'Leave requests' | 'My profile'

const navItems: { label: NavItem; icon: string }[] = [
  { label: 'Dashboard', icon: '⌂' }, { label: 'Attendance', icon: '◷' },
  { label: 'Leave requests', icon: '◫' }, { label: 'My profile', icon: '◉' },
]

const activities = [
  { title: 'Leave request approved', detail: 'Annual leave · 18–19 August', time: 'Yesterday', type: 'success' },
  { title: 'You checked out', detail: 'Working time: 8h 12m', time: '20 Aug, 6:07 PM', type: 'neutral' },
  { title: 'Payslip is available', detail: 'July 2026 salary slip', time: '1 Aug', type: 'neutral' },
]

export default function EmployeeDashboard() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const [activeNav, setActiveNav] = useState<NavItem>('Dashboard')
  const [checkedInAt, setCheckedInAt] = useState<string | null>(null)
  const [notice, setNotice] = useState('')
  const today = useMemo(() => new Intl.DateTimeFormat('en-IN', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date()), [])

  const displayName = user?.firstName
    ? `${user.firstName} ${user.lastName || ''}`.trim()
    : user?.email?.split('@')[0] || 'Employee'

  const initials = user?.firstName
    ? `${user.firstName[0]}${user.lastName ? user.lastName[0] : ''}`.toUpperCase()
    : 'EM'

  const handleSignOut = () => {
    signOut()
    navigate('/signin')
  }

  const handleAttendance = () => {
    if (checkedInAt) { setNotice('Checked out successfully. Total time today: 0h 00m.'); setCheckedInAt(null); return }
    const currentTime = new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit' }).format(new Date())
    setCheckedInAt(currentTime); setNotice(`Checked in at ${currentTime}. Have a productive day!`)
  }

  return <main className="app-shell">
    <aside className="sidebar">
      <a className="brand" href="#dashboard" aria-label="Dayflow dashboard"><span className="brand-mark">D</span><span>dayflow</span></a>
      <nav aria-label="Primary navigation">{navItems.map((item) => <button className={`nav-item ${activeNav === item.label ? 'active' : ''}`} key={item.label} onClick={() => setActiveNav(item.label)}><span aria-hidden="true">{item.icon}</span>{item.label}</button>)}</nav>
      <button className="help-link" onClick={handleSignOut} title="Sign Out">⎋<span>Sign Out</span></button>
      <div className="profile-mini"><div className="avatar">{initials}</div><div><strong>{displayName}</strong><span>{user?.email}</span></div><button onClick={handleSignOut} className="more-button" aria-label="Sign out" title="Sign out">•••</button></div>
    </aside>
    <section className="content" id="dashboard">
      <header className="topbar"><button className="mobile-brand" aria-label="Open menu">☰</button><div className="topbar-actions"><button className="icon-button" aria-label="View notifications">♧<span className="notification-dot" /></button><button className="top-avatar" onClick={handleSignOut} title="Sign Out" aria-label="Open profile">{initials}</button></div></header>
      <div className="page-heading"><div><p className="eyebrow">{today}</p><h1>Good day, {displayName} <span aria-hidden="true">👋</span></h1><p className="subtitle">Here’s what’s happening with your workday.</p></div><button className="outline-button" onClick={handleSignOut}>Sign Out <span>→</span></button></div>
      {notice && <div className="notice" role="status">{notice}<button onClick={() => setNotice('')} aria-label="Dismiss message">×</button></div>}
      <section className="overview-grid" aria-label="Workday overview">
        <article className="attendance-card"><div className="card-label"><span className="card-icon indigo">◷</span> TODAY’S ATTENDANCE</div><div className="attendance-main"><div><h2>{checkedInAt ? 'You’re checked in' : 'Ready to start?'}</h2><p>{checkedInAt ? `Checked in at ${checkedInAt}` : 'Check in to begin your workday.'}</p></div><span className={`status-pill ${checkedInAt ? 'present' : 'not-started'}`}>{checkedInAt ? 'Present' : 'Not started'}</span></div><button className={`attendance-button ${checkedInAt ? 'checkout' : ''}`} onClick={handleAttendance}><span>{checkedInAt ? '↗' : '↘'}</span>{checkedInAt ? 'Check out' : 'Check in'}</button></article>
        <article className="hours-card"><div className="card-label"><span className="card-icon orange">◔</span> THIS WEEK</div><div className="hours-value">32<span>h</span><small>18m</small></div><div className="progress-track"><div className="progress-fill" /></div><p><strong>80%</strong> of your weekly target (40h)</p></article>
      </section>
      <section className="section-block"><div className="section-heading"><div><h2>Leave balance</h2><p>Plan your time away with confidence.</p></div><button className="text-button" onClick={() => { setActiveNav('Leave requests'); setNotice('Leave request form opened.') }}>Request leave <span>→</span></button></div><div className="leave-grid"><LeaveCard label="Annual leave" remaining="12" total="18" color="purple" /><LeaveCard label="Sick leave" remaining="6" total="10" color="blue" /><LeaveCard label="Personal leave" remaining="2" total="4" color="orange" /></div></section>
      <section className="bottom-grid"><div className="section-block activity-section"><div className="section-heading"><div><h2>Recent activity</h2><p>Keep track of your latest updates.</p></div><button className="text-button" onClick={() => setNotice('Showing all activity.')}>View all <span>→</span></button></div><div className="activity-list">{activities.map((activity) => <div className="activity" key={activity.title}><span className={`activity-dot ${activity.type}`}>{activity.type === 'success' ? '✓' : '•'}</span><div><strong>{activity.title}</strong><p>{activity.detail}</p></div><time>{activity.time}</time></div>)}</div></div><aside className="upcoming-card"><span className="card-icon peach">▣</span><p className="eyebrow">UPCOMING HOLIDAY</p><h2>Independence Day</h2><p>Saturday, 15 August</p><div className="holiday-date"><span>15</span><small>AUG</small></div></aside></section>
    </section>
  </main>
}

function LeaveCard({ label, remaining, total, color }: { label: string; remaining: string; total: string; color: string }) {
  return <article className="leave-card"><div className={`leave-icon ${color}`}>◒</div><div><p>{label}</p><h3>{remaining} <span>days left</span></h3><small>of {total} days</small></div></article>
}
