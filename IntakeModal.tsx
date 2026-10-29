import React, { useState } from 'react';
import { X, Sparkles, CheckCircle2, ChevronRight, Wand2 } from 'lucide-react';
import { EventData } from '../types';

interface IntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateEvent: (event: Partial<EventData>) => Promise<void>;
}

export const IntakeModal: React.FC<IntakeModalProps> = ({ isOpen, onClose, onCreateEvent }) => {
  if (!isOpen) return null;

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  // Form fields
  const [name, setName] = useState('');
  const [occasion, setOccasion] = useState('');
  const [eventType, setEventType] = useState<'wedding' | 'birthday' | 'reunion' | 'festival' | 'college_event' | 'community'>('wedding');
  const [dateRange, setDateRange] = useState('2026-11-20');
  const [location, setLocation] = useState('');
  const [guestCount, setGuestCount] = useState(120);
  const [totalBudget, setTotalBudget] = useState(30000);
  const [currency, setCurrency] = useState('USD');
  const [atmosphere, setAtmosphere] = useState('Warm, joyous, intimate, and memorable');
  const [theme, setTheme] = useState('Contemporary Elegance');
  const [visualStyle, setVisualStyle] = useState('Warm string lights, organic florals, brass & linen textures');
  const [protectedPriorities, setProtectedPriorities] = useState('Gourmet food & drinks, Live music, Candid photography');
  const [culturalTraditions, setCulturalTraditions] = useState('Sunset ceremony timing, Welcome blessings');
  const [accessibilityReqs, setAccessibilityReqs] = useState('Step-free wheelchair access, Vegetarian/Gluten-Free options, Quiet lounge');

  // Presets
  const applyPreset = (preset: string) => {
    if (preset === 'indian_wedding') {
      setName('The Royal Lake Palace Wedding: Ria & Rohan');
      setOccasion('3-Day Destination Royal Wedding');
      setEventType('wedding');
      setDateRange('Dec 10-12, 2026');
      setLocation('Lake Palace Courtyard, Udaipur');
      setGuestCount(250);
      setTotalBudget(4000000);
      setCurrency('INR');
      setAtmosphere('Regal, opulent, vibrant, heartfelt family celebration');
      setTheme('Mughal & Rajput Royalty');
      setVisualStyle('Marigold arches, candlelit reflecting pools, vintage brass lanterns, velvet drapery');
      setProtectedPriorities('Authentic Regional & Jain Catering, Candid Cinematographer, Live Sufi/Bollywood Troupe');
      setCulturalTraditions('Mehendi ceremony, Sangeet night, Vedic sunset muhurtham pheras, Baraat horse procession');
      setAccessibilityReqs('Golf buggies for grandparents, Ramp to mandap stage, Separate Jain kitchen, Infant rest lounge');
    } else if (preset === 'tech_reunion') {
      setName('MIT Class of 2016 — 10 Year Reunion');
      setOccasion('10-Year College Reunion & Tech Mixer');
      setEventType('reunion');
      setDateRange('Oct 24, 2026');
      setLocation('Boston Harbor Loft & Rooftop Deck');
      setGuestCount(150);
      setTotalBudget(55000);
      setCurrency('USD');
      setAtmosphere('Cozy, nostalgic, high energy, nostalgic playlist');
      setTheme('2010s Campus Throwback & Innovation');
      setVisualStyle('Industrial brick, Edison festoon bulbs, polaroid memory wall, harbor lights');
      setProtectedPriorities('Open Bar with craft beer, Gourmet Slider & Taco Stations, 2010s Live Cover Band');
      setCulturalTraditions('Class trivia bowl, Toast to faculty, Late-night campus song circle');
      setAccessibilityReqs('Elevator to rooftop, Non-alcoholic mocktail bar, Celiac-safe food preparation');
    } else if (preset === 'community_fest') {
      setName('Civic Green Harvest & Solar Fair');
      setOccasion('Annual Neighborhood Eco-Gathering');
      setEventType('community');
      setDateRange('Nov 07, 2026');
      setLocation('Riverfront Public Amphitheater');
      setGuestCount(500);
      setTotalBudget(16000);
      setCurrency('USD');
      setAtmosphere('Welcoming, family-friendly, educational, zero-waste');
      setTheme('Community Harvest & Renewable Future');
      setVisualStyle('Burlap banners, local potted saplings, straw seating, solar-powered fairy lights');
      setProtectedPriorities('Free Kid Eco-Workshops, Zero-Waste Sorting Crew, ASL Stage Interpreter');
      setCulturalTraditions('Indigenous land acknowledgment, Community harvest potluck bread breaking');
      setAccessibilityReqs('All pathways ADA paved, Sensory-friendly quiet zone with ear defenders, Companion care restrooms');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onCreateEvent({
        name,
        occasion,
        event_type: eventType,
        date_range: dateRange,
        location,
        guest_count: Number(guestCount),
        total_budget: Number(totalBudget),
        currency,
        atmosphere,
        theme,
        visual_style: visualStyle,
        protected_priorities: protectedPriorities.split(',').map((s) => s.trim()).filter(Boolean),
        cultural_traditions: culturalTraditions.split(',').map((s) => s.trim()).filter(Boolean),
        accessibility_requirements: accessibilityReqs.split(',').map((s) => s.trim()).filter(Boolean),
        status: 'Planning',
      });
      onClose();
    } catch (err) {
      alert(`Error creating event: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <Sparkles className="w-4 h-4" />
          </div>
          <h2 className="text-xl font-bold text-white">Planora Conversational Event Intake</h2>
        </div>
        <p className="text-xs text-slate-400 mb-6">
          Section 3 Intake: Progressively capture requirements, hard constraints, and protected priorities without generic guesswork.
        </p>

        {/* 1-Click Test Presets */}
        <div className="mb-6 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 mb-2">
            <Wand2 className="w-3.5 h-3.5" />
            <span>Fast Setup: Load Realistic Demo Presets</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => applyPreset('indian_wedding')}
              className="text-left text-xs p-2 rounded-lg bg-slate-800 hover:bg-emerald-950/50 hover:border-emerald-500/40 border border-slate-700 transition"
            >
              <div className="font-semibold text-slate-200">Royal Indian Wedding</div>
              <div className="text-[11px] text-slate-400">3-Day Destination, ₹40L</div>
            </button>
            <button
              type="button"
              onClick={() => applyPreset('tech_reunion')}
              className="text-left text-xs p-2 rounded-lg bg-slate-800 hover:bg-emerald-950/50 hover:border-emerald-500/40 border border-slate-700 transition"
            >
              <div className="font-semibold text-slate-200">10-Yr Tech Reunion</div>
              <div className="text-[11px] text-slate-400">Harbor Rooftop, $55k</div>
            </button>
            <button
              type="button"
              onClick={() => applyPreset('community_fest')}
              className="text-left text-xs p-2 rounded-lg bg-slate-800 hover:bg-emerald-950/50 hover:border-emerald-500/40 border border-slate-700 transition"
            >
              <div className="font-semibold text-slate-200">Harvest & Solar Fest</div>
              <div className="text-[11px] text-slate-400">Eco-Amphitheater, $16k</div>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Step 1: Core Logistics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Event Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Maya & Leo's Wedding"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Occasion / Subtitle</label>
              <input
                type="text"
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
                placeholder="e.g. Coastal Wedding Celebration"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Event Type</label>
              <select
                value={eventType}
                onChange={(e: any) => setEventType(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                <option value="wedding">Wedding</option>
                <option value="birthday">Birthday</option>
                <option value="reunion">Reunion</option>
                <option value="festival">Festival</option>
                <option value="college_event">College Event</option>
                <option value="community">Community Gathering</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Date / Date Range *</label>
              <input
                type="text"
                required
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                placeholder="e.g. Nov 20-22, 2026"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Location / Venue</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Carmel Valley Estate, CA"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
          </div>

          {/* Step 2: Financial Ceiling */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-3 bg-slate-800/40 rounded-xl border border-slate-750">
            <div>
              <label className="block text-xs font-semibold text-emerald-400 mb-1">
                Total Budget Ceiling *
              </label>
              <input
                type="number"
                min="500"
                required
                value={totalBudget}
                onChange={(e) => setTotalBudget(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
              <span className="text-[10px] text-slate-400">Strict hard ceiling (Rule #1)</span>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                <option value="USD">USD ($)</option>
                <option value="INR">INR (₹)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="CAD">CAD ($)</option>
                <option value="AUD">AUD ($)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Expected Guests</label>
              <input
                type="number"
                min="5"
                value={guestCount}
                onChange={(e) => setGuestCount(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
          </div>

          {/* Step 3: Vibe & Aesthetics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Atmosphere & Emotional Vibe
              </label>
              <textarea
                rows={2}
                value={atmosphere}
                onChange={(e) => setAtmosphere(e.target.value)}
                placeholder="e.g. Cozy, nostalgic, slightly chaotic, joyful celebration"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Theme & Visual Style
              </label>
              <textarea
                rows={2}
                value={visualStyle}
                onChange={(e) => setVisualStyle(e.target.value)}
                placeholder="e.g. Warm cafe festoon lighting, earthy neutral tones with gold accents"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
          </div>

          {/* Step 4: Priorities, Traditions & Accessibility */}
          <div>
            <label className="block text-xs font-semibold text-amber-400 mb-1">
              🔒 Protected Priorities (Comma separated)
            </label>
            <input
              type="text"
              value={protectedPriorities}
              onChange={(e) => setProtectedPriorities(e.target.value)}
              placeholder="e.g. Catering & Open Bar, Candid Photographer, Live Band"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
            <span className="text-[10px] text-slate-400">Rule #8: Planora will never silently cut these to force budget balance.</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Cultural Traditions / Rituals
              </label>
              <input
                type="text"
                value={culturalTraditions}
                onChange={(e) => setCulturalTraditions(e.target.value)}
                placeholder="e.g. Sunset pheras, Tea ceremony, Traditional toasts"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Accessibility & Dietary Inclusivity
              </label>
              <input
                type="text"
                value={accessibilityReqs}
                onChange={(e) => setAccessibilityReqs(e.target.value)}
                placeholder="e.g. Wheelchair ramp, Vegan/Jain food, Quiet sensory room"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded-lg shadow-lg shadow-emerald-600/20 transition cursor-pointer"
            >
              {loading ? 'Synthesizing Event Plan...' : 'Generate Planora Master Plan'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
