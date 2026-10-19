import React, { useState, useEffect } from 'react';
import { CalendarCheck, Clock, Check, X, CheckCheck, RefreshCw, Phone } from 'lucide-react';
import api from '../../services/api.js';
import { Table } from '../../components/ui/Table.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Button } from '../../components/ui/Button.jsx';

export const AppointmentQueue = () => {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/appointments');
      setQueue(res.data.data || []);
    } catch (err) {
      console.error('Failed to load queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      await api.patch(`/admin/appointments/${id}`, { status });
      await fetchQueue();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const columns = [
    {
      header: 'Patient Details',
      render: (row) => (
        <div>
          <span className="font-semibold text-slate-800">{row.patient_name}</span>
          {row.patient_phone && (
            <span className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
              <Phone className="w-3 h-3" /> {row.patient_phone}
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Consultant',
      render: (row) => (
        <div>
          <span className="font-medium text-slate-800">Dr. {row.doctor_name}</span>
          <span className="block text-xs text-teal-600">{row.specialization}</span>
        </div>
      ),
    },
    {
      header: 'Slot / Token',
      accessor: 'slot_or_token',
      render: (row) => <span className="font-semibold text-slate-700">{row.slot_or_token || 'Walk-in'}</span>,
    },
    {
      header: 'Current Status',
      accessor: 'status',
      render: (row) => {
        const variants = {
          pending: 'warning',
          confirmed: 'info',
          completed: 'success',
          cancelled: 'danger',
        };
        return <Badge variant={variants[row.status] || 'neutral'} size="sm">{row.status}</Badge>;
      },
    },
    {
      header: 'Actions',
      cellClassName: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          {row.status === 'pending' && (
            <button
              onClick={() => handleStatusChange(row.id, 'confirmed')}
              className="p-1.5 text-teal-600 hover:bg-teal-50 rounded-lg text-xs font-semibold flex items-center gap-1"
              title="Confirm appointment"
            >
              <Check className="w-3.5 h-3.5" /> Confirm
            </button>
          )}

          {row.status === 'confirmed' && (
            <button
              onClick={() => handleStatusChange(row.id, 'completed')}
              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg text-xs font-semibold flex items-center gap-1"
              title="Mark consultation completed"
            >
              <CheckCheck className="w-3.5 h-3.5" /> Done
            </button>
          )}

          {row.status !== 'cancelled' && row.status !== 'completed' && (
            <button
              onClick={() => handleStatusChange(row.id, 'cancelled')}
              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold"
              title="Cancel appointment"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Today's OPD Queue & Appointments</h1>
          <p className="text-xs text-slate-500 mt-1">Live patient consultation list for {new Date().toLocaleDateString()}.</p>
        </div>
        <Button variant="secondary" size="sm" onClick={fetchQueue} isLoading={loading}>
          <RefreshCw className="w-4 h-4 mr-1.5" /> Refresh Queue
        </Button>
      </div>

      <Table columns={columns} data={queue} emptyMessage="No appointments scheduled for today yet." />
    </div>
  );
};
