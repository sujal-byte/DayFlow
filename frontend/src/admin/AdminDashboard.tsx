import { useState } from 'react'
import './AdminDashboard.css'

type Tab = 'Overview' | 'Employees' | 'Attendance' | 'Leave approvals' | 'Payroll'

const tabs: { label: Tab; icon: string }[] = [
  { label: 'Overview', icon: '⌂' }, { label: 'Employees', icon: '♙' },
  { label: 'Attendance', icon: '◷' }, { label: 'Leave approvals', icon: '◫' }, { label: 'Payroll', icon: '₹' },
]

const leaveRequests = [
  { initials: 'RK', name: 'Rahul Kumar', team: 'Engineering', leave: 'Sick leave', dates: '22 Aug – 23 Aug', color: 'blue' },
  { initials: 'PM', name: 'Priya Mehta', team: 'Marketing', leave: 'Annual leave', dates: '25 Aug – 29 Aug', color: 'pink' },
  { initials: 'AK', name: 'Arjun Khanna', team: 'Design', leave: 'Personal leave', dates: '28 Aug', color: 'yellow' },
]

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('Overview')
  const [requests, setRequests] = useState(leaveRequests)
  const [notice, setNotice] = useState('')

  const resolveRequest = (name: string, action: 'approved' | 'rejected') => {
    setRequests((current) => current.filter((request) => request.name !== name))
    setNotice(`${name}'s leave request was ${action}.`)
  }

  return <main className="admin-shell">
    <aside className="admin-sidebar">
      <a className="admin-brand" href="#overview"><span className="admin-brand-mark">D</span><span>dayflow</span><small>ADMIN</small></a>
      <nav aria-label="Admin navigation">{tabs.map((tab) => <button className={`admin-nav-item ${activeTab === tab.label ? 'active' : ''}`} key={tab.label} onClick={() => setActiveTab(tab.label)}><span>{tab.icon}</span>{tab.label}</button>)}</nav>
      <div className="admin-sidebar-footer"><button onClick={() => setNotice('Settings page opened.')}>⚙ <span>Settings</span></button><div className="admin-user"><div className="admin-avatar avatar-green">NP</div><div><strong>Neha Patel</strong><span>HR Manager</span></div><button aria-label="Open account menu">•••</button></div></div>
    </aside>
    <section className="admin-content" id="overview">
      <header className="admin-topbar"><button className="admin-mobile-menu" aria-label="Open navigation">☰</button><div className="admin-top-actions"><button className="admin-search" onClick={() => setNotice('Employee search opened.')}>⌕ <span>Search employees...</span><kbd>⌘ K</kbd></button><button className="admin-notification" aria-label="View notifications">♧<i /></button><button className="admin-avatar avatar-green">NP</button></div></header>
      <div className="admin-heading"><div><p className="admin-eyebrow">FRIDAY, 22 AUGUST</p><h1>Good morning, Neha <span>👋</span></h1><p>Here’s an overview of your team today.</p></div><button className="admin-primary" onClick={() => setNotice('Add employee form opened.')}>＋ Add employee</button></div>
      {notice && <div className="admin-notice" role="status">{notice}<button onClick={() => setNotice('')} aria-label="Dismiss message">×</button></div>}
      <section className="admin-stat-grid" aria-label="Organisation summary">
        <Stat icon="♙" label="TOTAL EMPLOYEES" value="124" trend="+8 this month" color="violet" />
        <Stat icon="◷" label="PRESENT TODAY" value="108" trend="87% attendance" color="green" />
        <Stat icon="◫" label="ON LEAVE" value="9" trend="3 pending requests" color="orange" />
        <Stat icon="◴" label="LATE CHECK-INS" value="7" trend="Needs your attention" color="red" />
      </section>
      <section className="admin-main-grid">
        <div className="admin-panel leave-panel"><div className="admin-panel-heading"><div><h2>Leave requests</h2><p>Review pending time-off requests.</p></div><button onClick={() => { setActiveTab('Leave approvals'); setNotice('All leave requests opened.') }}>View all →</button></div>
          <div className="leave-requests">{requests.length ? requests.map((request) => <article className="leave-request" key={request.name}><div className={`request-avatar ${request.color}`}>{request.initials}</div><div className="request-main"><strong>{request.name}</strong><span>{request.team} · {request.leave}</span><small>{request.dates}</small></div><div className="request-actions"><button className="reject" onClick={() => resolveRequest(request.name, 'rejected')} aria-label={`Reject ${request.name}'s request`}>×</button><button className="approve" onClick={() => resolveRequest(request.name, 'approved')} aria-label={`Approve ${request.name}'s request`}>✓</button></div></article>) : <p className="empty-state">You have reviewed every pending leave request.</p>}</div>
        </div>
        <aside className="admin-panel team-panel"><div className="admin-panel-heading"><div><h2>Team availability</h2><p>Today’s attendance snapshot.</p></div></div><div className="availability-ring"><strong>87<small>%</small></strong><span>Present today</span></div><div className="availability-key"><p><i className="key-present" />Present <b>108</b></p><p><i className="key-leave" />On leave <b>9</b></p><p><i className="key-absent" />Absent <b>7</b></p></div></aside>
      </section>
      <section className="admin-panel attendance-panel"><div className="admin-panel-heading"><div><h2>Today’s attendance</h2><p>Latest employee check-ins and attendance status.</p></div><button onClick={() => { setActiveTab('Attendance'); setNotice('Detailed attendance view opened.') }}>View attendance →</button></div><div className="attendance-table"><div className="attendance-row table-head"><span>EMPLOYEE</span><span>CHECK-IN</span><span>WORKING HOURS</span><span>STATUS</span></div><AttendanceRow initials="AR" name="Aditi Rao" role="Software Engineer" time="09:08 AM" hours="7h 42m" status="Present" color="purple" /><AttendanceRow initials="VS" name="Vikram Shah" role="Product Manager" time="09:21 AM" hours="7h 29m" status="Present" color="blue" /><AttendanceRow initials="SM" name="Sneha Menon" role="UX Designer" time="09:47 AM" hours="7h 03m" status="Late" color="pink" /></div></section>
    </section>
  </main>
}

function Stat({ icon, label, value, trend, color }: { icon: string; label: string; value: string; trend: string; color: string }) {
  return <article className="admin-stat"><span className={`stat-icon ${color}`}>{icon}</span><p>{label}</p><h2>{value}</h2><small className={color === 'red' ? 'attention' : ''}>{color === 'red' ? '• ' : '↑ '}{trend}</small></article>
}

function AttendanceRow({ initials, name, role, time, hours, status, color }: { initials: string; name: string; role: string; time: string; hours: string; status: string; color: string }) {
  return <div className="attendance-row"><div className="employee-cell"><span className={`request-avatar ${color}`}>{initials}</span><div><strong>{name}</strong><small>{role}</small></div></div><span>{time}</span><span>{hours}</span><span className={`admin-status ${status === 'Late' ? 'late' : ''}`}>{status}</span></div>
}
