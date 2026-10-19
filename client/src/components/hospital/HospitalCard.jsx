import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Bed, HeartPulse, Clock, ShieldCheck, ChevronRight, AlertTriangle } from 'lucide-react';
import { Card, CardBody } from '../ui/Card.jsx';
import { Badge } from '../ui/Badge.jsx';
import { Button } from '../ui/Button.jsx';
import { timeAgo, isStale, getBedStatusColor } from '../../utils/formatTime.js';

export const HospitalCard = ({ hospital }) => {
  const genColor = getBedStatusColor(hospital.general_avail, hospital.general_total);
  const icuColor = getBedStatusColor(hospital.icu_avail, hospital.icu_total);
  const stale = isStale(hospital.beds_updated_at);

  return (
    <Card hover className="flex flex-col h-full border-slate-200">
      <CardBody className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Header Row: Title and Type */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <h3 className="font-bold text-slate-900 text-lg group-hover:text-teal-600 transition-colors leading-snug">
                {hospital.name}
              </h3>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{hospital.taluka ? `${hospital.taluka}, ` : ''}{hospital.district || 'Maharashtra'}</span>
              </p>
            </div>
            <Badge variant={hospital.type === 'college' ? 'info' : 'neutral'} size="sm" className="shrink-0 uppercase">
              {hospital.type}
            </Badge>
          </div>

          <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
            {hospital.address}
          </p>

          {/* Badges strip */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {hospital.is_24x7 && (
              <Badge variant="success" size="sm" dot>
                24x7 Emergency
              </Badge>
            )}
            {hospital.pmjay && (
              <Badge variant="info" size="sm">
                PM-JAY Enrolled
              </Badge>
            )}
            {hospital.cashless && (
              <Badge variant="neutral" size="sm">
                Cashless
              </Badge>
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
                <AlertTriangle className="w-3 h-3" /> May be outdated
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
          <Link to={`/hospitals/${hospital.id}`} className="flex-1">
            <Button variant="secondary" size="sm" className="w-full justify-between">
              <span>View Details & OPD</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </Button>
          </Link>
          <Link to={`/book-appointment?hospitalId=${hospital.id}`}>
            <Button variant="primary" size="sm">
              Book
            </Button>
          </Link>
        </div>
      </CardBody>
    </Card>
  );
};
