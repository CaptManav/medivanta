import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit2, Trash2, Calendar, Clock, AlertCircle } from 'lucide-react';
import api from '../../services/api.js';
import { Card, CardHeader, CardBody, CardTitle } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { Table } from '../../components/ui/Table.jsx';
import { Badge } from '../../components/ui/Badge.jsx';

export const ManageDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);

  // Form state
  const [name, setName] = useState('');
  const [qualification, setQualification] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [appointmentRequired, setAppointmentRequired] = useState(false);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/doctors');
      setDoctors(res.data.data || []);
    } catch (err) {
      console.error('Failed to load doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const openAddModal = () => {
    setEditingDoctor(null);
    setName('');
    setQualification('');
    setSpecialization('');
    setAppointmentRequired(false);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (doc) => {
    setEditingDoctor(doc);
    setName(doc.name);
    setQualification(doc.qualification || '');
    setSpecialization(doc.specialization || '');
    setAppointmentRequired(doc.appointment_required || false);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this doctor?')) return;
    try {
      await api.delete(`/admin/doctors/${id}`);
      await fetchDoctors();
    } catch (err) {
      alert('Failed to delete doctor');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      const payload = {
        name,
        qualification,
        specialization,
        appointmentRequired,
      };

      if (editingDoctor) {
        await api.put(`/admin/doctors/${editingDoctor.id}`, payload);
      } else {
        await api.post('/admin/doctors', payload);
      }

      setIsModalOpen(false);
      await fetchDoctors();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      header: 'Physician Name',
      accessor: 'name',
      render: (row) => (
        <div>
          <span className="font-semibold text-slate-800">{row.name}</span>
          <span className="block text-xs text-slate-400">{row.qualification}</span>
        </div>
      ),
    },
    {
      header: 'Specialization',
      accessor: 'specialization',
    },
    {
      header: 'Status',
      accessor: 'current_status',
      render: (row) => (
        <Badge
          variant={
            row.current_status === 'in_opd'
              ? 'success'
              : row.current_status === 'on_leave'
              ? 'danger'
              : 'neutral'
          }
          size="sm"
        >
          {row.current_status || 'not_in_opd'}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      cellClassName: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => openEditModal(row)}
            className="p-1.5 text-slate-500 hover:text-teal-600 rounded-lg hover:bg-slate-100"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-slate-100"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manage Doctors & Consultants</h1>
          <p className="text-xs text-slate-500 mt-1">Register physicians, qualifications, and consulting timetables.</p>
        </div>
        <Button variant="primary" size="md" onClick={openAddModal}>
          <Plus className="w-4 h-4 mr-1.5" /> Add Doctor
        </Button>
      </div>

      <Table columns={columns} data={doctors} emptyMessage="No doctors registered for this facility." />

      {/* Modal for Add / Edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDoctor ? 'Edit Doctor Details' : 'Add New Doctor'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-xs text-rose-700 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <Input
            label="Doctor Full Name"
            required
            placeholder="e.g. Dr. Ramesh Awari"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Input
            label="Qualifications"
            placeholder="e.g. BAMS, MD (Ayurveda)"
            value={qualification}
            onChange={(e) => setQualification(e.target.value)}
          />

          <Input
            label="Specialization / Department"
            placeholder="e.g. General Medicine, Shalya Tantra"
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
          />

          <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={appointmentRequired}
              onChange={(e) => setAppointmentRequired(e.target.checked)}
              className="rounded border-slate-300 text-teal-600"
            />
            <span>Prior Appointment Required (unchecked = walk-in allowed)</span>
          </label>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
            <Button variant="secondary" size="md" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" isLoading={submitting}>
              {editingDoctor ? 'Save Changes' : 'Add Doctor'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
