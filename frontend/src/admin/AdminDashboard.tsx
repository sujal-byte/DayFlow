import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthProvider';
import './AdminDashboard.css';

type Tab =
  | 'Overview'
  | 'Employees'
  | 'Attendance'
  | 'Leave approvals'
  | 'Payroll';

type LeaveRequest = {
  id: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  type: string;
  startDate: string;
  endDate: string;
  reason?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
};

const tabs: { label: Tab; icon: string }[] = [
  { label: 'Overview', icon: '⌂' },
  { label: 'Employees', icon: '♙' },
  { label: 'Attendance', icon: '◷' },
  { label: 'Leave approvals', icon: '◫' },
  { label: 'Payroll', icon: '₹' },
];

const attendanceData = [
  {
    initials: 'AR',
    name: 'Aditi Rao',
    role: 'Software Engineer',
    time: '09:08 AM',
    hours: '7h 42m',
    status: 'Present',
    color: 'purple',
  },
  {
    initials: 'VS',
    name: 'Vikram Shah',
    role: 'Product Manager',
    time: '09:21 AM',
    hours: '7h 29m',
    status: 'Present',
    color: 'blue',
  },
  {
    initials: 'SM',
    name: 'Sneha Menon',
    role: 'UX Designer',
    time: '09:47 AM',
    hours: '7h 03m',
    status: 'Late',
    color: 'pink',
  },
  {
    initials: 'AK',
    name: 'Aditya Kapoor',
    role: 'Frontend Engineer',
    time: '08:56 AM',
    hours: '7h 55m',
    status: 'Present',
    color: 'yellow',
  },
  {
    initials: 'NP',
    name: 'Nisha Prasad',
    role: 'HR Executive',
    time: '—',
    hours: '0h 00m',
    status: 'Absent',
    color: 'orange',
  },
];

const payrollData = [
  {
    initials: 'AR',
    name: 'Aditi Rao',
    role: 'Software Engineer',
    salary: '₹82,000',
    deductions: '₹4,800',
    net: '₹77,200',
    status: 'Paid',
    color: 'purple',
  },
  {
    initials: 'VS',
    name: 'Vikram Shah',
    role: 'Product Manager',
    salary: '₹95,000',
    deductions: '₹6,200',
    net: '₹88,800',
    status: 'Paid',
    color: 'blue',
  },
  {
    initials: 'SM',
    name: 'Sneha Menon',
    role: 'UX Designer',
    salary: '₹70,000',
    deductions: '₹3,900',
    net: '₹66,100',
    status: 'Pending',
    color: 'pink',
  },
  {
    initials: 'AK',
    name: 'Aditya Kapoor',
    role: 'Frontend Engineer',
    salary: '₹78,000',
    deductions: '₹4,300',
    net: '₹73,700',
    status: 'Paid',
    color: 'yellow',
  },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, token: authContextToken, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('Overview');
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loadingLeaves, setLoadingLeaves] = useState(false);
  const [notice, setNotice] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const getToken = () => {
    return (
      authContextToken ||
      localStorage.getItem('dayflow_access_token') ||
      localStorage.getItem('access_token') ||
      localStorage.getItem('token') ||
      localStorage.getItem('accessToken') ||
      sessionStorage.getItem('dayflow_access_token')
    );
  };

  const displayName = user?.firstName
    ? `${user.firstName} ${user.lastName || ''}`.trim()
    : user?.email?.split('@')[0] || 'Admin';

  const initials = user?.firstName
    ? `${user.firstName[0]}${user.lastName ? user.lastName[0] : ''}`.toUpperCase()
    : 'AD';

  const showNotice = (message: string) => {
    setNotice(message);
  };

  const handleSignOut = () => {
    signOut();
    navigate('/signin');
  };

  const loadLeaveRequests = async () => {
    try {
      setLoadingLeaves(true);
      const token = getToken();

      if (!token) {
        setNotice('You are not logged in.');
        return;
      }

      const response = await fetch(`${API_URL}/leaves`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to load leaves: ${response.status}`);
      }

      const data: LeaveRequest[] = await response.json();
      setRequests(data.filter((request) => request.status === 'PENDING'));
    } catch (error) {
      console.error(error);
      setNotice('Could not load leave requests.');
    } finally {
      setLoadingLeaves(false);
    }
  };

  useEffect(() => {
    loadLeaveRequests();
  }, []);

  const resolveRequest = async (
    id: string,
    name: string,
    action: 'APPROVED' | 'REJECTED',
  ) => {
    try {
      const token = getToken();

      if (!token) {
        showNotice('You are not logged in.');
        return;
      }

      const response = await fetch(`${API_URL}/leaves/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: action,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(errorText);
        throw new Error(`Failed to update leave: ${response.status}`);
      }

      setRequests((current) => current.filter((request) => request.id !== id));
      showNotice(
        `${name}'s leave request was ${action === 'APPROVED' ? 'approved' : 'rejected'}.`,
      );
    } catch (error) {
      console.error(error);
      showNotice('Could not update the leave request.');
    }
  };

  const openTab = (tab: Tab) => {
    setActiveTab(tab);
    setNotice('');

    if (tab === 'Leave approvals' || tab === 'Overview') {
      loadLeaveRequests();
    }
  };

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <button
          className="admin-brand"
          onClick={() => openTab('Overview')}
          type="button"
        >
          <span className="admin-brand-mark">D</span>
          <span>dayflow</span>
          <small>ADMIN</small>
        </button>

        <nav aria-label="Admin navigation">
          {tabs.map((tab) => (
            <button
              key={tab.label}
              className={`admin-nav-item ${activeTab === tab.label ? 'active' : ''}`}
              onClick={() => openTab(tab.label)}
              type="button"
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <button onClick={handleSignOut} title="Sign Out" type="button">
            ⎋ <span>Sign Out</span>
          </button>

          <div className="admin-user">
            <div className="admin-avatar avatar-green">{initials}</div>
            <div>
              <strong>{displayName}</strong>
              <span>{user?.email || 'HR Manager'}</span>
            </div>
            <button
              aria-label="Open account menu"
              onClick={handleSignOut}
              title="Sign Out"
              type="button"
            >
              •••
            </button>
          </div>
        </div>
      </aside>

      <section className="admin-content">
        <header className="admin-topbar">
          <button
            className="admin-mobile-menu"
            aria-label="Open navigation"
            onClick={() => showNotice('Navigation menu opened.')}
            type="button"
          >
            ☰
          </button>

          <div className="admin-top-actions">
            <button
              className="admin-search"
              onClick={() => showNotice('Employee search opened.')}
              type="button"
            >
              ⌕ <span>Search employees...</span>
              <kbd>⌘ K</kbd>
            </button>

            <button
              className="admin-notification"
              aria-label="View notifications"
              onClick={() => showNotice('You have 3 new notifications.')}
              type="button"
            >
              ♧<i />
            </button>

            <button
              className="admin-avatar avatar-green"
              onClick={handleSignOut}
              title="Sign Out"
              type="button"
            >
              {initials}
            </button>
          </div>
        </header>

        {notice && (
          <div className="admin-notice" role="status">
            {notice}
            <button
              onClick={() => setNotice('')}
              aria-label="Dismiss message"
              type="button"
            >
              ×
            </button>
          </div>
        )}

        {activeTab === 'Overview' && (
          <Overview
            requests={requests}
            setActiveTab={setActiveTab}
            resolveRequest={resolveRequest}
            showNotice={showNotice}
            displayName={displayName}
          />
        )}

        {activeTab === 'Employees' && (
          <EmployeesView showNotice={showNotice} />
        )}

        {activeTab === 'Attendance' && (
          <AttendanceView showNotice={showNotice} />
        )}

        {activeTab === 'Leave approvals' && (
          <LeaveApprovalsView
            requests={requests}
            loading={loadingLeaves}
            resolveRequest={resolveRequest}
            showNotice={showNotice}
          />
        )}

        {activeTab === 'Payroll' && (
          <PayrollView showNotice={showNotice} />
        )}
      </section>
    </main>
  );
}

function Overview({
  requests,
  setActiveTab,
  resolveRequest,
  showNotice,
  displayName,
}: {
  requests: LeaveRequest[];
  setActiveTab: React.Dispatch<React.SetStateAction<Tab>>;
  resolveRequest: (
    id: string,
    name: string,
    action: 'APPROVED' | 'REJECTED',
  ) => void;
  showNotice: (message: string) => void;
  displayName: string;
}) {
  return (
    <>
      <div className="admin-heading">
        <div>
          <p className="admin-eyebrow">DAYFLOW ADMIN</p>
          <h1>
            Good day, {displayName} <span>👋</span>
          </h1>
          <p>Here’s an overview of your team today.</p>
        </div>

        <button
          className="admin-primary"
          onClick={() => showNotice('Add employee form opened.')}
          type="button"
        >
          ＋ Add employee
        </button>
      </div>

      <section className="admin-stat-grid" aria-label="Organisation summary">
        <Stat
          icon="♙"
          label="TOTAL EMPLOYEES"
          value="124"
          trend="+8 this month"
          color="violet"
        />
        <Stat
          icon="◷"
          label="PRESENT TODAY"
          value="108"
          trend="87% attendance"
          color="green"
        />
        <Stat
          icon="◫"
          label="ON LEAVE"
          value={String(requests.length)}
          trend="pending requests"
          color="orange"
        />
        <Stat
          icon="◴"
          label="LATE CHECK-INS"
          value="7"
          trend="Needs your attention"
          color="red"
        />
      </section>

      <section className="admin-main-grid">
        <div className="admin-panel leave-panel">
          <div className="admin-panel-heading">
            <div>
              <h2>Leave requests</h2>
              <p>Review pending time-off requests.</p>
            </div>

            <button
              onClick={() => setActiveTab('Leave approvals')}
              type="button"
            >
              View all →
            </button>
          </div>

          <div className="leave-requests">
            {requests.length ? (
              requests.slice(0, 3).map((request) => {
                const name =
                  `${request.user.firstName} ${request.user.lastName}`.trim();

                return (
                  <article className="leave-request" key={request.id}>
                    <div className="request-avatar blue">
                      {request.user.firstName?.[0]}
                      {request.user.lastName?.[0]}
                    </div>

                    <div className="request-main">
                      <strong>{name}</strong>
                      <span>
                        {request.user.email} · {request.type}
                      </span>
                      <small>
                        {formatDate(request.startDate)} – {formatDate(request.endDate)}
                      </small>
                    </div>

                    <div className="request-actions">
                      <button
                        className="reject"
                        onClick={() =>
                          resolveRequest(request.id, name, 'REJECTED')
                        }
                        aria-label={`Reject ${name}'s request`}
                        type="button"
                      >
                        ×
                      </button>

                      <button
                        className="approve"
                        onClick={() =>
                          resolveRequest(request.id, name, 'APPROVED')
                        }
                        aria-label={`Approve ${name}'s request`}
                        type="button"
                      >
                        ✓
                      </button>
                    </div>
                  </article>
                );
              })
            ) : (
              <p className="empty-state">No pending leave requests.</p>
            )}
          </div>
        </div>

        <aside className="admin-panel team-panel">
          <div className="admin-panel-heading">
            <div>
              <h2>Team availability</h2>
              <p>Today’s attendance snapshot.</p>
            </div>
          </div>

          <div className="availability-ring">
            <strong>
              87<small>%</small>
            </strong>
            <span>Present today</span>
          </div>

          <div className="availability-key">
            <p>
              <i className="key-present" />
              Present <b>108</b>
            </p>
            <p>
              <i className="key-leave" />
              On leave <b>{requests.length}</b>
            </p>
            <p>
              <i className="key-absent" />
              Absent <b>7</b>
            </p>
          </div>
        </aside>
      </section>

      <section className="admin-panel attendance-panel">
        <div className="admin-panel-heading">
          <div>
            <h2>Today’s attendance</h2>
            <p>Latest employee check-ins and attendance status.</p>
          </div>

          <button onClick={() => setActiveTab('Attendance')} type="button">
            View attendance →
          </button>
        </div>

        <div className="attendance-table">
          <div className="attendance-row table-head">
            <span>EMPLOYEE</span>
            <span>CHECK-IN</span>
            <span>WORKING HOURS</span>
            <span>STATUS</span>
          </div>

          {attendanceData.slice(0, 3).map((employee) => (
            <AttendanceRow key={employee.name} {...employee} />
          ))}
        </div>
      </section>
    </>
  );
}

function EmployeesView({
  showNotice,
}: {
  showNotice: (message: string) => void;
}) {
  return (
    <>
      <PageHeading
        eyebrow="EMPLOYEES"
        title="Employees"
        subtitle="Manage your organisation and employee records."
        action={
          <button
            className="admin-primary"
            onClick={() => showNotice('Add employee form opened.')}
            type="button"
          >
            ＋ Add employee
          </button>
        }
      />

      <section className="admin-panel">
        <div className="admin-panel-heading">
          <div>
            <h2>Employee management</h2>
            <p>Your teammate can plug their Employees UI here.</p>
          </div>
        </div>
      </section>
    </>
  );
}

function AttendanceView({
  showNotice,
}: {
  showNotice: (message: string) => void;
}) {
  const present = attendanceData.filter(
    (employee) => employee.status === 'Present',
  ).length;

  const late = attendanceData.filter(
    (employee) => employee.status === 'Late',
  ).length;

  const absent = attendanceData.filter(
    (employee) => employee.status === 'Absent',
  ).length;

  return (
    <>
      <PageHeading
        eyebrow="ATTENDANCE"
        title="Attendance"
        subtitle="Monitor today's check-ins and working hours."
        action={
          <button
            className="admin-primary"
            onClick={() => showNotice('Attendance report exported.')}
            type="button"
          >
            Export report
          </button>
        }
      />

      <section className="admin-stat-grid">
        <Stat
          icon="✓"
          label="PRESENT"
          value={String(present)}
          trend="Checked in"
          color="green"
        />

        <Stat
          icon="◷"
          label="LATE"
          value={String(late)}
          trend="Needs attention"
          color="orange"
        />

        <Stat
          icon="×"
          label="ABSENT"
          value={String(absent)}
          trend="Today"
          color="red"
        />

        <Stat
          icon="◉"
          label="ATTENDANCE RATE"
          value="87%"
          trend="Organisation"
          color="violet"
        />
      </section>

      <section className="admin-panel attendance-panel">
        <div className="admin-panel-heading">
          <div>
            <h2>Today’s attendance</h2>
            <p>Employee attendance overview.</p>
          </div>

          <button
            onClick={() => showNotice('Attendance refreshed.')}
            type="button"
          >
            Refresh
          </button>
        </div>

        <div className="attendance-table">
          <div className="attendance-row table-head">
            <span>EMPLOYEE</span>
            <span>CHECK-IN</span>
            <span>WORKING HOURS</span>
            <span>STATUS</span>
          </div>

          {attendanceData.map((employee) => (
            <AttendanceRow key={employee.name} {...employee} />
          ))}
        </div>
      </section>
    </>
  );
}

function LeaveApprovalsView({
  requests,
  loading,
  resolveRequest,
  showNotice,
}: {
  requests: LeaveRequest[];
  loading: boolean;
  resolveRequest: (
    id: string,
    name: string,
    action: 'APPROVED' | 'REJECTED',
  ) => void;
  showNotice: (message: string) => void;
}) {
  return (
    <>
      <PageHeading
        eyebrow="LEAVE MANAGEMENT"
        title="Leave approvals"
        subtitle="Review and manage pending employee leave requests."
        action={
          <button
            className="admin-primary"
            onClick={() => showNotice('Leave report exported.')}
            type="button"
          >
            Export requests
          </button>
        }
      />

      <section className="admin-stat-grid">
        <Stat
          icon="◫"
          label="PENDING"
          value={String(requests.length)}
          trend="Awaiting review"
          color="orange"
        />

        <Stat
          icon="✓"
          label="APPROVED THIS MONTH"
          value="26"
          trend="+4 from last month"
          color="green"
        />

        <Stat
          icon="×"
          label="REJECTED"
          value="4"
          trend="This month"
          color="red"
        />
      </section>

      <section className="admin-panel leave-panel">
        <div className="admin-panel-heading">
          <div>
            <h2>Pending requests</h2>
            <p>Approve or reject employee time-off requests.</p>
          </div>

          <button
            onClick={() => showNotice('Requests refreshed.')}
            type="button"
          >
            Refresh
          </button>
        </div>

        <div className="leave-requests">
          {loading ? (
            <p className="empty-state">Loading leave requests...</p>
          ) : requests.length ? (
            requests.map((request) => {
              const name =
                `${request.user.firstName} ${request.user.lastName}`.trim();

              return (
                <article className="leave-request" key={request.id}>
                  <div className="request-avatar blue">
                    {request.user.firstName?.[0]}
                    {request.user.lastName?.[0]}
                  </div>

                  <div className="request-main">
                    <strong>{name}</strong>
                    <span>
                      {request.user.email} · {request.type}
                    </span>
                    <small>
                      {formatDate(request.startDate)} – {formatDate(request.endDate)}
                    </small>
                    {request.reason && <small>Reason: {request.reason}</small>}
                  </div>

                  <div className="request-actions">
                    <button
                      className="reject"
                      onClick={() =>
                        resolveRequest(request.id, name, 'REJECTED')
                      }
                      aria-label={`Reject ${name}'s request`}
                      type="button"
                    >
                      ×
                    </button>

                    <button
                      className="approve"
                      onClick={() =>
                        resolveRequest(request.id, name, 'APPROVED')
                      }
                      aria-label={`Approve ${name}'s request`}
                      type="button"
                    >
                      ✓
                    </button>
                  </div>
                </article>
              );
            })
          ) : (
            <p className="empty-state">No pending leave requests.</p>
          )}
        </div>
      </section>
    </>
  );
}

function PayrollView({
  showNotice,
}: {
  showNotice: (message: string) => void;
}) {
  return (
    <>
      <PageHeading
        eyebrow="PAYROLL"
        title="Payroll"
        subtitle="Review salary processing and employee payouts."
        action={
          <button
            className="admin-primary"
            onClick={() => showNotice('Payroll report exported.')}
            type="button"
          >
            Export payroll
          </button>
        }
      />

      <section className="admin-stat-grid">
        <Stat
          icon="₹"
          label="TOTAL PAYROLL"
          value="₹9.42L"
          trend="August 2026"
          color="violet"
        />

        <Stat
          icon="✓"
          label="PAID"
          value="₹8.76L"
          trend="93% processed"
          color="green"
        />

        <Stat
          icon="◷"
          label="PENDING"
          value="₹66K"
          trend="Requires action"
          color="orange"
        />

        <Stat
          icon="♙"
          label="EMPLOYEES"
          value="124"
          trend="Payroll cycle"
          color="violet"
        />
      </section>

      <section className="admin-panel attendance-panel">
        <div className="admin-panel-heading">
          <div>
            <h2>August 2026 payroll</h2>
            <p>Employee salary and payout status.</p>
          </div>

          <button
            onClick={() => showNotice('Payroll refreshed.')}
            type="button"
          >
            Refresh
          </button>
        </div>

        <div className="attendance-table">
          <div
            className="attendance-row table-head"
            style={{
              gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
            }}
          >
            <span>EMPLOYEE</span>
            <span>GROSS</span>
            <span>DEDUCTIONS</span>
            <span>NET PAY</span>
            <span>STATUS</span>
          </div>

          {payrollData.map((employee) => (
            <div
              className="attendance-row"
              key={employee.name}
              style={{
                gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
              }}
            >
              <div className="employee-cell">
                <span className={`request-avatar ${employee.color}`}>
                  {employee.initials}
                </span>

                <div>
                  <strong>{employee.name}</strong>
                  <small>{employee.role}</small>
                </div>
              </div>

              <span>{employee.salary}</span>
              <span>{employee.deductions}</span>
              <span>{employee.net}</span>

              <span
                className={`admin-status ${
                  employee.status === 'Pending' ? 'late' : ''
                }`}
              >
                {employee.status}
              </span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function PageHeading({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="admin-heading">
      <div>
        <p className="admin-eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>

      {action}
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  trend,
  color,
}: {
  icon: string;
  label: string;
  value: string;
  trend: string;
  color: string;
}) {
  return (
    <article className="admin-stat">
      <span className={`stat-icon ${color}`}>{icon}</span>
      <p>{label}</p>
      <h2>{value}</h2>
      <small className={color === 'red' ? 'attention' : ''}>
        {color === 'red' ? '• ' : '↑ '}
        {trend}
      </small>
    </article>
  );
}

function AttendanceRow({
  initials,
  name,
  role,
  time,
  hours,
  status,
  color,
}: {
  initials: string;
  name: string;
  role: string;
  time: string;
  hours: string;
  status: string;
  color: string;
}) {
  return (
    <div className="attendance-row">
      <div className="employee-cell">
        <span className={`request-avatar ${color}`}>{initials}</span>

        <div>
          <strong>{name}</strong>
          <small>{role}</small>
        </div>
      </div>

      <span>{time}</span>
      <span>{hours}</span>

      <span
        className={`admin-status ${
          status === 'Late' || status === 'Absent' ? 'late' : ''
        }`}
      >
        {status}
      </span>
    </div>
  );
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
  });
}