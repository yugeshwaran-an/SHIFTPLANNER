import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Search,
  Mail,
  Shield,
  UserCheck
} from 'lucide-react';
import Modal from '../components/Modal';
import { EmployeeAPI } from '../services/api';

export default function Employees({ employees, onRefresh, showToast }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'EMPLOYEE',
    active: true,
  });

  const openAddModal = () => {
    setEditingEmployee(null);
    setFormData({ name: '', email: '', role: 'EMPLOYEE', active: true });
    setIsModalOpen(true);
  };

  const openEditModal = (emp) => {
    setEditingEmployee(emp);
    setFormData({
      name: emp.name,
      email: emp.email,
      role: emp.role,
      active: emp.active,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEmployee(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      showToast('error', 'Please provide employee name and email.');
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingEmployee) {
        await EmployeeAPI.update(editingEmployee.id, formData);
        showToast('success', `Employee "${formData.name}" updated successfully.`);
      } else {
        await EmployeeAPI.create(formData);
        showToast('success', `Employee "${formData.name}" created successfully.`);
      }
      closeModal();
      onRefresh();
    } catch (err) {
      showToast('error', err.message || 'Failed to save employee.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (emp) => {
    try {
      await EmployeeAPI.toggleActive(emp.id);
      showToast('info', `Status for "${emp.name}" changed to ${!emp.active ? 'Active' : 'Inactive'}.`);
      onRefresh();
    } catch (err) {
      showToast('error', err.message || 'Failed to toggle employee status.');
    }
  };

  const handleDelete = async (emp) => {
    if (window.confirm(`Deactivate employee "${emp.name}"? Historical roster records will be preserved.`)) {
      try {
        await EmployeeAPI.delete(emp.id);
        showToast('info', `Employee "${emp.name}" deactivated.`);
        onRefresh();
      } catch (err) {
        showToast('error', err.message || 'Failed to delete/deactivate employee.');
      }
    }
  };

  const filteredEmployees = employees.filter((emp) =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div className="page-title">
          <h2>Employee Directory</h2>
          <p>Manage retail/manufacturing staff members, roles, and active availability</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <UserPlus size={16} />
          <span>Add Employee</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="filter-bar">
        <div className="search-input" style={{ position: 'relative', flex: 1, maxWidth: '360px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            className="form-control"
            placeholder="Search employees by name, email, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '2.4rem' }}
          />
        </div>
        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
          Showing <strong>{filteredEmployees.length}</strong> of <strong>{employees.length}</strong> employees
        </div>
      </div>

      {/* Employee Table */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8' }}>
                  No employees found matching your search.
                </td>
              </tr>
            ) : (
              filteredEmployees.map((emp) => (
                <tr key={emp.id}>
                  <td style={{ fontWeight: 600, color: '#64748b' }}>#{emp.id}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div
                        style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '50%',
                          backgroundColor: emp.role === 'MANAGER' ? '#fdf2f8' : '#eef2ff',
                          color: emp.role === 'MANAGER' ? '#9d174d' : '#4f46e5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                        }}
                      >
                        {emp.name.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 600 }}>{emp.name}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#475569' }}>
                      <Mail size={14} color="#94a3b8" />
                      {emp.email}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${emp.role === 'MANAGER' ? 'badge-manager' : 'badge-employee'}`}>
                      {emp.role === 'MANAGER' ? <Shield size={12} /> : <UserCheck size={12} />}
                      {emp.role}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => handleToggleActive(emp)}
                      className={`badge ${emp.active ? 'badge-assigned' : 'badge-rejected'}`}
                      style={{ cursor: 'pointer', border: 'none' }}
                      title="Click to toggle active status"
                    >
                      {emp.active ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                      {emp.active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => openEditModal(emp)}
                        title="Edit employee"
                      >
                        <Edit size={14} />
                        <span>Edit</span>
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleDelete(emp)}
                        title="Deactivate employee"
                        style={{ color: '#ef4444' }}
                      >
                        <Trash2 size={14} />
                        <span>Deactivate</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Employee Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingEmployee ? `Edit Employee: ${editingEmployee.name}` : 'Add New Employee'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Arun Kumar"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input
              type="email"
              className="form-control"
              placeholder="e.g. arun@shiftplanner.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Role *</label>
            <select
              className="form-control"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <option value="EMPLOYEE">EMPLOYEE (Standard Staff)</option>
              <option value="MANAGER">MANAGER (Roster & Swap Approver)</option>
            </select>
          </div>

          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '1rem' }}>
            <input
              type="checkbox"
              id="activeCheck"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
            />
            <label htmlFor="activeCheck" style={{ fontSize: '0.88rem', cursor: 'pointer', fontWeight: 500 }}>
              Active (Available for shift assignments and swap requests)
            </label>
          </div>

          <div className="modal-footer" style={{ margin: '1.5rem -1.5rem -1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={closeModal}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : editingEmployee ? 'Save Changes' : 'Create Employee'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
