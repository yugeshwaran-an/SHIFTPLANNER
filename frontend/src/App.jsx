import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import AlertToast from './components/AlertToast';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Shifts from './pages/Shifts';
import WeeklyRoster from './pages/WeeklyRoster';
import SwapRequests from './pages/SwapRequests';
import { EmployeeAPI, ShiftAPI, RosterAPI, SwapAPI } from './services/api';
import { RefreshCw, ServerCrash, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [employees, setEmployees] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [rosters, setRosters] = useState([]);
  const [swaps, setSwaps] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [backendError, setBackendError] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Modal triggers from Dashboard quick actions
  const [isAssignRosterOpen, setIsAssignRosterOpen] = useState(false);
  const [isCreateSwapOpen, setIsCreateSwapOpen] = useState(false);

  const showToast = useCallback((type, message, title = '') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message, title }]);

    // Auto dismiss after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch all core data from Spring Boot backend
  const fetchAllData = useCallback(async (isInitial = false) => {
    if (isInitial) setIsLoading(true);
    setBackendError(null);

    try {
      const [empData, shiftData, rosterData, swapData] = await Promise.all([
        EmployeeAPI.getAll(),
        ShiftAPI.getAll(),
        RosterAPI.getAll(),
        SwapAPI.getAll(),
      ]);

      setEmployees(empData || []);
      setShifts(shiftData || []);
      setRosters(rosterData || []);
      setSwaps(swapData || []);

      // If no currentUser set yet, default to first manager or first employee
      setCurrentUser((prev) => {
        if (prev && empData.some((e) => e.id === prev.id)) {
          return empData.find((e) => e.id === prev.id);
        }
        const manager = empData.find((e) => e.role === 'MANAGER');
        return manager || empData[0] || null;
      });
    } catch (err) {
      console.error('Error fetching backend data:', err);
      setBackendError(
        'Cannot connect to Spring Boot backend at http://localhost:8080. Please ensure the backend is running with "mvn spring-boot:run".'
      );
    } finally {
      if (isInitial) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData(true);
  }, [fetchAllData]);

  return (
    <div className="app-container">
      {/* Toast Alert System */}
      <AlertToast toasts={toasts} onDismiss={dismissToast} />

      {/* Navigation Bar */}
      <Navbar
        activePage={activePage}
        setActivePage={setActivePage}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        employees={employees}
      />

      {/* Backend Disconnection Banner */}
      {backendError && (
        <div
          style={{
            background: '#fff1f2',
            borderBottom: '1px solid #fecdd3',
            color: '#9f1239',
            padding: '0.85rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.88rem',
            position: 'sticky',
            top: '60px',
            zIndex: 35,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ServerCrash size={18} />
            <span>{backendError}</span>
          </div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => fetchAllData(false)}
            style={{ borderColor: '#fca5a5', color: '#9f1239' }}
          >
            <RefreshCw size={14} /> Retry Connection
          </button>
        </div>
      )}

      {/* Main Page Content */}
      <main className="main-content">
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '6rem 1rem' }}>
            <RefreshCw
              size={36}
              color="#4f46e5"
              style={{ animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}
            />
            <p style={{ fontWeight: 600, color: '#475569' }}>Loading ShiftPlanner Data...</p>
            <p style={{ fontSize: '0.84rem', color: '#94a3b8' }}>
              Connecting to Spring Boot backend at http://localhost:8080
            </p>
            <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
          </div>
        ) : (
          <>
            {activePage === 'dashboard' && (
              <Dashboard
                employees={employees}
                shifts={shifts}
                rosters={rosters}
                swaps={swaps}
                setActivePage={setActivePage}
                onOpenAssignRoster={() => {
                  setActivePage('roster');
                  setIsAssignRosterOpen(true);
                }}
                onOpenCreateSwap={() => {
                  setActivePage('swaps');
                  setIsCreateSwapOpen(true);
                }}
              />
            )}

            {activePage === 'employees' && (
              <Employees
                employees={employees}
                onRefresh={fetchAllData}
                showToast={showToast}
              />
            )}

            {activePage === 'shifts' && (
              <Shifts
                shifts={shifts}
                onRefresh={fetchAllData}
                showToast={showToast}
              />
            )}

            {activePage === 'roster' && (
              <WeeklyRoster
                rosters={rosters}
                employees={employees}
                shifts={shifts}
                onRefresh={fetchAllData}
                showToast={showToast}
                isModalOpen={isAssignRosterOpen}
                setIsModalOpen={setIsAssignRosterOpen}
              />
            )}

            {activePage === 'swaps' && (
              <SwapRequests
                swaps={swaps}
                employees={employees}
                rosters={rosters}
                currentUser={currentUser}
                onRefresh={fetchAllData}
                showToast={showToast}
                isModalOpen={isCreateSwapOpen}
                setIsModalOpen={setIsCreateSwapOpen}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid #e2e8f0',
          background: '#ffffff',
          padding: '1.25rem 1.5rem',
          textAlign: 'center',
          fontSize: '0.82rem',
          color: '#64748b',
          marginTop: 'auto',
        }}
      >
        <p>
          <strong>SHIFTPLANNER</strong> – Employee Shift Roster & Swap Request System
        </p>
        <p style={{ marginTop: '0.2rem', color: '#94a3b8' }}>
          Spring Boot 3.3.4 (Java 21) REST API + React & Vite Frontend + MySQL Database
        </p>
      </footer>
    </div>
  );
}
