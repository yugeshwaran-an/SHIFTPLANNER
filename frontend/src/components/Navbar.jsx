import React from 'react';
import { 
  CalendarDays, 
  Users, 
  Clock, 
  CalendarRange, 
  ArrowLeftRight, 
  LayoutDashboard,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

export default function Navbar({ activePage, setActivePage, currentUser, setCurrentUser, employees }) {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <a href="#dashboard" className="brand" onClick={(e) => { e.preventDefault(); setActivePage('dashboard'); }}>
          <div className="brand-icon">
            <CalendarDays size={20} />
          </div>
          <div className="brand-text">
            <h1>SHIFTPLANNER</h1>
            <span>Roster & Swap Manager</span>
          </div>
        </a>

        {/* Navigation Tabs */}
        <nav className="nav-links">
          <button
            className={`nav-link ${activePage === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActivePage('dashboard')}
          >
            <LayoutDashboard size={16} />
            <span>Dashboard</span>
          </button>

          <button
            className={`nav-link ${activePage === 'employees' ? 'active' : ''}`}
            onClick={() => setActivePage('employees')}
          >
            <Users size={16} />
            <span>Employees</span>
          </button>

          <button
            className={`nav-link ${activePage === 'shifts' ? 'active' : ''}`}
            onClick={() => setActivePage('shifts')}
          >
            <Clock size={16} />
            <span>Shifts</span>
          </button>

          <button
            className={`nav-link ${activePage === 'roster' ? 'active' : ''}`}
            onClick={() => setActivePage('roster')}
          >
            <CalendarRange size={16} />
            <span>Weekly Roster</span>
          </button>

          <button
            className={`nav-link ${activePage === 'swaps' ? 'active' : ''}`}
            onClick={() => setActivePage('swaps')}
          >
            <ArrowLeftRight size={16} />
            <span>Swap Requests</span>
          </button>
        </nav>

        {/* User Role Simulation Dropdown */}
        <div className="role-switcher-box" title="Simulate actions as a specific Employee or Manager">
          <label htmlFor="user-select">
            {currentUser?.role === 'MANAGER' ? (
              <ShieldCheck size={14} style={{ color: '#a855f7', display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
            ) : (
              <UserCheck size={14} style={{ color: '#10b981', display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
            )}
            Active Role:
          </label>
          <select
            id="user-select"
            value={currentUser?.id || ''}
            onChange={(e) => {
              const selectedId = Number(e.target.value);
              const found = employees.find((emp) => emp.id === selectedId);
              if (found) setCurrentUser(found);
            }}
          >
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name} ({emp.role})
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
}
