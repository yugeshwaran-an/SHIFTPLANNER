import React, { useState } from 'react';
import { 
  Clock, 
  PlusCircle, 
  MapPin, 
  Calendar, 
  Trash2, 
  Search,
  Filter
} from 'lucide-react';
import Modal from '../components/Modal';
import { ShiftAPI } from '../services/api';

export default function Shifts({ shifts, onRefresh, showToast }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const todayStr = new Date().toISOString().split('T')[0];
  const [formData, setFormData] = useState({
    shiftDate: todayStr,
    startTime: '09:00',
    endTime: '17:00',
    shiftType: 'Morning',
    location: 'Main Retail Floor',
  });

  const openAddModal = () => {
    setFormData({
      shiftDate: todayStr,
      startTime: '09:00',
      endTime: '17:00',
      shiftType: 'Morning',
      location: 'Main Retail Floor',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.shiftDate || !formData.startTime || !formData.endTime || !formData.shiftType || !formData.location) {
      showToast('error', 'All fields are required to create a shift.');
      return;
    }

    if (formData.startTime >= formData.endTime) {
      showToast('error', `Start time (${formData.startTime}) must be strictly before end time (${formData.endTime}).`);
      return;
    }

    try {
      setIsSubmitting(true);
      await ShiftAPI.create({
        ...formData,
        startTime: formData.startTime.length === 5 ? `${formData.startTime}:00` : formData.startTime,
        endTime: formData.endTime.length === 5 ? `${formData.endTime}:00` : formData.endTime,
      });
      showToast('success', `${formData.shiftType} shift created successfully for ${formData.shiftDate}.`);
      closeModal();
      onRefresh();
    } catch (err) {
      showToast('error', err.message || 'Failed to create shift.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (shift) => {
    if (window.confirm(`Delete shift "${shift.shiftType}" on ${shift.shiftDate}?`)) {
      try {
        await ShiftAPI.delete(shift.id);
        showToast('info', `Shift #${shift.id} deleted.`);
        onRefresh();
      } catch (err) {
        showToast('error', err.message || 'Cannot delete shift because it is currently assigned to a roster.');
      }
    }
  };

  const filteredShifts = shifts.filter((shift) => {
    const matchesSearch =
      shift.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shift.shiftType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shift.shiftDate.includes(searchTerm);
    const matchesType = typeFilter === 'ALL' || shift.shiftType.toUpperCase() === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div>
      <div className="page-header">
        <div className="page-title">
          <h2>Shift Management</h2>
          <p>Define operational shift timings, types (Morning, Evening, Night), and workplace locations</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <PlusCircle size={16} />
          <span>Create New Shift</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="search-input" style={{ position: 'relative', flex: 1, maxWidth: '320px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            className="form-control"
            placeholder="Search by date, location, or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '2.4rem' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={16} color="#64748b" />
          <select
            className="form-control"
            style={{ width: 'auto' }}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="ALL">All Shift Types</option>
            <option value="MORNING">Morning Shifts</option>
            <option value="EVENING">Evening Shifts</option>
            <option value="NIGHT">Night Shifts</option>
          </select>
        </div>

        <div style={{ fontSize: '0.85rem', color: '#64748b', marginLeft: 'auto' }}>
          Showing <strong>{filteredShifts.length}</strong> of <strong>{shifts.length}</strong> shifts
        </div>
      </div>

      {/* Shifts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {filteredShifts.length === 0 ? (
          <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}>
            <Clock size={40} color="#cbd5e1" style={{ margin: '0 auto 1rem' }} />
            <h4 style={{ color: '#475569' }}>No shifts match your filter criteria</h4>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>Create a shift using the button above.</p>
          </div>
        ) : (
          filteredShifts.map((shift) => (
            <div key={shift.id} className="card" style={{ position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <span className={`badge badge-shift-${shift.shiftType.toLowerCase()}`}>
                  {shift.shiftType}
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8' }}>
                  #{shift.id}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Clock size={18} color="#4f46e5" />
                <span style={{ fontSize: '1.15rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
                  {shift.startTime} – {shift.endTime}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.75rem', fontSize: '0.85rem', color: '#64748b' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Calendar size={14} color="#94a3b8" />
                  <span>Date: <strong>{shift.shiftDate}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <MapPin size={14} color="#94a3b8" />
                  <span>Location: {shift.location}</span>
                </div>
              </div>

              <div style={{ marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleDelete(shift)}
                  title="Delete shift"
                  style={{ color: '#ef4444' }}
                >
                  <Trash2 size={14} />
                  <span>Delete Shift</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Shift Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title="Create Operational Shift">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Shift Date *</label>
            <input
              type="date"
              className="form-control"
              value={formData.shiftDate}
              onChange={(e) => setFormData({ ...formData, shiftDate: e.target.value })}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Start Time *</label>
              <input
                type="time"
                className="form-control"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">End Time *</label>
              <input
                type="time"
                className="form-control"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Shift Type *</label>
            <select
              className="form-control"
              value={formData.shiftType}
              onChange={(e) => {
                const type = e.target.value;
                let start = '09:00';
                let end = '17:00';
                if (type === 'Evening') {
                  start = '14:00';
                  end = '22:00';
                } else if (type === 'Night') {
                  start = '18:00';
                  end = '23:30';
                }
                setFormData({ ...formData, shiftType: type, startTime: start, endTime: end });
              }}
            >
              <option value="Morning">Morning (e.g. 09:00 - 17:00)</option>
              <option value="Evening">Evening (e.g. 14:00 - 22:00)</option>
              <option value="Night">Night (e.g. 18:00 - 23:30)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Location / Department *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Retail Store Floor 1, Assembly Unit 3"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              required
            />
          </div>

          <div className="modal-footer" style={{ margin: '1.5rem -1.5rem -1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={closeModal}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Creating Shift...' : 'Create Shift'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
