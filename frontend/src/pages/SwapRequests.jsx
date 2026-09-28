import React, { useState } from 'react';
import { 
  ArrowLeftRight, 
  PlusCircle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  UserCheck, 
  ShieldCheck, 
  Calendar, 
  MapPin,
  AlertCircle,
  Filter
} from 'lucide-react';
import Modal from '../components/Modal';
import { SwapAPI } from '../services/api';

export default function SwapRequests({ 
  swaps, 
  employees, 
  rosters, 
  currentUser, 
  onRefresh, 
  showToast,
  isModalOpen,
  setIsModalOpen 
}) {
  const [filterTab, setFilterTab] = useState('ALL');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Swap Request Form State
  const [requesterId, setRequesterId] = useState(currentUser?.id || (employees[0]?.id ?? ''));
  const [requesterRosterId, setRequesterRosterId] = useState('');
  const [colleagueId, setColleagueId] = useState('');
  const [colleagueRosterId, setColleagueRosterId] = useState('');
  const [reason, setReason] = useState('');

  const openCreateModal = () => {
    setFormError('');
    const initialReqId = currentUser?.id || (employees[0]?.id ?? '');
    setRequesterId(initialReqId);

    // Initial requester rosters
    const reqRosters = rosters.filter((r) => r.employee.id === Number(initialReqId));
    setRequesterRosterId(reqRosters[0]?.id || '');

    // Initial colleague
    const availableColleagues = employees.filter((e) => e.id !== Number(initialReqId));
    const initColId = availableColleagues[0]?.id || '';
    setColleagueId(initColId);

    const colRosters = rosters.filter((r) => r.employee.id === Number(initColId));
    setColleagueRosterId(colRosters[0]?.id || '');

    setReason('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormError('');
  };

  // When requester changes
  const handleRequesterChange = (newReqId) => {
    setRequesterId(newReqId);
    const reqRosters = rosters.filter((r) => r.employee.id === Number(newReqId));
    setRequesterRosterId(reqRosters[0]?.id || '');

    if (Number(newReqId) === Number(colleagueId)) {
      const otherColleague = employees.find((e) => e.id !== Number(newReqId));
      if (otherColleague) {
        setColleagueId(otherColleague.id);
        const colRosters = rosters.filter((r) => r.employee.id === otherColleague.id);
        setColleagueRosterId(colRosters[0]?.id || '');
      }
    }
  };

  // When colleague changes
  const handleColleagueChange = (newColId) => {
    setColleagueId(newColId);
    const colRosters = rosters.filter((r) => r.employee.id === Number(newColId));
    setColleagueRosterId(colRosters[0]?.id || '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!requesterId || !colleagueId || !requesterRosterId || !colleagueRosterId) {
      setFormError('Please select both employees and their respective roster assignments.');
      return;
    }

    if (Number(requesterId) === Number(colleagueId)) {
      setFormError('Requester and colleague cannot be the same employee.');
      return;
    }

    if (!reason.trim()) {
      setFormError('Please provide a reason for the shift swap request.');
      return;
    }

    try {
      setIsSubmitting(true);
      await SwapAPI.create({
        requesterId: Number(requesterId),
        colleagueId: Number(colleagueId),
        requesterRosterId: Number(requesterRosterId),
        colleagueRosterId: Number(colleagueRosterId),
        reason: reason.trim(),
      });
      showToast('success', 'Shift swap request submitted successfully! Awaiting colleague and manager approval.');
      closeModal();
      onRefresh();
    } catch (err) {
      setFormError(err.message || 'Failed to submit swap request.');
      showToast('error', err.message || 'Failed to submit swap request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Action Handlers
  const handleColleagueApprove = async (swap) => {
    try {
      // Pass currentUser.id to test Rule 7 (only designated colleague can approve)
      await SwapAPI.colleagueApprove(swap.id, currentUser?.id);
      showToast('success', `Colleague approval granted for Swap #${swap.id}.`);
      onRefresh();
    } catch (err) {
      showToast('error', err.message || 'Failed to approve swap as colleague.');
    }
  };

  const handleColleagueReject = async (swap) => {
    try {
      await SwapAPI.colleagueReject(swap.id, currentUser?.id);
      showToast('info', `Swap #${swap.id} rejected by colleague. Roster remained unchanged.`);
      onRefresh();
    } catch (err) {
      showToast('error', err.message || 'Failed to reject swap as colleague.');
    }
  };

  const handleManagerApprove = async (swap) => {
    try {
      await SwapAPI.managerApprove(swap.id);
      showToast('success', `Manager approval granted for Swap #${swap.id}. ${swap.colleagueApproved ? 'Swap COMPLETED! Rosters updated.' : 'Awaiting colleague approval.'}`);
      onRefresh();
    } catch (err) {
      showToast('error', err.message || 'Failed to approve swap as manager.');
    }
  };

  const handleManagerReject = async (swap) => {
    try {
      await SwapAPI.managerReject(swap.id);
      showToast('info', `Swap #${swap.id} rejected by manager. Roster remained unchanged.`);
      onRefresh();
    } catch (err) {
      showToast('error', err.message || 'Failed to reject swap as manager.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <span className="badge badge-pending">PENDING</span>;
      case 'COLLEAGUE_APPROVED':
        return <span className="badge badge-colleague-approved">COLLEAGUE APPROVED</span>;
      case 'MANAGER_APPROVED':
        return <span className="badge badge-manager-approved">MANAGER APPROVED</span>;
      case 'COMPLETED':
        return <span className="badge badge-completed">COMPLETED</span>;
      case 'REJECTED':
        return <span className="badge badge-rejected">REJECTED</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  const filteredSwaps = swaps.filter((swap) => {
    if (filterTab === 'PENDING') return swap.status === 'PENDING' || swap.status === 'COLLEAGUE_APPROVED';
    if (filterTab === 'COMPLETED') return swap.status === 'COMPLETED';
    if (filterTab === 'REJECTED') return swap.status === 'REJECTED';
    if (filterTab === 'MY_SWAPS' && currentUser) {
      return swap.requester.id === currentUser.id || swap.colleague.id === currentUser.id;
    }
    return true;
  });

  const requesterRosterOptions = rosters.filter((r) => r.employee.id === Number(requesterId));
  const colleagueRosterOptions = rosters.filter((r) => r.employee.id === Number(colleagueId));

  const selectedRequesterRoster = rosters.find((r) => r.id === Number(requesterRosterId));
  const selectedColleagueRoster = rosters.find((r) => r.id === Number(colleagueRosterId));

  return (
    <div>
      <div className="page-header">
        <div className="page-title">
          <h2>Shift Swap Requests</h2>
          <p>Request roster exchanges with colleague approval and manager authorization</p>
        </div>
        <button className="btn btn-primary" onClick={openCreateModal}>
          <PlusCircle size={16} />
          <span>New Swap Request</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '0.75rem 1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            className={`btn btn-sm ${filterTab === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilterTab('ALL')}
          >
            All Requests ({swaps.length})
          </button>
          <button
            className={`btn btn-sm ${filterTab === 'PENDING' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilterTab('PENDING')}
          >
            Pending Action ({swaps.filter((s) => s.status === 'PENDING' || s.status === 'COLLEAGUE_APPROVED').length})
          </button>
          <button
            className={`btn btn-sm ${filterTab === 'COMPLETED' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilterTab('COMPLETED')}
          >
            Completed ({swaps.filter((s) => s.status === 'COMPLETED').length})
          </button>
          <button
            className={`btn btn-sm ${filterTab === 'REJECTED' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilterTab('REJECTED')}
          >
            Rejected ({swaps.filter((s) => s.status === 'REJECTED').length})
          </button>
          {currentUser && (
            <button
              className={`btn btn-sm ${filterTab === 'MY_SWAPS' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilterTab('MY_SWAPS')}
            >
              My Requests ({swaps.filter((s) => s.requester.id === currentUser.id || s.colleague.id === currentUser.id).length})
            </button>
          )}
        </div>
      </div>

      {/* Swap Requests List */}
      <div>
        {filteredSwaps.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
            <ArrowLeftRight size={48} color="#cbd5e1" style={{ margin: '0 auto 1rem' }} />
            <h4 style={{ color: '#475569', fontSize: '1.1rem' }}>No swap requests found</h4>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem', marginTop: '0.25rem' }}>
              Click "New Swap Request" to submit a shift trade.
            </p>
          </div>
        ) : (
          filteredSwaps.map((swap) => {
            const isCompleted = swap.status === 'COMPLETED';
            const isRejected = swap.status === 'REJECTED';
            const isFinalized = isCompleted || isRejected;

            return (
              <div key={swap.id} className="swap-card">
                {/* Header */}
                <div className="swap-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#1e293b' }}>
                      Swap Request #{swap.id}
                    </span>
                    {getStatusBadge(swap.status)}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    Requested: {new Date(swap.requestedAt).toLocaleString()}
                  </div>
                </div>

                {/* Swap Comparison Box */}
                <div className="swap-comparison">
                  {/* Requester Shift */}
                  <div className="swap-party">
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                      Requester
                    </span>
                    <div className="swap-party-name">
                      <UserCheck size={16} color="#4f46e5" />
                      {swap.requester.name} ({swap.requester.role})
                    </div>
                    <div className="swap-party-shift">
                      <strong>📅 {swap.requesterRoster?.shift?.shiftDate}</strong> • {swap.requesterRoster?.shift?.startTime} - {swap.requesterRoster?.shift?.endTime}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      Type: {swap.requesterRoster?.shift?.shiftType} | 📍 {swap.requesterRoster?.shift?.location}
                    </div>
                  </div>

                  {/* Swap Icon */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: isCompleted ? '#ecfdf5' : '#eef2ff',
                        color: isCompleted ? '#10b981' : '#4f46e5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <ArrowLeftRight size={20} />
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px', fontWeight: 600 }}>
                      {isCompleted ? 'SWAPPED' : 'EXCHANGE'}
                    </span>
                  </div>

                  {/* Colleague Shift */}
                  <div className="swap-party">
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                      Colleague
                    </span>
                    <div className="swap-party-name">
                      <UserCheck size={16} color="#0ea5e9" />
                      {swap.colleague.name} ({swap.colleague.role})
                    </div>
                    <div className="swap-party-shift">
                      <strong>📅 {swap.colleagueRoster?.shift?.shiftDate}</strong> • {swap.colleagueRoster?.shift?.startTime} - {swap.colleagueRoster?.shift?.endTime}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      Type: {swap.colleagueRoster?.shift?.shiftType} | 📍 {swap.colleagueRoster?.shift?.location}
                    </div>
                  </div>
                </div>

                {/* Reason & Approval Checklist */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem', fontSize: '0.88rem' }}>
                  <div>
                    <span style={{ fontWeight: 600, color: '#475569' }}>Reason: </span>
                    <span style={{ fontStyle: 'italic', color: '#334155' }}>"{swap.reason}"</span>
                  </div>

                  {/* Approval Badges */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem' }}>
                      {swap.colleagueApproved ? (
                        <CheckCircle size={15} color="#10b981" />
                      ) : (
                        <Clock size={15} color="#f59e0b" />
                      )}
                      <span style={{ color: swap.colleagueApproved ? '#166534' : '#92400e', fontWeight: 500 }}>
                        Colleague: {swap.colleagueApproved ? 'Approved' : 'Pending'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem' }}>
                      {swap.managerApproved ? (
                        <CheckCircle size={15} color="#10b981" />
                      ) : (
                        <Clock size={15} color="#f59e0b" />
                      )}
                      <span style={{ color: swap.managerApproved ? '#166534' : '#92400e', fontWeight: 500 }}>
                        Manager: {swap.managerApproved ? 'Approved' : 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Interactive Action Buttons */}
                {!isFinalized && (
                  <div className="swap-actions">
                    {/* Colleague Actions */}
                    {!swap.colleagueApproved && (
                      <>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleColleagueReject(swap)}
                          style={{ color: '#ef4444' }}
                          title="Reject swap as colleague"
                        >
                          <XCircle size={14} />
                          <span>Reject (Colleague)</span>
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleColleagueApprove(swap)}
                          style={{ color: '#0ea5e9' }}
                          title="Approve swap as colleague"
                        >
                          <CheckCircle size={14} />
                          <span>Approve (Colleague)</span>
                        </button>
                      </>
                    )}

                    {/* Manager Actions */}
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleManagerReject(swap)}
                      style={{ color: '#dc2626' }}
                      title="Manager reject swap"
                    >
                      <XCircle size={14} />
                      <span>Manager Reject</span>
                    </button>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleManagerApprove(swap)}
                      title="Manager final approval"
                    >
                      <ShieldCheck size={14} />
                      <span>Manager Approve {swap.colleagueApproved ? '(Finalize)' : ''}</span>
                    </button>
                  </div>
                )}

                {isCompleted && (
                  <div
                    style={{
                      background: '#f0fdf4',
                      color: '#15803d',
                      padding: '0.6rem 1rem',
                      borderRadius: '6px',
                      fontSize: '0.82rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginTop: '0.75rem',
                    }}
                  >
                    <CheckCircle size={16} />
                    <span>
                      Both colleague and manager approved! Rosters have been successfully swapped in the database on{' '}
                      {swap.approvedAt ? new Date(swap.approvedAt).toLocaleString() : 'recently'}.
                    </span>
                  </div>
                )}

                {isRejected && (
                  <div
                    style={{
                      background: '#fef2f2',
                      color: '#991b1b',
                      padding: '0.6rem 1rem',
                      borderRadius: '6px',
                      fontSize: '0.82rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginTop: '0.75rem',
                    }}
                  >
                    <XCircle size={16} />
                    <span>This swap request was rejected. The weekly roster was NOT modified.</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* New Swap Request Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title="Submit Shift Swap Request"
        maxWidth="640px"
      >
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
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <div>{formError}</div>
            </div>
          )}

          {/* Requester Selection */}
          <div className="card" style={{ padding: '1rem', marginBottom: '1rem', background: '#f8fafc' }}>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 600, marginBottom: '0.75rem', color: '#1e293b' }}>
              1. Requester (Who is requesting the trade?)
            </h4>
            <div className="form-row">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Employee *</label>
                <select
                  className="form-control"
                  value={requesterId}
                  onChange={(e) => handleRequesterChange(e.target.value)}
                  required
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id} disabled={!emp.active}>
                      {emp.name} ({emp.role}) {!emp.active ? '[Inactive]' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Requester's Current Shift *</label>
                <select
                  className="form-control"
                  value={requesterRosterId}
                  onChange={(e) => setRequesterRosterId(e.target.value)}
                  required
                >
                  <option value="" disabled>-- Select Assigned Shift --</option>
                  {requesterRosterOptions.length === 0 ? (
                    <option value="" disabled>No shifts assigned to this employee</option>
                  ) : (
                    requesterRosterOptions.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.shift.shiftDate} | {r.shift.shiftType} ({r.shift.startTime} - {r.shift.endTime})
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* Colleague Selection */}
          <div className="card" style={{ padding: '1rem', marginBottom: '1rem', background: '#f8fafc' }}>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 600, marginBottom: '0.75rem', color: '#1e293b' }}>
              2. Colleague (Who are you swapping with?)
            </h4>
            <div className="form-row">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Colleague *</label>
                <select
                  className="form-control"
                  value={colleagueId}
                  onChange={(e) => handleColleagueChange(e.target.value)}
                  required
                >
                  <option value="" disabled>-- Select Colleague --</option>
                  {employees
                    .filter((emp) => emp.id !== Number(requesterId))
                    .map((emp) => (
                      <option key={emp.id} value={emp.id} disabled={!emp.active}>
                        {emp.name} ({emp.role}) {!emp.active ? '[Inactive]' : ''}
                      </option>
                    ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Colleague's Shift *</label>
                <select
                  className="form-control"
                  value={colleagueRosterId}
                  onChange={(e) => setColleagueRosterId(e.target.value)}
                  required
                >
                  <option value="" disabled>-- Select Assigned Shift --</option>
                  {colleagueRosterOptions.length === 0 ? (
                    <option value="" disabled>No shifts assigned to this colleague</option>
                  ) : (
                    colleagueRosterOptions.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.shift.shiftDate} | {r.shift.shiftType} ({r.shift.startTime} - {r.shift.endTime})
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* Swap Preview Box */}
          {selectedRequesterRoster && selectedColleagueRoster && (
            <div
              style={{
                background: '#eef2ff',
                border: '1px solid #c7d2fe',
                borderRadius: '8px',
                padding: '0.85rem 1rem',
                marginBottom: '1rem',
                fontSize: '0.85rem',
              }}
            >
              <div style={{ fontWeight: 600, color: '#3730a3', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ArrowLeftRight size={14} /> Proposed Swap Exchange:
              </div>
              <div style={{ color: '#4338ca' }}>
                • <strong>{selectedRequesterRoster.employee.name}</strong> will take: {selectedColleagueRoster.shift.shiftDate} ({selectedColleagueRoster.shift.startTime} - {selectedColleagueRoster.shift.endTime})
              </div>
              <div style={{ color: '#4338ca' }}>
                • <strong>{selectedColleagueRoster.employee.name}</strong> will take: {selectedRequesterRoster.shift.shiftDate} ({selectedRequesterRoster.shift.startTime} - {selectedRequesterRoster.shift.endTime})
              </div>
            </div>
          )}

          {/* Reason */}
          <div className="form-group">
            <label className="form-label">Reason for Swap Request *</label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="e.g. Urgent family commitment on Monday morning; available for Tuesday shift instead."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
          </div>

          <div className="modal-footer" style={{ margin: '1.5rem -1.5rem -1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={closeModal}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting Swap...' : 'Submit Swap Request'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
