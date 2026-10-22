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
  Navigation,
  Camera,
  ExternalLink,
  X,
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import api from '../../services/api.js';
import { Card, CardHeader, CardBody, CardTitle } from '../../components/ui/Card.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Table } from '../../components/ui/Table.jsx';
import { timeAgo, isStale, getBedStatusColor } from '../../utils/formatTime.js';
import { useSocket } from '../../hooks/useSocket.js';
import { AWARI_ID, SAMARTH_ID } from '../../services/mockData.js';

export const HospitalDetail = () => {
  const { id } = useParams();
  const [hospital, setHospital] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [services, setServices] = useState([]);
  const [emergencyData, setEmergencyData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

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
    if (joinHospital) joinHospital(id);

    return () => {
      if (leaveHospital) leaveHospital(id);
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

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    hospital.name + ' ' + (hospital.address || '')
  )}`;

  const isAwari = hospital.id === AWARI_ID || hospital.name?.includes('Awari');
  const photos = isAwari
    ? [
        {
          url: '/photos/awari/dr_awari_consultation.jpeg',
          title: 'Dr. Ashish Awari (BHMS) Consultation Room',
          caption: 'Dr. Ashish Awari at consultation desk in Dr. Awari Hospital, Bota, Sangamner.',
          category: 'Doctor & Consultation',
          date: 'October 2026',
        },
      ]
    : [
        {
          url: '/photos/samarth/samarth_building_entrance.jpeg',
          title: 'Samarth Hospital Campus & Main Entrance',
          caption: 'Front view of Samarth Ayurved College Hospital & Research Centre, Belhe campus on Kalyan-Nagar Highway.',
          category: 'Campus Building',
          date: 'October 2026',
        },
        {
          url: '/photos/samarth/samarth_reception_board.jpeg',
          title: 'Hospital Reception Counter & Welcome Board',
          caption: 'Reception counter showing official signboard: समर्थ हॉस्पिटल अँड रिसर्च सेंटर, बेल्हे (Direct Appointment Line: 8624843303).',
          category: 'Reception & Helpdesk',
          date: 'October 2026',
        },
        {
          url: '/photos/samarth/samarth_reception_desk.jpeg',
          title: 'Reception Registration & Patient Intake',
          caption: 'Hospital reception staff registering patients and coordinating OPD tokens.',
          category: 'Patient Care Desk',
          date: 'October 2026',
        },
        {
          url: '/photos/samarth/dr_ramesh_padekar.jpeg',
          title: 'Dr. Ramesh Padekar (M.O. & Deputy Superintendent)',
          caption: 'Dr. Ramesh Padekar (Senior Physician) with medical officers in hospital consultation chamber.',
          category: 'Physicians & Doctors',
          date: 'October 2026',
        },
        {
          url: '/photos/samarth/samarth_admin_office.jpeg',
          title: 'Administrative Office & Records Section',
          caption: 'Hospital administration desk managing bed admissions, PM-JAY documentation, and hospital operations.',
          category: 'Administration',
          date: 'October 2026',
        },
      ];

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

            <div className="flex flex-wrap items-center gap-2.5">
              <Link to={`/book-appointment?hospitalId=${hospital.id}`}>
                <Button variant="primary" size="md">
                  <CalendarCheck className="w-4 h-4 mr-1.5" /> Book Consultation
                </Button>
              </Link>
              {hospital.phone && (
                <a href={`tel:${hospital.phone}`}>
                  <Button variant="secondary" size="md">
                    <Phone className="w-4 h-4 mr-1.5 text-teal-600" /> Call {hospital.phone}
                  </Button>
                </a>
              )}
              <a href={googleMapsUrl} target="_blank" rel="noreferrer">
                <Button variant="outline" size="md">
                  <Navigation className="w-4 h-4 mr-1.5 text-teal-600" /> Google Maps
                </Button>
              </a>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200 flex gap-2 overflow-x-auto text-sm font-medium">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'photos', label: `Photos & Tour (${photos.length})` },
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
                    <span className="font-semibold text-slate-800">
                      {hospital.is_24x7 ? 'Yes, Round-the-clock' : 'Standard OPD Operating Hours'}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-xs text-slate-400 block font-medium">Government Health Scheme</span>
                    <span className="font-semibold text-slate-800">
                      {hospital.pmjay ? 'PM-JAY (Ayushman Bharat) Active' : 'Private / Direct Billing'}
                    </span>
                  </div>
                </div>

                {/* Photo Highlight snippet in overview */}
                <div className="pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold uppercase text-slate-500 flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-teal-600" /> Hospital Visual Documentation
                    </span>
                    <button
                      onClick={() => setActiveTab('photos')}
                      className="text-xs text-teal-600 hover:underline font-medium"
                    >
                      View all {photos.length} photos →
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {photos.slice(0, 3).map((p, idx) => (
                      <div
                        key={idx}
                        onClick={() => setSelectedPhoto(p)}
                        className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 cursor-pointer hover:opacity-90 transition-opacity border border-slate-200"
                      >
                        <img src={p.url} alt={p.title} className="w-full h-full object-cover" />
                      </div>
                    ))}
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
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="font-semibold text-slate-800">{hospital.phone || '9763245875'}</span>
                    {hospital.phone && (
                      <a href={`tel:${hospital.phone}`}>
                        <Button variant="primary" size="sm">
                          <Phone className="w-3 h-3 mr-1" /> Call
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
                {hospital.alt_phone && (
                  <div>
                    <span className="text-xs text-slate-400 block">Alternate Contact Line</span>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="font-medium text-slate-800">{hospital.alt_phone}</span>
                      <a href={`tel:${hospital.alt_phone}`}>
                        <Button variant="outline" size="sm">
                          <Phone className="w-3 h-3 mr-1" /> Call
                        </Button>
                      </a>
                    </div>
                  </div>
                )}
                <div>
                  <span className="text-xs text-slate-400 block">Taluka / District</span>
                  <span className="font-medium text-slate-800">
                    {hospital.taluka}, {hospital.district}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Verified Survey Data</span>
                  <Badge variant="success" size="sm" className="mt-1">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Field Survey Approved
                  </Badge>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 2: Photos & Tour */}
      {activeTab === 'photos' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Hospital Photos & Field Verification</h2>
              <p className="text-xs text-slate-500">
                Click any photo to enlarge and inspect doctor chambers, reception, and campus facilities.
              </p>
            </div>
            <Link to="/photos">
              <Button variant="outline" size="sm">
                <Camera className="w-3.5 h-3.5 mr-1 text-teal-600" /> View All Hospitals Gallery
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {photos.map((photo, idx) => (
              <Card
                key={idx}
                hover
                className="overflow-hidden border-slate-200 cursor-pointer group"
                onClick={() => setSelectedPhoto(photo)}
              >
                <div className="relative aspect-[4/3] bg-slate-900 overflow-hidden">
                  <img
                    src={photo.url}
                    alt={photo.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <Badge variant="navy" size="sm" className="bg-slate-900/80 backdrop-blur-sm text-white">
                      {photo.category}
                    </Badge>
                  </div>
                </div>
                <CardBody className="p-4 space-y-2">
                  <h3 className="font-bold text-slate-800 text-sm group-hover:text-teal-600 transition-colors">
                    {photo.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {photo.caption}
                  </p>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span>{photo.date}</span>
                    <span className="text-teal-600 font-medium">Click to enlarge →</span>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Live Beds */}
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

      {/* Tab 4: Doctors & OPD */}
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
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        {doc.photo ? (
                          <img
                            src={doc.photo}
                            alt={doc.name}
                            className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0 cursor-pointer"
                            onClick={() =>
                              setSelectedPhoto({
                                url: doc.photo,
                                title: doc.name,
                                caption: `${doc.qualification} — ${doc.specialization}`,
                                category: 'Physician',
                                date: 'October 2026',
                              })
                            }
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                            <Stethoscope className="w-6 h-6" />
                          </div>
                        )}
                        <div>
                          <h3 className="font-bold text-base text-slate-800">{doc.name}</h3>
                          <p className="text-xs text-teal-600 font-medium">{doc.qualification}</p>
                          <p className="text-xs text-slate-500">{doc.specialization}</p>
                        </div>
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
                              <span>
                                {s.start_time.slice(0, 5)} - {s.end_time.slice(0, 5)}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400">Regular daily consults during operating hours.</p>
                      )}
                    </div>

                    <div className="pt-2 flex items-center gap-2">
                      <Link to={`/book-appointment?hospitalId=${hospital.id}&doctorId=${doc.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          Book Appointment
                        </Button>
                      </Link>
                      {doc.phone && (
                        <a href={`tel:${doc.phone}`}>
                          <Button variant="secondary" size="sm">
                            <Phone className="w-3.5 h-3.5 mr-1 text-teal-600" /> Call
                          </Button>
                        </a>
                      )}
                    </div>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 5: Services */}
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

      {/* Tab 6: Emergency */}
      {activeTab === 'emergency' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-rose-200">
            <CardHeader className="bg-rose-50/50">
              <CardTitle className="text-rose-800 flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-rose-600" /> Emergency Casualty Department
              </CardTitle>
            </CardHeader>
            <CardBody className="space-y-4 text-sm text-slate-600">
              <p>
                <strong>24x7 Emergency Status:</strong>{' '}
                {hospital.is_24x7 ? 'Active round the clock with casualty section' : 'Standard daytime hours'}
              </p>
              <div>
                <p className="font-medium text-slate-800 mb-2">Emergency Direct Helpline:</p>
                {hospital.phone ? (
                  <a href={`tel:${hospital.phone}`}>
                    <Button variant="danger" size="md" className="w-full">
                      <Phone className="w-4 h-4 mr-1.5" /> Call Hospital Desk: {hospital.phone}
                    </Button>
                  </a>
                ) : (
                  <p className="text-xs text-slate-400">Direct desk phone provided upon admission.</p>
                )}
              </div>
              {hospital.alt_phone && (
                <div>
                  <a href={`tel:${hospital.alt_phone}`}>
                    <Button variant="outline" size="sm" className="w-full text-xs">
                      <Phone className="w-3.5 h-3.5 mr-1" /> Alternate Emergency Line: {hospital.alt_phone}
                    </Button>
                  </a>
                </div>
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
                  <div
                    key={amb.id}
                    className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-semibold text-slate-800 text-sm block">{amb.type} Ambulance</span>
                      <span className="text-xs text-slate-500">
                        {amb.is_24x7 ? '24x7 Standby in Belhe' : 'Scheduled on call'}
                      </span>
                    </div>
                    {amb.contact && (
                      <a href={`tel:${amb.contact}`}>
                        <Button variant="primary" size="sm">
                          <Phone className="w-3 h-3 mr-1" /> Call: {amb.contact}
                        </Button>
                      </a>
                    )}
                  </div>
                ))
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-slate-500">
                    Direct on-site ambulance not attached. Call National 108 Emergency Service:
                  </p>
                  <a href="tel:108">
                    <Button variant="primary" size="sm">
                      <Phone className="w-3.5 h-3.5 mr-1" /> Dial 108 Free Helpline
                    </Button>
                  </a>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      )}

      {/* Tab 7: Location Map */}
      {activeTab === 'map' && (
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle>Geographical Location & Driving Directions</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">{hospital.address}</p>
            </div>
            <a href={googleMapsUrl} target="_blank" rel="noreferrer">
              <Button variant="primary" size="md">
                <Navigation className="w-4 h-4 mr-1.5" /> Open in Google Maps App
              </Button>
            </a>
          </CardHeader>
          <CardBody className="p-0 h-[420px]">
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
                    <div className="space-y-1">
                      <strong className="text-slate-900 block">{hospital.name}</strong>
                      <span className="text-xs text-slate-600 block">{hospital.address}</span>
                      <a
                        href={googleMapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-teal-600 underline font-medium block mt-1"
                      >
                        Navigate on Google Maps →
                      </a>
                    </div>
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

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-xs text-teal-400 font-semibold uppercase tracking-wider block">
                  {hospital.name}
                </span>
                <h3 className="font-bold text-base text-white">{selectedPhoto.title}</h3>
              </div>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 bg-black flex items-center justify-center overflow-hidden min-h-[300px] max-h-[55vh]">
              <img src={selectedPhoto.url} alt={selectedPhoto.title} className="max-h-full max-w-full object-contain" />
            </div>

            <div className="p-5 bg-white space-y-2">
              <p className="text-xs sm:text-sm text-slate-600">{selectedPhoto.caption || selectedPhoto.description}</p>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400">{selectedPhoto.date}</span>
                <Button variant="secondary" size="sm" onClick={() => setSelectedPhoto(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
