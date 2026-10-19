import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Clock, Calendar, Search, MapPin, Building2, CheckCircle2 } from 'lucide-react';
import api from '../../services/api.js';
import { Card, CardBody } from '../../components/ui/Card.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { useSocket } from '../../hooks/useSocket.js';

export const DoctorsOPD = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { socket } = useSocket();

  const fetchAllDoctors = async () => {
    setLoading(true);
    try {
      const hRes = await api.get('/hospitals');
      const allHospitals = hRes.data.data || [];

      const docPromises = allHospitals.map(async (h) => {
        const dRes = await api.get(`/hospitals/${h.id}/doctors`);
        return (dRes.data.data || []).map((d) => ({
          ...d,
          hospitalId: h.id,
          hospitalName: h.name,
          hospitalTaluka: h.taluka,
        }));
      });

      const results = await Promise.all(docPromises);
      setDoctors(results.flat());
    } catch (err) {
      console.error('Failed to load doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllDoctors();
  }, []);

  // Listen for real-time doctor status toggles
  useEffect(() => {
    if (!socket) return;

    const handleDoctorStatus = ({ doctor }) => {
      setDoctors((prev) =>
        prev.map((d) => (d.id === doctor.doctorId ? { ...d, current_status: doctor.status } : d))
      );
    };

    socket.on('global:doctor:status', handleDoctorStatus);
    return () => {
      socket.off('global:doctor:status', handleDoctorStatus);
    };
  }, [socket]);

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const filteredDoctors = doctors.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      (d.specialization && d.specialization.toLowerCase().includes(search.toLowerCase())) ||
      d.hospitalName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Doctors & OPD Weekly Schedule</h1>
          <p className="text-sm text-slate-500 mt-1">
            Live doctor attendance status and consulting hours across verified clinics and hospitals.
          </p>
        </div>

        <div className="w-full sm:w-72">
          <Input
            placeholder="Search doctor or specialization..."
            icon={Search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading specialist registry...</div>
      ) : filteredDoctors.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500">
          No physicians match your search criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDoctors.map((doc) => {
            const statusVariant =
              doc.current_status === 'in_opd'
                ? 'success'
                : doc.current_status === 'on_leave'
                ? 'danger'
                : 'neutral';

            const statusText =
              doc.current_status === 'in_opd'
                ? '🟢 In OPD Now'
                : doc.current_status === 'on_leave'
                ? '🔴 On Leave'
                : '🟡 Not in OPD';

            return (
              <Card key={doc.id} hover className="flex flex-col justify-between">
                <CardBody className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="font-bold text-base text-slate-900">{doc.name}</h3>
                        <p className="text-xs text-teal-600 font-medium">{doc.qualification}</p>
                      </div>
                      <Badge variant={statusVariant} size="sm" className="shrink-0">
                        {statusText}
                      </Badge>
                    </div>

                    <p className="text-xs text-slate-600 mb-2 font-medium">{doc.specialization}</p>

                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3 bg-slate-50 p-2 rounded-lg">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{doc.hospitalName} ({doc.hospitalTaluka})</span>
                    </div>

                    {/* Schedule */}
                    <div className="border-t border-slate-100 pt-2.5">
                      <span className="text-[11px] font-semibold text-slate-400 block mb-1">Weekly Consultation Hours:</span>
                      {doc.opd_schedules && doc.opd_schedules.length > 0 ? (
                        <div className="space-y-1">
                          {doc.opd_schedules.map((s, idx) => (
                            <div key={idx} className="flex justify-between text-xs text-slate-600">
                              <span className="font-medium text-slate-700">{daysOfWeek[s.weekday]}:</span>
                              <span>{s.start_time.slice(0, 5)} - {s.end_time.slice(0, 5)}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400">Consultations during hospital working hours.</p>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100">
                    <Link to={`/book-appointment?hospitalId=${doc.hospitalId}&doctorId=${doc.id}`}>
                      <Button variant="primary" size="sm" className="w-full">
                        Book Appointment / Token
                      </Button>
                    </Link>
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
