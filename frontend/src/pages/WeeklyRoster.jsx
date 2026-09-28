import React, { useState } from 'react';
import { 
  CalendarRange, 
  PlusCircle, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  Calendar,
  AlertTriangle,
  User,
  Clock,
  Filter
} from 'lucide-react';
import Modal from '../components/Modal';
import { RosterAPI } from '../services/api';

export default function WeeklyRoster({ 
  rosters, 
  employees, 
  shifts, 
  onRefresh, 
  showToast,
  isModalOpen,
  setIsModalOpen 
}) {
  const [selectedEmployeeFilter, setSelectedEmployeeFilter] = useState('ALL');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Calculate Monday of current week
  const getMonday = (d) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
  };

  const [currentWeekMonday, setCurrentWeekMonday] = useState(() => {
    const monday = getMonday(new Date());
    return monday.toISOString().split('T')[0];
  });

  // Assign Modal Form State
  const [formData, setFormData] = useState({
    employeeId: '',
    shiftId: '',
    weekStartDate: currentWeekMonday,
  });

  const changeWeek = (offsetDays) => {
    const cur = new Date(currentWeekMonday);
    cur.setDate(cur.getDate() + offsetDays);
    const nextMonday = getMonday(cur);
    setCurrentWeekMonday(nextMonday.toISOString().split('T')[0]);
  };

  const openAssignModal = () => {
    setFormError('');
    setFormData({
      employeeId: employees.length > 0 ? employees[0].id : '',
      shiftId: shifts.length > 0 ? shifts[0].id : '',
      weekStartDate: currentWeekMonday,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormError('');
  };

  const handleShiftSelect = (shiftId) => {
    const selected = shifts.find((s) => s.id === Number(shiftId));
    if (selected) {
      const shiftDateObj = new Date(selected.shiftDate);
      const calculatedMonday = getMonday(shiftDateObj).toISOString().split('T')[0];
      setFormData((prev) => ({
        ...prev,
        shiftId,
        weekStartDate: calculatedMonday,
      }));
    } else {
      setFormData((prev) => ({ ...prev, shiftId }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.employeeId || !formData.shiftId || !formData.weekStartDate) {
      setFormError('Please select both an employee and a shift.');
      return;
    }

    try {
      setIsSubmitting(true);
      await RosterAPI.create({
        employeeId: Number(formData.employeeId),
        shiftId: Number(formData.shiftId),
        weekStartDate: formData.weekStartDate,
        status: 'ASSIGNED',
      });
      showToast('success', 'Roster assignment created successfully!');
      closeModal();
      onRefresh();
    } catch (err) {
      // Catch Rule 2 overlapping shift error:
      // "Employee already has an overlapping shift on this date."
      const msg = err.message || 'Failed to assign roster.';
      setFormError(msg);
      showToast('error', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (roster) => {
    if (window.confirm(`Remove shift assignment for ${roster.employee.name} on ${roster.shift.shiftDate}?`)) {
      try {
        await RosterAPI.delete(roster.id);
        showToast('info', `Roster assignment #${roster.id} deleted.`);
        onRefresh();
      } catch (err) {
        showToast('error', err.message || 'Cannot delete roster assignment.');
      }
    }
  };

  // Filter rosters by selected employee
  const filteredRosters = rosters.filter((roster) => {
    const matchesEmp =
      selectedEmployeeFilter === 'ALL' ||
      roster.employee.id === Number(selectedEmployeeFilter);
    return matchesEmp;
  });

  return (
    <div>
      <div className="page-header">
        <div className="page-title">
          <h2>Weekly Roster</h2>
          <p>Assign employees to shifts and maintain overlapping shift validation</p>
        </div>
        <button className="btn btn-primary" onClick={openAssignModal}>
          <PlusCircle size={16} />
          <span>Assign Shift to Employee</span>
        </button>
      </div>

      {/* Roster Controls: Week Switcher & Employee Filter */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          {/* Week Stepper */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => changeWeek(-7)} title="Previous week">
              <ChevronLeft size={16} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.92rem' }}>
              <Calendar size={16} color="#4f46e5" />
              <span>Week Starting: <strong>{currentWeekMonday}</strong></span>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => changeWeek(7)} title="Next week">
              <ChevronRight size={16} />
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setCurrentWeekMonday(getMonday(new Date()).toISOString().split('T')[0])}
            >
              Current Week
            </button>
          </div>

          {/* Filter by Employee */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={16} color="#64748b" />
            <label style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 500 }}>Filter Employee:</label>
            <select
              className="form-control"
              style={{ width: 'auto' }}
              value={selectedEmployeeFilter}
              onChange={(e) => setSelectedEmployeeFilter(e.target.value)}
            >
              <option value="ALL">All Employees</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.role})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Roster Table */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Date</th>
              <th>Shift</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Location</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRosters.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                  No roster assignments found. Click "Assign Shift to Employee" to add one.
                </td>
              </tr>
            ) : (
              filteredRosters.map((roster) => (
                <tr key={roster.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          backgroundColor: roster.employee.role === 'MANAGER' ? '#fdf2f8' : '#eef2ff',
                          color: roster.employee.role === 'MANAGER' ? '#9d174d' : '#4f46e5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                        }}
                      >
                        {roster.employee.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{roster.employee.name}</div>
                        <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{roster.employee.role}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontWeight: 500 }}>{roster.shift.shiftDate}</td>
                  <td>
                    <span className={`badge badge-shift-${roster.shift.shiftType.toLowerCase()}`}>
                      {roster.shift.shiftType}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}>{roster.shift.startTime}</td>
                  <td style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}>{roster.shift.endTime}</td>
                  <td style={{ color: '#475569', fontSize: '0.82rem' }}>{roster.shift.location}</td>
                  <td>
                    <span className={`badge ${roster.status === 'SWAPPED' ? 'badge-swapped' : 'badge-assigned'}`}>
                      {roster.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleDelete(roster)}
                      title="Delete roster assignment"
                      style={{ color: '#ef4444' }}
                    >
                      <Trash2 size={14} />
                      <span>Remove</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Assign Shift to Employee Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title="Assign Shift to Employee">
        <form onSubmit={handleSubmit}>
          {formError && (
            <div
              style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#991b1b',
                padding: '0.85rem 1rem',
                borderRadius: '8px',
                marginBottom: '1.25rem',
                fontSize: '0.88rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
              }}
            >
              <AlertTriangle size={18} style={{ flexShrink: 0 }} />
              <div>
                <strong>Overlapping Shift / Business Rule Alert:</strong>
                <div>{formError}</div>
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Select Employee *</label>
            <select
              className="form-control"
              value={formData.employeeId}
              onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
              required
            >
              <option value="" disabled>-- Select Employee --</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id} disabled={!emp.active}>
                  {emp.name} ({emp.role}) {!emp.active ? '[Inactive]' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Select Shift *</label>
            <select
              className="form-control"
              value={formData.shiftId}
              onChange={(e) => handleShiftSelect(e.target.value)}
              required
            >
              <option value="" disabled>-- Select Shift --</option>
              {shifts.map((shift) => (
                <option key={shift.id} value={shift.id}>
                  {shift.shiftDate} | {shift.shiftType} ({shift.startTime} - {shift.endTime}) @ {shift.location}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Week Start Date (Monday) *</label>
            <input
              type="date"
              className="form-control"
              value={formData.weekStartDate}
              onChange={(e) => setFormData({ ...formData, weekStartDate: e.target.value })}
              required
            />
          </div>

          <div className="modal-footer" style={{ margin: '1.5rem -1.5rem -1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={closeModal}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Validating & Assigning...' : 'Assign Shift'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
