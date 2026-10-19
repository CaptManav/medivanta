import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Building2, User, XCircle, CheckCircle2, AlertCircle, PlusCircle } from 'lucide-react';
import api from '../../services/api.js';
import { useAuth } from '../../hooks/useAuth.js';
import { Card, CardHeader, CardBody, CardTitle } from '../../components/ui/Card.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { formatDate } from '../../utils/formatTime.js';

export const Dashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(null);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/appointments');
      setAppointments(res.data.data || []);
    } catch (err) {
      console.error('Failed to load appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you wish to cancel this appointment?')) return;
    setCancelLoading(id);
    try {
      await api.patch(`/appointments/${id}/cancel`);
      await fetchAppointments();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to cancel appointment');
    } finally {
      setCancelLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return <Badge variant="success" size="sm">Confirmed</Badge>;
      case 'completed':
        return <Badge variant="neutral" size="sm">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="danger" size="sm">Cancelled</Badge>;
      default:
        return <Badge variant="warning" size="sm">Pending</Badge>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Profile Welcome Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
            {user?.name?.charAt(0) || 'P'}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Welcome, {user?.name}</h1>
            <p className="text-xs text-slate-500">{user?.email} • Patient Account</p>
          </div>
        </div>

        <Link to="/book-appointment">
          <Button variant="primary" size="md">
            <PlusCircle className="w-4 h-4 mr-1.5" /> Book Consultation
          </Button>
        </Link>
      </div>

      {/* Appointments Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">My Appointments & OPD Tokens</h2>

        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading your consultations...</div>
        ) : appointments.length === 0 ? (
          <Card>
            <CardBody className="p-12 text-center text-slate-500 space-y-3">
              <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-base font-semibold text-slate-800">No scheduled appointments</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Need to see a doctor or check hospital bed availability? Book your first visit now.
              </p>
              <Link to="/book-appointment" className="inline-block mt-2">
                <Button variant="primary" size="sm">
                  Schedule Doctor Appointment
                </Button>
              </Link>
            </CardBody>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {appointments.map((appt) => (
              <Card key={appt.id} className="border-slate-200">
                <CardBody className="p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-base text-slate-800">Dr. {appt.doctor_name}</h3>
                      <p className="text-xs text-teal-600 font-medium">{appt.specialization || 'General Consultation'}</p>
                    </div>
                    {getStatusBadge(appt.status)}
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-medium">{appt.hospital_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{formatDate(appt.date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Token / Slot: <strong>{appt.slot_or_token || 'Walk-in'}</strong></span>
                    </div>
                  </div>

                  {appt.notes && (
                    <p className="text-xs text-slate-500 italic">Notes: "{appt.notes}"</p>
                  )}

                  {appt.status !== 'cancelled' && appt.status !== 'completed' && (
                    <div className="pt-2 border-t border-slate-100 flex justify-end">
                      <button
                        onClick={() => handleCancel(appt.id)}
                        disabled={cancelLoading === appt.id}
                        className="text-xs text-rose-600 hover:text-rose-800 font-medium transition-colors"
                      >
                        {cancelLoading === appt.id ? 'Cancelling...' : 'Cancel Appointment'}
                      </button>
                    </div>
                  )}
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
