import React from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Phone,
  Bed,
  HeartPulse,
  Clock,
  ShieldCheck,
  ChevronRight,
  AlertTriangle,
  Navigation,
  Camera,
} from 'lucide-react';
import { Card, CardBody } from '../ui/Card.jsx';
import { Badge } from '../ui/Badge.jsx';
import { Button } from '../ui/Button.jsx';
import { timeAgo, isStale, getBedStatusColor } from '../../utils/formatTime.js';

export const HospitalCard = ({ hospital }) => {
  const genColor = getBedStatusColor(hospital.general_avail, hospital.general_total);
  const icuColor = getBedStatusColor(hospital.icu_avail, hospital.icu_total);
  const stale = isStale(hospital.beds_updated_at);

  const photoUrl =
    hospital.primary_photo ||
    (hospital.taluka === 'Sangamner'
      ? '/photos/awari/dr_awari_consultation.jpeg'
      : '/photos/samarth/samarth_building_entrance.jpeg');

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    hospital.name + ' ' + (hospital.address || '')
  )}`;

  return (
    <Card hover className="flex flex-col h-full border-slate-200 overflow-hidden group">
      {/* Photo Header */}
      <div className="relative h-44 bg-slate-900 overflow-hidden">
        <img
          src={photoUrl}
          alt={hospital.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <Badge variant={hospital.type === 'college' ? 'info' : 'neutral'} size="sm" className="uppercase bg-slate-900/80 backdrop-blur-sm text-white">
            {hospital.type}
          </Badge>
          {hospital.is_24x7 && (
            <Badge variant="success" size="sm" dot className="bg-slate-900/80 backdrop-blur-sm">
              24x7 Emergency
            </Badge>
          )}
        </div>

        <div className="absolute top-3 right-3">
          <Link
            to="/photos"
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-900/70 hover:bg-slate-900 text-white text-[11px] font-medium backdrop-blur-sm transition-colors"
          >
            <Camera className="w-3 h-3 text-teal-400" />
            <span>Photos</span>
          </Link>
        </div>

        <div className="absolute bottom-2.5 left-3 right-3 text-white">
          <h3 className="font-bold text-base sm:text-lg line-clamp-1 text-white leading-tight">
            {hospital.name}
          </h3>
          <p className="text-xs text-slate-300 flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3 text-teal-400 shrink-0" />
            <span className="truncate">{hospital.taluka ? `${hospital.taluka}, ` : ''}{hospital.district || 'Maharashtra'}</span>
          </p>
        </div>
      </div>

      <CardBody className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <p className="text-xs text-slate-600 line-clamp-2 mb-3 leading-relaxed">
            {hospital.address}
          </p>

          {/* Badges strip */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {hospital.pmjay && (
              <Badge variant="info" size="sm">
                PM-JAY Enrolled
              </Badge>
            )}
            {hospital.cashless ? (
              <Badge variant="neutral" size="sm">
                Cashless
              </Badge>
            ) : (
              <Badge variant="neutral" size="sm">
                Direct / Cash
              </Badge>
            )}
            {hospital.phone && (
              <span className="text-[11px] font-mono text-slate-600 flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-full">
                <Phone className="w-2.5 h-2.5 text-teal-600" /> {hospital.phone}
              </span>
            )}
          </div>

          {/* Live Bed Summary Grid */}
          <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 mb-3">
            <div>
              <span className="text-[11px] font-medium text-slate-500 block mb-0.5 flex items-center gap-1">
                <Bed className="w-3 h-3 text-slate-400" /> General Beds
              </span>
              <span className="text-base font-bold text-slate-800">
                {hospital.general_avail ?? 0}
                <span className="text-xs font-normal text-slate-400"> / {hospital.general_total ?? 0}</span>
              </span>
            </div>

            <div>
              <span className="text-[11px] font-medium text-slate-500 block mb-0.5 flex items-center gap-1">
                <HeartPulse className="w-3 h-3 text-rose-500" /> ICU Beds
              </span>
              <span className="text-base font-bold text-slate-800">
                {hospital.icu_avail ?? 0}
                <span className="text-xs font-normal text-slate-400"> / {hospital.icu_total ?? 0}</span>
              </span>
            </div>
          </div>

          {/* Staleness Notice */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-4">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>Updated {timeAgo(hospital.beds_updated_at)}</span>
            </span>
            {stale && (
              <span className="flex items-center gap-1 text-amber-600 font-medium">
                <AlertTriangle className="w-3 h-3" /> Live
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-slate-100 space-y-2">
          <div className="flex items-center gap-2">
            <Link to={`/hospitals/${hospital.id}`} className="flex-1">
              <Button variant="secondary" size="sm" className="w-full justify-between">
                <span>Details & OPD</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </Button>
            </Link>
            <Link to={`/book-appointment?hospitalId=${hospital.id}`}>
              <Button variant="primary" size="sm">
                Book
              </Button>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {hospital.phone && (
              <a href={`tel:${hospital.phone}`} className="flex-1">
                <Button variant="outline" size="sm" className="w-full text-xs text-slate-700">
                  <Phone className="w-3 h-3 mr-1 text-teal-600" />
                  Call: {hospital.phone}
                </Button>
              </a>
            )}
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noreferrer"
              title="Open location in Google Maps"
              className="p-1.5 rounded-lg border border-slate-200 hover:border-teal-500 text-slate-600 hover:text-teal-600 transition-colors"
            >
              <Navigation className="w-4 h-4" />
            </a>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};
