import React, { useState, useEffect } from 'react';
import { BedDouble, HeartPulse, Clock, Save, RefreshCw, CheckCircle2, AlertTriangle, Users, Plus, Minus } from 'lucide-react';
import api from '../../services/api.js';
import { Card, CardHeader, CardBody, CardTitle } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { timeAgo } from '../../utils/formatTime.js';

export const QuickUpdate = () => {
  const [beds, setBeds] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bRes, dRes] = await Promise.all([
        api.get('/admin/beds'),
        api.get('/admin/doctors'),
      ]);
      setBeds(bRes.data.data);
      setDoctors(dRes.data.data || []);
    } catch (err) {
      console.error('Failed to load admin telemetry:', err);
      setError('Failed to fetch hospital telemetry data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const adjustBed = (field, delta, maxField = null) => {
    setBeds((prev) => {
      const currentVal = prev[field] ?? 0;
      let nextVal = Math.max(0, currentVal + delta);
      if (maxField && prev[maxField] !== undefined) {
        nextVal = Math.min(nextVal, prev[maxField]);
      }
      return { ...prev, [field]: nextVal };
    });
  };

  const handleSaveBeds = async () => {
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const payload = {
        general_avail: beds.general_avail,
        general_total: beds.general_total,
        icu_avail: beds.icu_avail,
        icu_total: beds.icu_total,
        vent_avail: beds.vent_avail,
        vent_total: beds.vent_total,
        emergency_beds: beds.emergency_beds,
        oxygen_beds: beds.oxygen_beds,
        isolation_beds: beds.isolation_beds,
      };

      const res = await api.patch('/admin/beds', payload);
      setBeds(res.data.data);
      setMessage('Bed vacancies updated and broadcast to all live patient screens!');
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update beds');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleDoctorStatus = async (doctorId, nextStatus) => {
    try {
      await api.patch(`/admin/doctors/${doctorId}/status`, { status: nextStatus });
      setDoctors((prev) =>
        prev.map((d) => (d.id === doctorId ? { ...d, current_status: nextStatus } : d))
      );
    } catch (err) {
      alert('Failed to update doctor status');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading live update dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Hospital Live Telemetry & Quick Updates</h1>
          <p className="text-xs text-slate-500 mt-1">
            Tap +/- to alter bed vacancies. Changes push instantaneously via WebSocket to patient monitors.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Updated {timeAgo(beds?.updated_at)}
          </span>
          <Button variant="primary" size="md" onClick={handleSaveBeds} isLoading={saving}>
            <Save className="w-4 h-4 mr-1.5" /> Broadcast Live Beds
          </Button>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Bed Counters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* General Ward Available */}
        <Card className="border-slate-200">
          <CardBody className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-slate-500">General Ward Vacant</span>
              <Badge variant="info" size="sm">Total: {beds?.general_total ?? 0}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-extrabold text-teal-600">{beds?.general_avail ?? 0}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => adjustBed('general_avail', -1, 'general_total')}
                  className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => adjustBed('general_avail', 1, 'general_total')}
                  className="w-9 h-9 rounded-xl bg-teal-50 hover:bg-teal-100 flex items-center justify-center text-teal-700"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* ICU Beds Available */}
        <Card className="border-slate-200">
          <CardBody className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-slate-500">ICU Beds Vacant</span>
              <Badge variant="danger" size="sm">Total: {beds?.icu_total ?? 0}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-extrabold text-rose-600">{beds?.icu_avail ?? 0}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => adjustBed('icu_avail', -1, 'icu_total')}
                  className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => adjustBed('icu_avail', 1, 'icu_total')}
                  className="w-9 h-9 rounded-xl bg-rose-50 hover:bg-rose-100 flex items-center justify-center text-rose-700"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Ventilators Available */}
        <Card className="border-slate-200">
          <CardBody className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-slate-500">Ventilators Vacant</span>
              <Badge variant="neutral" size="sm">Total: {beds?.vent_total ?? 0}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-extrabold text-indigo-600">{beds?.vent_avail ?? 0}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => adjustBed('vent_avail', -1, 'vent_total')}
                  className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => adjustBed('vent_avail', 1, 'vent_total')}
                  className="w-9 h-9 rounded-xl bg-indigo-50 hover:bg-indigo-100 flex items-center justify-center text-indigo-700"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Emergency Beds */}
        <Card className="border-slate-200">
          <CardBody className="p-5 space-y-3">
            <span className="text-xs font-semibold uppercase text-slate-500 block">Emergency Beds</span>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-slate-800">{beds?.emergency_beds ?? 0}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => adjustBed('emergency_beds', -1)}
                  className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => adjustBed('emergency_beds', 1)}
                  className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Oxygen Beds */}
        <Card className="border-slate-200">
          <CardBody className="p-5 space-y-3">
            <span className="text-xs font-semibold uppercase text-slate-500 block">Oxygen Beds</span>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-slate-800">{beds?.oxygen_beds ?? 0}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => adjustBed('oxygen_beds', -1)}
                  className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => adjustBed('oxygen_beds', 1)}
                  className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Isolation Beds */}
        <Card className="border-slate-200">
          <CardBody className="p-5 space-y-3">
            <span className="text-xs font-semibold uppercase text-slate-500 block">Isolation Beds</span>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-slate-800">{beds?.isolation_beds ?? 0}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => adjustBed('isolation_beds', -1)}
                  className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => adjustBed('isolation_beds', 1)}
                  className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Live Doctor OPD Status Toggles */}
      <div className="space-y-4 pt-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Users className="w-5 h-5 text-teal-600" />
          Live Doctor OPD Presence
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {doctors.map((doc) => (
            <Card key={doc.id}>
              <CardBody className="p-4 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-800">{doc.name}</h4>
                  <p className="text-xs text-slate-500">{doc.qualification} • {doc.specialization}</p>
                </div>

                {/* 3-State Toggle Pill */}
                <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                  <button
                    onClick={() => handleToggleDoctorStatus(doc.id, 'in_opd')}
                    className={`px-2.5 py-1 rounded-lg transition-colors ${
                      doc.current_status === 'in_opd'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    In OPD
                  </button>
                  <button
                    onClick={() => handleToggleDoctorStatus(doc.id, 'not_in_opd')}
                    className={`px-2.5 py-1 rounded-lg transition-colors ${
                      doc.current_status === 'not_in_opd'
                        ? 'bg-amber-500 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Away
                  </button>
                  <button
                    onClick={() => handleToggleDoctorStatus(doc.id, 'on_leave')}
                    className={`px-2.5 py-1 rounded-lg transition-colors ${
                      doc.current_status === 'on_leave'
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Leave
                  </button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
