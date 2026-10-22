import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bed, HeartPulse, Clock, AlertTriangle, Building2, Phone, CalendarCheck, ShieldCheck } from 'lucide-react';
import api from '../../services/api.js';
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/Card.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { timeAgo, isStale, getBedStatusColor } from '../../utils/formatTime.js';
import { useSocket } from '../../hooks/useSocket.js';

export const BedAvailability = () => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();

  const fetchBeds = async () => {
    setLoading(true);
    try {
      const res = await api.get('/hospitals');
      setHospitals(res.data.data || []);
    } catch (err) {
      console.error('Failed to load beds:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBeds();
  }, []);

  // Listen for real-time live bed updates
  useEffect(() => {
    if (!socket) return;

    const handleBedUpdate = ({ hospitalId, beds }) => {
      setHospitals((prev) =>
        prev.map((h) =>
          h.id === hospitalId
            ? {
                ...h,
                general_avail: beds.general_avail,
                general_total: beds.general_total,
                icu_avail: beds.icu_avail,
                icu_total: beds.icu_total,
                vent_avail: beds.vent_avail,
                vent_total: beds.vent_total,
                beds_updated_at: beds.updated_at,
              }
            : h
        )
      );
    };

    socket.on('global:bed:update', handleBedUpdate);
    return () => {
      socket.off('global:bed:update', handleBedUpdate);
    };
  }, [socket]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Live Hospital Bed Availability</h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time verified vacancy counts for General wards, ICU, and Ventilators across rural facilities.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Live Sync Active</span>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading bed vacancy numbers...</div>
      ) : (
        <div className="space-y-6">
          {hospitals.map((h) => {
            const stale = isStale(h.beds_updated_at);
            return (
              <Card key={h.id} className="border-slate-200 overflow-hidden">
                <CardHeader className="bg-slate-50/70 py-3.5 px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-teal-600" />
                    <div>
                      <h3 className="font-bold text-slate-800 text-base">{h.name}</h3>
                      <p className="text-xs text-slate-500">{h.taluka}, {h.district}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Updated {timeAgo(h.beds_updated_at)}
                    </span>
                    {stale && (
                      <Badge variant="warning" size="sm">
                        <AlertTriangle className="w-3 h-3 mr-1" /> Data &gt; 24h Old
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardBody className="p-6">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <span className="text-xs font-semibold uppercase text-slate-500 block mb-1">
                        General Ward
                      </span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-bold text-teal-600">{h.general_avail ?? 0}</span>
                        <span className="text-xs text-slate-400">/ {h.general_total ?? 0}</span>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <span className="text-xs font-semibold uppercase text-slate-500 block mb-1">
                        ICU Beds
                      </span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-bold text-rose-600">{h.icu_avail ?? 0}</span>
                        <span className="text-xs text-slate-400">/ {h.icu_total ?? 0}</span>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <span className="text-xs font-semibold uppercase text-slate-500 block mb-1">
                        Ventilators
                      </span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-bold text-indigo-600">{h.vent_avail ?? 0}</span>
                        <span className="text-xs text-slate-400">/ {h.vent_total ?? 0}</span>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <span className="text-xs font-semibold uppercase text-slate-500 block mb-1">
                        Emergency / O2
                      </span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-bold text-slate-800">{h.emergency_beds ?? 0}</span>
                        <span className="text-xs text-slate-400">Beds</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex gap-2">
                      {h.is_24x7 && <Badge variant="success" size="sm">24x7 Emergency</Badge>}
                      {h.pmjay && <Badge variant="info" size="sm">PM-JAY Enrolled</Badge>}
                    </div>

                    <div className="flex items-center gap-2">
                      {h.phone && (
                        <a href={`tel:${h.phone}`}>
                          <Button variant="outline" size="sm">
                            <Phone className="w-3.5 h-3.5 mr-1 text-teal-600" />
                            Call: {h.phone}
                          </Button>
                        </a>
                      )}
                      <Link to={`/hospitals/${h.id}`}>
                        <Button variant="secondary" size="sm">
                          Hospital Profile
                        </Button>
                      </Link>
                      <Link to={`/book-appointment?hospitalId=${h.id}`}>
                        <Button variant="primary" size="sm">
                          Book Admission / OPD
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
