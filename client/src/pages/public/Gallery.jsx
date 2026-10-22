import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Camera,
  MapPin,
  Phone,
  ExternalLink,
  X,
  Building2,
  UserCheck,
  Calendar,
  CheckCircle2,
  Navigation,
} from 'lucide-react';
import { Card, CardBody } from '../../components/ui/Card.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { AWARI_ID, SAMARTH_ID } from '../../services/mockData.js';

export const Gallery = () => {
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'awari' | 'samarth'

  const awariPhotos = [
    {
      id: 'awari-1',
      url: '/photos/awari/dr_awari_consultation.jpeg',
      hospitalName: 'Dr. Awari Hospital',
      hospitalId: AWARI_ID,
      title: 'Dr. Ashish Awari (BHMS) Consultation Chamber',
      location: 'A/P Bota, Taluka Sangamner, Ahmednagar',
      phone: '9763245875',
      category: 'Physician & OPD',
      date: 'Surveyed: October 2026',
      description:
        'Dr. Ashish Awari (BHMS) seated at the physician consultation desk in Dr. Awari Hospital, Bota. Serving local patients across Sangamner taluka with homeopathic and primary healthcare consultations.',
      mapUrl: 'https://www.google.com/maps/search/?api=1&query=Dr+Awari+Hospital+Bota+Sangamner',
    },
  ];

  const samarthPhotos = [
    {
      id: 'samarth-1',
      url: '/photos/samarth/samarth_building_entrance.jpeg',
      hospitalName: 'Samarth Ayurved College Hospital & Research Centre',
      hospitalId: SAMARTH_ID,
      title: 'Hospital Campus & Main Entrance',
      location: 'Kalyan-Nagar Highway, Bangarwadi, Belhe, Tal. Junnar, Pune',
      phone: '8624843303',
      category: 'Campus Building',
      date: 'Surveyed: October 2026',
      description:
        'Front exterior view of Samarth Ayurved College Hospital & Research Centre, Belhe. Multi-storeyed 100-bed hospital complex with 24x7 emergency casualty, ICU, and teaching hospital facilities.',
      mapUrl: 'https://www.google.com/maps/search/?api=1&query=Samarth+Ayurved+College+Hospital+Belhe+Junnar',
    },
    {
      id: 'samarth-2',
      url: '/photos/samarth/samarth_reception_board.jpeg',
      hospitalName: 'Samarth Ayurved College Hospital & Research Centre',
      hospitalId: SAMARTH_ID,
      title: 'Official Welcome Board & Reception Counter',
      location: 'Kalyan-Nagar Highway, Belhe',
      phone: '8624843303',
      category: 'Reception & Helpdesk',
      date: 'Surveyed: October 2026',
      description:
        'Official signboard inside the hospital reception hall: "समर्थ रूरल एज्युकेशनल इन्स्टिट्युट संचलित समर्थ हॉस्पिटल अँड रिसर्च सेंटर, कल्याण-नगर महामार्ग, बेल्हे, ता. जुन्नर. ॥ सुस्वागतम ॥" Displays direct appointment line: 8624843303.',
      mapUrl: 'https://www.google.com/maps/search/?api=1&query=Samarth+Ayurved+College+Hospital+Belhe+Junnar',
    },
    {
      id: 'samarth-3',
      url: '/photos/samarth/samarth_reception_desk.jpeg',
      hospitalName: 'Samarth Ayurved College Hospital & Research Centre',
      hospitalId: SAMARTH_ID,
      title: 'Patient Intake & OPD Registration Counter',
      location: 'Belhe, Junnar',
      phone: '8624843303',
      category: 'Patient Care Desk',
      date: 'Surveyed: October 2026',
      description:
        'Receptionist counter and patient registration area where student engineering researchers interacted with hospital administrative staff to record bed vacancy and OPD operating procedures.',
      mapUrl: 'https://www.google.com/maps/search/?api=1&query=Samarth+Ayurved+College+Hospital+Belhe+Junnar',
    },
    {
      id: 'samarth-4',
      url: '/photos/samarth/dr_ramesh_padekar.jpeg',
      hospitalName: 'Samarth Ayurved College Hospital & Research Centre',
      hospitalId: SAMARTH_ID,
      title: 'Dr. Ramesh Padekar (M.O. & Deputy Superintendent)',
      location: 'Belhe, Junnar',
      phone: '9867253399',
      category: 'Physicians & Doctors',
      date: 'Surveyed: October 2026',
      description:
        'Dr. Ramesh Padekar (Medical Officer & Deputy Superintendent, BAMS MD Ayurveda) with medical officers and student surveyors in the consultation and administrative department.',
      mapUrl: 'https://www.google.com/maps/search/?api=1&query=Samarth+Ayurved+College+Hospital+Belhe+Junnar',
    },
    {
      id: 'samarth-5',
      url: '/photos/samarth/samarth_admin_office.jpeg',
      hospitalName: 'Samarth Ayurved College Hospital & Research Centre',
      hospitalId: SAMARTH_ID,
      title: 'Hospital Records & Administrative Room',
      location: 'Belhe, Junnar',
      phone: '8624843303',
      category: 'Administration',
      date: 'Surveyed: October 2026',
      description:
        'Administrative office where patient charts, PM-JAY scheme approvals, and day-to-day hospital operations are managed.',
      mapUrl: 'https://www.google.com/maps/search/?api=1&query=Samarth+Ayurved+College+Hospital+Belhe+Junnar',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header Banner */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <Badge variant="navy" size="md" className="border border-teal-500/30 text-teal-300 bg-teal-950/40">
          <Camera className="w-3.5 h-3.5 mr-1.5 text-teal-400" />
          Field Survey & Hospital Visual Records
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Hospital & Doctor Photo Gallery
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Actual on-ground photographic evidence and survey documentation collected from{' '}
          <strong>Dr. Awari Hospital (Bota)</strong> and{' '}
          <strong>Samarth Ayurved College Hospital & Research Centre (Belhe)</strong>.
          Click any photo to inspect in full view.
        </p>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeFilter === 'all'
                ? 'bg-teal-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Photos ({awariPhotos.length + samarthPhotos.length})
          </button>
          <button
            onClick={() => setActiveFilter('awari')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeFilter === 'awari'
                ? 'bg-teal-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Dr. Awari Hospital — Bota ({awariPhotos.length})
          </button>
          <button
            onClick={() => setActiveFilter('samarth')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeFilter === 'samarth'
                ? 'bg-teal-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Samarth Ayurved College Hospital — Belhe ({samarthPhotos.length})
          </button>
        </div>
      </div>

      {/* SECTION 1: Dr. Awari Hospital (Bota) */}
      {(activeFilter === 'all' || activeFilter === 'awari') && (
        <section className="space-y-6 pt-4 border-t border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-teal-50 to-slate-50 p-5 rounded-2xl border border-teal-100">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="success" size="sm">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Verified Facility
                </Badge>
                <Badge variant="neutral" size="sm">Private Clinic</Badge>
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Dr. Awari Hospital</h2>
              <p className="text-xs sm:text-sm text-slate-600 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span>A/P Bota, Taluka Sangamner, Dist. Ahmednagar, Maharashtra 422605</span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <a href="tel:9763245875">
                <Button variant="primary" size="sm">
                  <Phone className="w-3.5 h-3.5 mr-1.5" /> Call Dr. Awari (9763245875)
                </Button>
              </a>
              <a
                href="https://www.google.com/maps/search/?api=1&query=Dr+Awari+Hospital+Bota+Sangamner"
                target="_blank"
                rel="noreferrer"
              >
                <Button variant="outline" size="sm">
                  <Navigation className="w-3.5 h-3.5 mr-1.5 text-teal-600" /> Google Maps
                </Button>
              </a>
              <Link to={`/hospitals/${AWARI_ID}`}>
                <Button variant="secondary" size="sm">
                  View Profile
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {awariPhotos.map((photo) => (
              <Card
                key={photo.id}
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
                  <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/0 transition-colors" />
                </div>
                <CardBody className="p-4 space-y-2">
                  <h3 className="font-bold text-slate-800 text-sm group-hover:text-teal-600 transition-colors">
                    {photo.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {photo.description}
                  </p>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {photo.date}
                    </span>
                    <span className="text-teal-600 font-medium">Click to enlarge →</span>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* SECTION 2: Samarth Ayurved College Hospital & Research Centre (Belhe) */}
      {(activeFilter === 'all' || activeFilter === 'samarth') && (
        <section className="space-y-6 pt-4 border-t border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-teal-50 to-slate-50 p-5 rounded-2xl border border-teal-100">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="success" size="sm">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> 24x7 Emergency Active
                </Badge>
                <Badge variant="info" size="sm">100 Beds College Hospital</Badge>
                <Badge variant="neutral" size="sm">PM-JAY Enrolled</Badge>
              </div>
              <h2 className="text-2xl font-bold text-slate-900">
                Samarth Ayurved College Hospital & Research Centre
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span>Nagar-Kalyan Highway, Bangarwadi, Belhe, Tal. Junnar, Dist. Pune 412410</span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <a href="tel:8624843303">
                <Button variant="primary" size="sm">
                  <Phone className="w-3.5 h-3.5 mr-1.5" /> Call Desk (8624843303)
                </Button>
              </a>
              <a href="tel:9561035760">
                <Button variant="danger" size="sm">
                  <Phone className="w-3.5 h-3.5 mr-1.5" /> Ambulance (9561035760)
                </Button>
              </a>
              <a
                href="https://www.google.com/maps/search/?api=1&query=Samarth+Ayurved+College+Hospital+Belhe+Junnar"
                target="_blank"
                rel="noreferrer"
              >
                <Button variant="outline" size="sm">
                  <Navigation className="w-3.5 h-3.5 mr-1.5 text-teal-600" /> Google Maps
                </Button>
              </a>
              <Link to={`/hospitals/${SAMARTH_ID}`}>
                <Button variant="secondary" size="sm">
                  View Profile
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {samarthPhotos.map((photo) => (
              <Card
                key={photo.id}
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
                  <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/0 transition-colors" />
                </div>
                <CardBody className="p-4 space-y-2">
                  <h3 className="font-bold text-slate-800 text-sm group-hover:text-teal-600 transition-colors">
                    {photo.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {photo.description}
                  </p>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {photo.date}
                    </span>
                    <span className="text-teal-600 font-medium">Click to enlarge →</span>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Interactive Photo Lightbox / Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-xs text-teal-400 font-semibold uppercase tracking-wider block">
                  {selectedPhoto.hospitalName}
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

            {/* Modal Image Display */}
            <div className="flex-1 bg-black flex items-center justify-center overflow-hidden min-h-[300px] max-h-[55vh]">
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.title}
                className="max-h-full max-w-full object-contain"
              />
            </div>

            {/* Modal Footer Details */}
            <div className="p-5 bg-white space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant="info" size="sm">{selectedPhoto.category}</Badge>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {selectedPhoto.location}
                  </span>
                </div>
                <span className="text-xs text-slate-400">{selectedPhoto.date}</span>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {selectedPhoto.description}
              </p>

              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <a href={`tel:${selectedPhoto.phone}`}>
                    <Button variant="primary" size="sm">
                      <Phone className="w-3.5 h-3.5 mr-1" /> Call Hospital ({selectedPhoto.phone})
                    </Button>
                  </a>
                  <a href={selectedPhoto.mapUrl} target="_blank" rel="noreferrer">
                    <Button variant="outline" size="sm">
                      <Navigation className="w-3.5 h-3.5 mr-1 text-teal-600" /> Open in Google Maps
                    </Button>
                  </a>
                </div>
                <Link to={`/hospitals/${selectedPhoto.hospitalId}`} onClick={() => setSelectedPhoto(null)}>
                  <Button variant="secondary" size="sm">
                    Open Full Hospital Page
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
