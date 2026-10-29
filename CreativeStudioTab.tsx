import React, { useState } from 'react';
import {
  Sparkles, Palette, Camera, Music, Utensils, Sun,
  Check, Copy, Compass, Eye, Heart
} from 'lucide-react';
import { FullEventPlan } from '../types';

interface CreativeStudioTabProps {
  plan: FullEventPlan;
  onRefreshPlan: () => void;
}

export const CreativeStudioTab: React.FC<CreativeStudioTabProps> = ({ plan }) => {
  const { event } = plan;
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const copyColor = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1800);
  };

  return (
    <div className="space-y-6">
      {/* Hero Creative Brief Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-xs uppercase font-extrabold tracking-wider text-indigo-400">
            Section 4: Vibe-to-Event Generator
          </span>
        </div>
        <h3 className="text-2xl font-extrabold text-white">{event.theme}</h3>
        <p className="text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed italic">
          "{event.atmosphere}"
        </p>

        {/* Color Palette Swatches */}
        <div className="mt-5 pt-4 border-t border-slate-800">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-indigo-400" />
            Curated Color Palette (Click to Copy Hex)
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {event.color_palette.map((hex, i) => (
              <button
                key={i}
                onClick={() => copyColor(hex)}
                className="group flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-750 hover:border-indigo-500/50 transition cursor-pointer"
              >
                <div
                  className="w-5 h-5 rounded-full border border-white/20 shadow-inner group-hover:scale-110 transition"
                  style={{ backgroundColor: hex }}
                />
                <span className="font-mono text-xs text-slate-200 group-hover:text-white">
                  {hex}
                </span>
                {copiedHex === hex ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3 text-slate-500 group-hover:text-slate-300 opacity-0 group-hover:opacity-100 transition" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Aesthetic Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Visual & Decor Direction */}
        <div className="p-5 rounded-2xl bg-slate-850 border border-slate-800 shadow-md space-y-2">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Sun className="w-4 h-4" />
            <span>Lighting & Staging</span>
          </div>
          <h4 className="font-bold text-slate-100 text-sm">Visual Atmosphere</h4>
          <p className="text-xs text-slate-300 leading-relaxed">{event.visual_style}</p>
          <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
            Sourcing reality check: Focus floral density at focal ceremony altar & sweetheart table; use ambient warm uplighting for expansive courtyards.
          </div>
        </div>

        {/* Menu & Catering Concept */}
        <div className="p-5 rounded-2xl bg-slate-850 border border-slate-800 shadow-md space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Utensils className="w-4 h-4" />
            <span>Culinary Direction</span>
          </div>
          <h4 className="font-bold text-slate-100 text-sm">Food & Beverage Experience</h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            Multi-sensory dining tailored to guest demographics. Regional live stations with strictly segregated Jain/Vegan allergen handling.
          </p>
          <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
            Guest comfort rule: Roving passed appetizers during speeches; dedicated mocktail bar with infused botanical tonics.
          </div>
        </div>

        {/* Music & Sound Mood */}
        <div className="p-5 rounded-2xl bg-slate-850 border border-slate-800 shadow-md space-y-2">
          <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-wider">
            <Music className="w-4 h-4" />
            <span>Acoustic Landscape</span>
          </div>
          <h4 className="font-bold text-slate-100 text-sm">Sound & Performance Flow</h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            Acoustic melodies during welcoming; dynamic crescendo for celebratory entrance; late night dance playlist compliant with municipal 22:00 sound curfew.
          </p>
          <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
            Regulatory check: dB level capped at 85dB at outdoor perimeter.
          </div>
        </div>

        {/* Photography & Visual Memory */}
        <div className="p-5 rounded-2xl bg-slate-850 border border-slate-800 shadow-md space-y-2">
          <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
            <Camera className="w-4 h-4" />
            <span>Visual Documentation</span>
          </div>
          <h4 className="font-bold text-slate-100 text-sm">Cinematic & Candid Brief</h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            Documentary photojournalistic style capturing candid family interactions and Golden Hour sunset lighting over the lake/landscape.
          </p>
          <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
            Priority rule: Protected by couple; 25-minute fast family portrait sequence staged before sunset.
          </div>
        </div>

        {/* Guest Experience & Empathy */}
        <div className="p-5 rounded-2xl bg-slate-850 border border-slate-800 shadow-md space-y-2">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
            <Heart className="w-4 h-4" />
            <span>Hospitality & Comfort</span>
          </div>
          <h4 className="font-bold text-slate-100 text-sm">Guest Journey Design</h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            From arrival shuttles to chilled towels, shaded courtyard benches, and golf buggies for elderly relatives.
          </p>
          <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
            Accessibility standards: Continuous wheelchair grade to all ceremonial zones.
          </div>
        </div>

        {/* Sourcing Reality Check */}
        <div className="p-5 rounded-2xl bg-slate-850 border border-slate-800 shadow-md space-y-2">
          <div className="flex items-center gap-2 text-teal-400 text-xs font-bold uppercase tracking-wider">
            <Compass className="w-4 h-4" />
            <span>Feasibility & Sourcing</span>
          </div>
          <h4 className="font-bold text-slate-100 text-sm">Implementation Guardrails</h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            All proposed decorative items use locally sourced seasonal flora and rental brassware rather than single-use imported plastics.
          </p>
          <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
            Operating principle: Never promise moodboard concepts that exceed the verified budget line.
          </div>
        </div>
      </div>
    </div>
  );
};
