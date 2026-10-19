import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Building2,
  MapPin,
  Phone,
  Bed,
  Users,
  Clock,
  HeartPulse,
  ShieldCheck,
  CalendarCheck,
  AlertTriangle,
  Ambulance as AmbulanceIcon,
  CheckCircle2,
  Stethoscope,
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import api from '../../services/api.js';
import { Card, CardHeader, CardBody, CardTitle } from '../../components/ui/Card.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Table } from '../../components/ui/Table.jsx';
import { timeAgo, isStale, getBedStatusColor } from '../../utils/formatTime.js';
import { useSocket } from '../../hooks/useSocket.js';

export const HospitalDetail = () => {
  const { id } = useParams();
  const [hospital, setHospital] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [services, setServices] = useState([]);
  const [emergencyData, setEmergencyData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  const { socket, joinHospital, leaveHospital } = useSocket();

  useEffect(() => {
    const fetchHospitalData = async () => {
      setLoading(true);
      try {
        const [hRes, dRes, sRes, eRes] = await Promise.all([
          api.get(`/hospitals/${id}`),
          api.get(`/hospitals/${id}/doctors`),
          api.get(`/hospitals/${id}/services`),
          api.get(`/hospitals/${id}/emergency`),
        ]);

        setHospital(hRes.data.data);
        setDoctors(dRes.data.data || []);
        setServices(sRes.data.data || []);
        setEmergencyData(eRes.data.data || null);
      } catch (err) {
        console.error('Failed to load hospital details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHospitalData();
    joinHospital(id);

    return () => {
      leaveHospital(id);
    };
  }, [id]);

  // Real-time socket updates for this hospital's beds
  useEffect(() => {
    if (!socket) return;

    const handleBedUpdate = ({ hospitalId, beds }) => {
      if (hospitalId === id) {
        setHospital((prev) => (prev ? { ...prev, ...beds, beds_updated_at: beds.updated_at } : prev));
      }
    };

    const handleDoctorStatus = ({ hospitalId, doctor }) => {
      if (hospitalId === id) {
        setDoctors((prev) =>
          prev.map((d) => (d.id === doctor.doctorId ? { ...d, current_status: doctor.status } : d))
        );
      }
    };

    socket.on('bed:update', handleBedUpdate);
    socket.on('doctor:status', handleDoctorStatus);

    return () => {
      socket.off('bed:update', handleBedUpdate);
      socket.off('doctor:status', handleDoctorStatus);
    };
  }, [socket, id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-500">
        <p>Loading hospital records...</p>
      </div>
    );
  }

  if (!hospital) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-600">
        <h2 className="text-xl font-bold">Hospital not found</h2>
        <Link to="/hospitals" className="text-teal-600 underline text-sm mt-2 block">
          Return to directory
        </Link>
      </div>
    );
  }

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner Card */}
      <Card className="border-slate-200">
        <CardBody className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant={hospital.type === 'college' ? 'info' : 'neutral'} size="sm" className="uppercase">
                  {hospital.type}
                </Badge>
                {hospital.is_24x7 && (
                  <Badge variant="success" size="sm" dot>
                    24x7 Emergency
                  </Badge>
                )}
                {hospital.pmjay && (
                  <Badge variant="info" size="sm">
                    PM-JAY Accepted
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{hospital.name}</h1>
              <p className="text-xs sm:text-sm text-slate-600 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{hospital.address}</span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link to={`/book-appointment?hospitalId=${hospital.id}`}>
                <Button variant="primary" size="md">
                  <CalendarCheck className="w-4 h-4 mr-1.5" /> Book Consultation
                </Button>
              </Link>
              {hospital.phone && (
                <a href={`tel:${hospital.phone}`}>
                  <Button variant="secondary" size="md">
                    <Phone className="w-4 h-4 mr-1.5" /> Call Hospital
                  </Button>
                </a>
              )}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200 flex gap-2 overflow-x-auto text-sm font-medium">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'beds', label: 'Live Bed Status' },
          { id: 'doctors', label: 'Doctors & OPD' },
          { id: 'services', label: 'Services & Pharmacy' },
          { id: 'emergency', label: 'Emergency & Ambulance' },
          { id: 'map', label: 'Location Map' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-3 px-4 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'border-teal-600 text-teal-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>About the Facility</CardTitle>
              </CardHeader>
              <CardBody className="space-y-4 text-sm text-slate-600 leading-relaxed">
                <p>
                  <strong>{hospital.name}</strong> operates in {hospital.taluka}, {hospital.district}, providing medical care to the surrounding rural and semi-urban community.
                </p>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-xs text-slate-400 block font-medium">24x7 Facility</span>
                    <span className="font-semibold text-slate-800">{hospital.is_24x7 ? 'Yes, Round-the-clock' : 'Standard OPD Hours'}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-xs text-slate-400 block font-medium">Government Health Scheme</span>
                    <span className="font-semibold text-slate-800">{hospital.pmjay ? 'PM-JAY (Ayushman Bharat) Active' : 'Private / Direct Billing'}</span>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Direct Contacts</CardTitle>
              </CardHeader>
              <CardBody className="space-y-3 text-sm">
                <div>
                  <span className="text-xs text-slate-400 block">Hospital Desk Phone</span>
                  <span className="font-medium text-slate-800">{hospital.phone || 'Available on Admission'}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Taluka / District</span>
                  <span className="font-medium text-slate-800">{hospital.taluka}, {hospital.district}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Demonstration Consent</span>
                  <Badge variant="success" size="sm" className="mt-1">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Approved for Demo
                  </Badge>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 2: Live Beds */}
      {activeTab === 'beds' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Bed Vacancy Dashboard</h2>
              <p className="text-xs text-slate-500">Live counts updated directly by hospital admin staff.</p>
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>Last updated: {timeAgo(hospital.beds_updated_at)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold uppercase text-slate-400 block mb-1">General Ward Beds</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-teal-600">{hospital.general_avail ?? 0}</span>
                <span className="text-slate-400 text-sm">/ {hospital.general_total ?? 0} total</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold uppercase text-slate-400 block mb-1">ICU Critical Care Beds</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-rose-600">{hospital.icu_avail ?? 0}</span>
                <span className="text-slate-400 text-sm">/ {hospital.icu_total ?? 0} total</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold uppercase text-slate-400 block mb-1">Ventilators</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-indigo-600">{hospital.vent_avail ?? 0}</span>
                <span className="text-slate-400 text-sm">/ {hospital.vent_total ?? 0} total</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold uppercase text-slate-400 block mb-1">Emergency Beds</span>
              <span className="text-2xl font-bold text-slate-800">{hospital.emergency_beds ?? 0}</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold uppercase text-slate-400 block mb-1">Oxygen Supported Beds</span>
              <span className="text-2xl font-bold text-slate-800">{hospital.oxygen_beds ?? 0}</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold uppercase text-slate-400 block mb-1">Isolation Beds</span>
              <span className="text-2xl font-bold text-slate-800">{hospital.isolation_beds ?? 0}</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Doctors & OPD */}
      {activeTab === 'doctors' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Physicians & OPD Schedule</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {doctors.map((doc) => {
              const statusVariant =
                doc.current_status === 'in_opd'
                  ? 'success'
                  : doc.current_status === 'on_leave'
                  ? 'danger'
                  : 'neutral';

              const statusText =
                doc.current_status === 'in_opd'
                  ? 'In OPD Now'
                  : doc.current_status === 'on_leave'
                  ? 'On Leave'
                  : 'Not in OPD';

              return (
                <Card key={doc.id}>
                  <CardBody className="p-5 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-base text-slate-800">{doc.name}</h3>
                        <p className="text-xs text-teal-600 font-medium">{doc.qualification}</p>
                        <p className="text-xs text-slate-500">{doc.specialization}</p>
                      </div>
                      <Badge variant={statusVariant} size="sm" dot>
                        {statusText}
                      </Badge>
                    </div>

                    <div className="border-t border-slate-100 pt-3">
                      <span className="text-xs font-semibold text-slate-500 block mb-1">Weekly OPD Timetable:</span>
                      {doc.opd_schedules && doc.opd_schedules.length > 0 ? (
                        <div className="space-y-1">
                          {doc.opd_schedules.map((s, idx) => (
                            <div key={idx} className="flex justify-between text-xs text-slate-600">
                              <span className="font-medium">{daysOfWeek[s.weekday] || 'Day'}:</span>
                              <span>{s.start_time.slice(0, 5)} - {s.end_time.slice(0, 5)}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400">Regular daily consults during operating hours.</p>
                      )}
                    </div>

                    <div className="pt-2">
                      <Link to={`/book-appointment?hospitalId=${hospital.id}&doctorId=${doc.id}`}>
                        <Button variant="outline" size="sm" className="w-full">
                          Book Appointment
                        </Button>
                      </Link>
                    </div>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 4: Services */}
      {activeTab === 'services' && (
        <Card>
          <CardHeader>
            <CardTitle>Departments & Allied Services</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {services.map((svc) => (
                <div key={svc.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1">
                  <Badge variant="neutral" size="sm" className="uppercase text-[10px]">
                    {svc.category}
                  </Badge>
                  <h4 className="font-semibold text-sm text-slate-800">{svc.name}</h4>
                  <p className="text-xs text-slate-500">{svc.timing || 'Operational'}</p>
                  {svc.notes && <p className="text-xs text-slate-400 mt-1">{svc.notes}</p>}
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Tab 5: Emergency */}
      {activeTab === 'emergency' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-rose-200">
            <CardHeader className="bg-rose-50/50">
              <CardTitle className="text-rose-800 flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-rose-600" /> Emergency Department
              </CardTitle>
            </CardHeader>
            <CardBody className="space-y-3 text-sm text-slate-600">
              <p>
                <strong>24x7 Emergency Status:</strong> {hospital.is_24x7 ? 'Active round the clock' : 'Limited daytime hours'}
              </p>
              <p>For immediate assistance, dial hospital staff directly:</p>
              {hospital.phone ? (
                <a href={`tel:${hospital.phone}`}>
                  <Button variant="danger" size="md" className="w-full">
                    <Phone className="w-4 h-4 mr-1.5" /> Call {hospital.phone}
                  </Button>
                </a>
              ) : (
                <p className="text-xs text-slate-400">Direct desk phone provided upon admission.</p>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AmbulanceIcon className="w-4 h-4 text-teal-600" /> Attached Ambulances
              </CardTitle>
            </CardHeader>
            <CardBody className="space-y-3">
              {emergencyData?.ambulances && emergencyData.ambulances.length > 0 ? (
                emergencyData.ambulances.map((amb) => (
                  <div key={amb.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-800 text-sm block">{amb.type} Ambulance</span>
                      <span className="text-xs text-slate-500">{amb.is_24x7 ? '24x7 Standby' : 'Scheduled on call'}</span>
                    </div>
                    {amb.contact && (
                      <a href={`tel:${amb.contact}`}>
                        <Button variant="primary" size="sm">Call Driver</Button>
                      </a>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500">
                  No private ambulance attached. Use National Ambulance service: <strong>108</strong>.
                </p>
              )}
            </CardBody>
          </Card>
        </div>
      )}

      {/* Tab 6: Location Map */}
      {activeTab === 'map' && (
        <Card>
          <CardHeader>
            <CardTitle>Geographical Location & Route</CardTitle>
          </CardHeader>
          <CardBody className="p-0 h-[400px]">
            {hospital.lat && hospital.lng ? (
              <MapContainer
                center={[hospital.lat, hospital.lng]}
                zoom={14}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%', borderRadius: '0 0 12px 12px' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[hospital.lat, hospital.lng]}>
                  <Popup>
                    <strong>{hospital.name}</strong>
                    <br />
                    {hospital.address}
                  </Popup>
                </Marker>
              </MapContainer>
            ) : (
              <div className="p-8 text-center text-slate-400">
                Coordinates not mapped yet for this hospital.
              </div>
            )}
          </CardBody>
        </Card>
      )}
    </div>
  );
};
