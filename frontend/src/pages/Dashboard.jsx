import React from 'react';
import { 
  Users, 
  Clock, 
  CalendarRange, 
  ArrowLeftRight, 
  PlusCircle, 
  AlertCircle,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import StatCard from '../components/StatCard';

export default function Dashboard({ 
  employees, 
  shifts, 
  rosters, 
  swaps, 
  setActivePage,
  onOpenAssignRoster,
  onOpenCreateSwap
}) {
  const pendingSwaps = swaps.filter((s) => s.status === 'PENDING' || s.status === 'COLLEAGUE_APPROVED');
  const activeEmployees = employees.filter((e) => e.active);

  // Status badge styling helper
  const getStatusBadge = (status) => {
    switch (status) {
      case 'ASSIGNED':
        return <span className="badge badge-assigned">Assigned</span>;
      case 'SWAPPED':
        return <span className="badge badge-swapped">Swapped</span>;
      case 'PENDING':
        return <span className="badge badge-pending">Pending</span>;
      case 'COLLEAGUE_APPROVED':
        return <span className="badge badge-colleague-approved">Colleague Approved</span>;
      case 'MANAGER_APPROVED':
        return <span className="badge badge-manager-approved">Manager Approved</span>;
      case 'COMPLETED':
        return <span className="badge badge-completed">Completed</span>;
      case 'REJECTED':
        return <span className="badge badge-rejected">Rejected</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  return (
    <div>
      {/* Top Banner */}
      <div className="page-header">
        <div className="page-title">
          <h2>Dashboard Overview</h2>
          <p>Real-time shift rosters, employee allocations, and pending swap requests</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={onOpenCreateSwap}>
            <ArrowLeftRight size={16} />
            <span>Request Swap</span>
          </button>
          <button className="btn btn-primary" onClick={onOpenAssignRoster}>
            <PlusCircle size={16} />
            <span>Assign Shift</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="stats-grid">
        <StatCard
          title="Total Employees"
          value={employees.length}
          icon={Users}
          color="#4f46e5"
          bg="#eef2ff"
        />
        <StatCard
          title="Total Shifts"
          value={shifts.length}
          icon={Clock}
          color="#0ea5e9"
          bg="#f0f9ff"
        />
        <StatCard
          title="Roster Assignments"
          value={rosters.length}
          icon={CalendarRange}
          color="#10b981"
          bg="#ecfdf5"
        />
        <StatCard
          title="Pending Swap Requests"
          value={pendingSwaps.length}
          icon={ArrowLeftRight}
          color="#f59e0b"
          bg="#fffbeb"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Pending Swap Requests Widget */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ArrowLeftRight size={18} color="#f59e0b" />
              Pending Swap Requests ({pendingSwaps.length})
            </h3>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setActivePage('swaps')}
            >
              View All
            </button>
          </div>

          {pendingSwaps.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#94a3b8' }}>
              <CheckCircle2 size={36} color="#10b981" style={{ margin: '0 auto 0.5rem' }} />
              <p style={{ fontWeight: 500, color: '#475569' }}>No pending swap requests</p>
              <p style={{ fontSize: '0.82rem' }}>All shift rosters are currently up to date.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {pendingSwaps.slice(0, 4).map((swap) => (
                <div
                  key={swap.id}
                  style={{
                    background: '#f8fafc',
                    padding: '0.85rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>
                      {swap.requester.name} ➔ {swap.colleague.name}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                      Reason: "{swap.reason}"
                    </div>
                  </div>
                  <div>{getStatusBadge(swap.status)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Shift Summary */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={18} color="#4f46e5" />
              Available Shift Types
            </h3>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setActivePage('shifts')}
            >
              Manage Shifts
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {shifts.slice(0, 4).map((shift) => (
              <div
                key={shift.id}
                style={{
                  background: '#f8fafc',
                  padding: '0.85rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>
                    {shift.shiftType} Shift ({shift.startTime} - {shift.endTime})
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                    📍 {shift.location} • 📅 {shift.shiftDate}
                  </div>
                </div>
                <span className={`badge badge-shift-${shift.shiftType.toLowerCase()}`}>
                  {shift.shiftType}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Current Roster Assignments Table Preview */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CalendarRange size={18} color="#10b981" />
            Current Roster Assignments Preview
          </h3>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setActivePage('roster')}
          >
            Open Full Weekly Roster
          </button>
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Shift Date</th>
                <th>Shift Type</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Location</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rosters.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                    No rosters assigned yet. Click "Assign Shift" to start.
                  </td>
                </tr>
              ) : (
                rosters.slice(0, 6).map((roster) => (
                  <tr key={roster.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{roster.employee.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{roster.employee.email}</div>
                    </td>
                    <td>{roster.shift.shiftDate}</td>
                    <td>
                      <span className={`badge badge-shift-${roster.shift.shiftType.toLowerCase()}`}>
                        {roster.shift.shiftType}
                      </span>
                    </td>
                    <td>{roster.shift.startTime}</td>
                    <td>{roster.shift.endTime}</td>
                    <td>{roster.shift.location}</td>
                    <td>{getStatusBadge(roster.status)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
