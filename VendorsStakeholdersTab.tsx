import React, { useState } from 'react';
import {
  Store, Users, FileText, CheckCircle2, AlertCircle, Copy,
  Check, Star, ShieldCheck, Scale, Sparkles
} from 'lucide-react';
import { FullEventPlan, Vendor, Stakeholder } from '../types';

interface VendorsStakeholdersTabProps {
  plan: FullEventPlan;
  onRefreshPlan: () => void;
}

export const VendorsStakeholdersTab: React.FC<VendorsStakeholdersTabProps> = ({ plan }) => {
  const { event, vendors, stakeholders } = plan;
  const currency = event.currency;

  const [rfpModalOpen, setRfpModalOpen] = useState(false);
  const [selectedVendorCategory, setSelectedVendorCategory] = useState('Food and beverages');
  const [rfpCopied, setRfpCopied] = useState(false);

  const generateRFPText = (cat: string) => {
    return `REQUEST FOR QUOTATION (RFQ / RFP)
Event: ${event.name} (${event.occasion})
Date: ${event.date_range}
Location: ${event.location}
Guest Count: ${event.guest_count} attendees
Category: ${cat}

REQUIREMENTS & SPECIFICATIONS:
- High quality service matching theme: "${event.theme}"
- Atmosphere: ${event.atmosphere}
- Protected Requirements: ${event.protected_priorities.join('; ')}
- Accessibility & Dietary: ${event.accessibility_requirements.join('; ')}
${event.cultural_traditions.length > 0 ? `- Cultural Traditions: ${event.cultural_traditions.join('; ')}\n` : ''}
CONTRACTUAL & QUOTE CONDITIONS:
1. Please provide an itemized quote including all base rates, equipment riders, taxes, travel fees, and overtime rates.
2. Outline deposit schedule and cancellation / postponement terms (including adverse weather clause).
3. Specify setup and breakdown window requirements.
4. Response deadline: Within 5 business days.

Note: Transmitted via Planora AI Planning Engine on behalf of Event Host.`;
  };

  const copyRfp = () => {
    navigator.clipboard.writeText(generateRFPText(selectedVendorCategory));
    setRfpCopied(true);
    setTimeout(() => setRfpCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Section 9: Vendor Comparison Matrix */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Store className="w-5 h-5 text-indigo-400" />
              <h3 className="text-lg font-bold text-white">Vendor Comparison & Outreach Matrix</h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Section 9: Standardized comparison covering deliverables, reliability fit scores, deposit conditions, and cancellation terms.
            </p>
          </div>

          <button
            onClick={() => setRfpModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md transition cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Draft Standardized RFP</span>
          </button>
        </div>

        {/* Vendors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vendors.map((v) => (
            <div
              key={v.id}
              className="p-5 rounded-2xl bg-slate-850 border border-slate-800 hover:border-slate-700 shadow-md space-y-3 transition"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-indigo-300 border border-slate-700">
                    {v.category}
                  </span>
                  <h4 className="font-bold text-base text-slate-100 mt-1">{v.name}</h4>
                  <div className="text-xs text-slate-400">{v.contact_info}</div>
                </div>

                <div className="text-right">
                  <div className="font-mono text-sm font-bold text-slate-100">
                    {currency} {v.quote_amount.toLocaleString()}
                  </div>
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border mt-1 ${
                      v.status === 'Contracted'
                        ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                        : v.status === 'Negotiating'
                        ? 'bg-sky-950/60 text-sky-300 border-sky-500/40'
                        : 'bg-amber-950/60 text-amber-300 border-amber-500/40'
                    }`}
                  >
                    {v.status}
                  </span>
                </div>
              </div>

              {/* Deliverables */}
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                <span className="text-slate-400 font-semibold block text-[10px] uppercase mb-0.5">
                  Scope of Deliverables:
                </span>
                <p className="text-slate-200">{v.deliverables}</p>
              </div>

              {/* Terms & Cancellation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1">
                <div>
                  <span className="font-medium text-slate-500">Contract Terms:</span>{' '}
                  <span className="text-slate-300">{v.terms}</span>
                </div>
                <div>
                  <span className="font-medium text-slate-500">Cancellation Policy:</span>{' '}
                  <span className="text-slate-300">{v.cancellation_policy}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                <div className="flex items-center gap-1 text-amber-400">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span className="font-bold">Suitability Fit Score: {v.fit_score}/100</span>
                </div>
                <span className="text-[11px] text-slate-500 italic">{v.notes}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 10: Stakeholder Alignment */}
      <div className="p-6 rounded-2xl bg-slate-850 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center gap-2">
          <Scale className="w-5 h-5 text-emerald-400" />
          <div>
            <h3 className="text-lg font-bold text-white">Family & Stakeholder Alignment Console</h3>
            <p className="text-xs text-slate-400">
              Section 10: When multiple stakeholders express conflicting priorities, Planora maps differences neutrally and presents balanced compromises.
            </p>
          </div>
        </div>

        {/* Stakeholder Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stakeholders.map((s) => (
            <div key={s.id} className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-100">{s.name}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  {s.role}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Stated Core Priorities:
                </span>
                <div className="flex flex-wrap gap-1">
                  {s.stated_priorities.map((p, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-slate-800 text-emerald-300 text-[11px]">
                      • {p}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/60 space-y-1 text-[11px] text-slate-400">
                <div>
                  Budget Opinion: <b className="text-slate-200">{s.budget_opinion}</b>
                </div>
                <div>
                  Target Headcount: <b className="text-slate-200">{s.guest_count_opinion} guests</b>
                </div>
                {s.notes && <div className="text-slate-400 italic">"{s.notes}"</div>}
              </div>
            </div>
          ))}
        </div>

        {/* Neutral Compromise Engine */}
        <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs text-emerald-200 space-y-2">
          <div className="flex items-center gap-2 font-bold text-emerald-300 text-sm">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Planora Neutral Compromise Recommendation</span>
          </div>
          <p className="leading-relaxed text-slate-300">
            <strong>Headcount & Ritual Alignment</strong>: Bride & Groom prefer 250-280 guests with high-end photography and acoustic music; Parents prefer 300 guests with strict Vedic Muhurtham and Jain banqueting.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-[11px]">
            <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="font-bold text-emerald-400 block mb-1">Option A: Tiered Ceremony/Reception Split</span>
              Invite extended family (300 pax) to the sacred Sunset Muhurtham Pheras & Royal Banquet; keep the late-night Sangeet afterparty intimate (240 pax). Satisfies parent hospitality while preventing sound & catering blowout.
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="font-bold text-sky-400 block mb-1">Option B: Auxiliary Arcade Buffet Flow</span>
              Accommodate the 280-300 guest count by deploying 3 auxiliary high-top arcade tables with dedicated Jain service counters, shaving non-essential perimeter marigold arches by ₹60k to fund the extra covers.
            </div>
          </div>
        </div>
      </div>

      {/* RFP Generator Modal */}
      {rfpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl p-6 relative">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-400" />
              Standardized Vendor RFP Generator (Section 9)
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Includes full event parameters, setup windows, overtime clauses, dietary riders, and cancellation policies.
            </p>

            <div className="mb-4">
              <label className="block text-xs font-medium text-slate-300 mb-1">Vendor Category</label>
              <select
                value={selectedVendorCategory}
                onChange={(e) => setSelectedVendorCategory(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
              >
                <option value="Venue">Venue</option>
                <option value="Food and beverages">Food and beverages (Catering)</option>
                <option value="Decoration and lighting">Decoration & Lighting</option>
                <option value="Photography and videography">Photography & Videography</option>
                <option value="Entertainment">Entertainment & Audio</option>
                <option value="Transport and accommodation">Transport & Shuttles</option>
              </select>
            </div>

            <div className="relative">
              <textarea
                readOnly
                rows={12}
                value={generateRFPText(selectedVendorCategory)}
                className="w-full font-mono text-xs p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 leading-relaxed focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-800">
              <span className="text-[11px] text-slate-400 italic">
                Rule #9: Explicit user authorization required before contacting vendors.
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setRfpModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Close
                </button>
                <button
                  onClick={copyRfp}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow"
                >
                  {rfpCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{rfpCopied ? 'Copied RFP to Clipboard' : 'Copy RFP Draft'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
