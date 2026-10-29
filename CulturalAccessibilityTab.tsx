import React from 'react';
import {
  Heart, Accessibility, CheckCircle2, AlertTriangle, ShieldCheck,
  Clock, Compass, Users, Sparkles, Building2
} from 'lucide-react';
import { FullEventPlan } from '../types';

interface CulturalAccessibilityTabProps {
  plan: FullEventPlan;
  onRefreshPlan: () => void;
}

export const CulturalAccessibilityTab: React.FC<CulturalAccessibilityTabProps> = ({ plan }) => {
  const { event } = plan;

  return (
    <div className="space-y-6">
      {/* Section 8: Cultural Intelligence Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-emerald-950/30 to-slate-900 border border-emerald-500/30 shadow-xl">
        <div className="flex items-center gap-2 mb-2">
          <Heart className="w-5 h-5 text-emerald-400" />
          <h3 className="text-lg font-bold text-white">Cultural Intelligence & Sacred Timing</h3>
        </div>
        <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
          Section 8 & Operating Principle #3: Planora respects the sacred nuances of family and cultural heritage.
          We never apply generic templates or invent ritual timings. All auspicious Muhurtham hours and ceremony transitions require officiant/family sign-off.
        </p>
      </div>

      {/* Cultural Traditions Checklist */}
      <div className="bg-slate-850 rounded-2xl border border-slate-800 p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-sm text-slate-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            Configured Cultural Traditions ({event.cultural_traditions.length})
          </h4>
          <span className="text-[11px] text-amber-400 font-medium">
            Requires Officiant / Astrologer Confirmation
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {event.cultural_traditions.map((trad, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3 text-xs"
            >
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 font-bold text-[11px]">
                {idx + 1}
              </div>
              <div className="space-y-1">
                <span className="font-bold text-slate-100">{trad}</span>
                <p className="text-[11px] text-slate-400">
                  Transition buffers and sacred protocol flagged for coordinator execution.
                </p>
                <div className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="w-3 h-3" /> Family Aligned
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Accessibility & Guest Comfort Audit */}
      <div className="bg-slate-850 rounded-2xl border border-slate-800 p-5 shadow-lg space-y-4">
        <div className="flex items-center gap-2">
          <Accessibility className="w-5 h-5 text-sky-400" />
          <div>
            <h4 className="font-bold text-sm text-slate-100">
              Universal Accessibility & Guest Comfort Audit
            </h4>
            <p className="text-xs text-slate-400">
              Ensures dignity, comfort, and safety across all generations and abilities.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          {/* Mobility & Physical Access */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="font-bold text-sky-300 text-xs uppercase tracking-wider">
              1. Mobility & Step-Free Access
            </div>
            <ul className="space-y-1 text-slate-300">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Continuous ramp slope &lt; 1:12 to ceremonial platform</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Golf buggies stationed at entrance for elderly relatives</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Reserved front-row seating with wheelchair turning radius</span>
              </li>
            </ul>
          </div>

          {/* Dietary & Allergen Safety */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="font-bold text-amber-300 text-xs uppercase tracking-wider">
              2. Dietary & Cross-Contamination
            </div>
            <ul className="space-y-1 text-slate-300">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Strictly separate cookware & prep zone for Jain/Vegan meals</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Clear bilingual allergen signage on all buffet stations</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Nut-free and celiac-safe portions pre-plated</span>
              </li>
            </ul>
          </div>

          {/* Sensory & Rest Comfort */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="font-bold text-emerald-300 text-xs uppercase tracking-wider">
              3. Sensory Lounge & Facilities
            </div>
            <ul className="space-y-1 text-slate-300">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Quiet recovery lounge for infants, nursing mothers & seniors</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Sensory-friendly ear defenders available at welcome desk</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Air-conditioned hydration kiosks with cold infused water</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Section 12: Community Events & Compliance (if community or festival) */}
      <div className="bg-slate-850 rounded-2xl border border-slate-800 p-5 shadow-lg space-y-4">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-indigo-400" />
          <div>
            <h4 className="font-bold text-sm text-slate-100">
              Section 12: Community, Civic & Public Gathering Protocol
            </h4>
            <p className="text-xs text-slate-400">
              Volunteer rosters, municipal permits, crowd flow, and sponsor pitch frameworks.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
            <span className="font-bold text-slate-200 block mb-1">Municipal Permits & Sound</span>
            <p className="text-slate-400 text-[11px]">
              Civic park authorization, fire marshal inspection sign-off, and police Baraat road clearance.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
            <span className="font-bold text-slate-200 block mb-1">Crowd Flow & Evacuation</span>
            <p className="text-slate-400 text-[11px]">
              Dual ingress/egress corridors, lighted exit paths, and stationed EMT paramedic team.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
            <span className="font-bold text-slate-200 block mb-1">Volunteer Shift Rosters</span>
            <p className="text-slate-400 text-[11px]">
              2-hour rotating hospitality shifts with digital QR check-in and emergency walkie-talkie channel.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
