import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  MessageSquare, Wallet, Clock, ShieldAlert, Activity,
  Sparkles, Store, Heart, RefreshCw, AlertCircle
} from 'lucide-react';

import { EventData, FullEventPlan, ValidationReport } from './types';
import { fetchAllEvents, fetchEventDetails, createNewEvent, checkBackendHealth } from './api';

import { Navbar } from './components/Navbar';
import { IntakeModal } from './components/IntakeModal';
import { ValidationGateModal } from './components/ValidationGateModal';
import { SettingsModal } from './components/SettingsModal';

import { PlanoraChatTab } from './components/PlanoraChatTab';
import { BudgetTab } from './components/BudgetTab';
import { TimelineTab } from './components/TimelineTab';
import { StressTestTab } from './components/StressTestTab';
import { DayOfIncidentTab } from './components/DayOfIncidentTab';
import { CreativeStudioTab } from './components/CreativeStudioTab';
import { VendorsStakeholdersTab } from './components/VendorsStakeholdersTab';
import { CulturalAccessibilityTab } from './components/CulturalAccessibilityTab';

export function App() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const [currentPlan, setCurrentPlan] = useState<FullEventPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('chat');

  // Modals
  const [intakeOpen, setIntakeOpen] = useState(false);
  const [validationOpen, setValidationOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [apiKeyConfigured, setApiKeyConfigured] = useState(false);

  const loadAll = async (targetEventId?: string) => {
    try {
      const evList = await fetchAllEvents();
      setEvents(evList);

      const targetId = targetEventId || selectedEvent?.id || evList[0]?.id;
      if (targetId) {
        const fullPlan = await fetchEventDetails(targetId);
        setCurrentPlan(fullPlan);
        setSelectedEvent(fullPlan.event);
      }

      const health = await checkBackendHealth();
      setApiKeyConfigured(health.gemini_api_key_configured);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleSelectEvent = async (event: EventData) => {
    setSelectedEvent(event);
    setLoading(true);
    try {
      const fullPlan = await fetchEventDetails(event.id);
      setCurrentPlan(fullPlan);
    } catch (err) {
      console.error('Failed to load event details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (payload: Partial<EventData>) => {
    const res = await createNewEvent(payload);
    confetti({ particleCount: 75, spread: 60, origin: { y: 0.7 } });
    await loadAll(res.event_id);
    setActiveTab('chat');
  };

  const handleExportPlan = () => {
    if (!currentPlan) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(currentPlan, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${currentPlan.event.name.replace(/\s+/g, '_')}_Planora_Master_Plan.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const tabs = [
    { id: 'chat', label: 'Planora Agent', icon: MessageSquare, badge: null },
    { id: 'budget', label: 'Budget Negotiator', icon: Wallet, badge: currentPlan?.reconciliation.is_over_budget ? 'Deficit' : null },
    { id: 'timeline', label: 'Timeline & Logistics', icon: Clock, badge: currentPlan?.timeline_analysis.critical_path_ids.length ? `${currentPlan.timeline_analysis.critical_path_ids.length} Critical` : null },
    { id: 'stress', label: 'Red Team (Stress-Test)', icon: ShieldAlert, badge: `${currentPlan?.stress_tests.length || 0} Vectors` },
    { id: 'dayof', label: 'Day-Of Live Mode', icon: Activity, badge: currentPlan?.incidents.length ? 'Live' : null },
    { id: 'creative', label: 'Creative Studio', icon: Sparkles, badge: null },
    { id: 'vendors', label: 'Vendors & Alignment', icon: Store, badge: null },
    { id: 'culture', label: 'Cultural & Inclusivity', icon: Heart, badge: null },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
      <Navbar
        events={events}
        selectedEvent={selectedEvent}
        onSelectEvent={handleSelectEvent}
        onOpenIntake={() => setIntakeOpen(true)}
        onOpenValidation={() => setValidationOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
        onExportPlan={handleExportPlan}
        validation={currentPlan?.validation || null}
        hasActiveIncidents={(currentPlan?.incidents.length || 0) > 0}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {loading && !currentPlan ? (
          <div className="h-96 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-emerald-400" />
            <p className="text-sm text-slate-400 font-medium">Synthesizing Planora Event Intelligence Engine...</p>
          </div>
        ) : !currentPlan ? (
          <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800">
            <AlertCircle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white">No Event Selected</h3>
            <p className="text-xs text-slate-400 mt-1 mb-4">Create your first event with our conversational intake engine.</p>
            <button
              onClick={() => setIntakeOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 font-bold text-xs rounded-xl text-white shadow"
            >
              Start Event Intake
            </button>
          </div>
        ) : (
          <>
            {/* Tab Navigation Navigation Bar */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-800/80 no-scrollbar">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                      isActive
                        ? 'bg-slate-800 text-emerald-400 border border-slate-700 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850/60'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                    <span>{tab.label}</span>
                    {tab.badge && (
                      <span
                        className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                          tab.badge === 'Deficit'
                            ? 'bg-rose-500/20 text-rose-300'
                            : tab.badge === 'Live'
                            ? 'bg-rose-500 text-white animate-pulse'
                            : 'bg-slate-700/60 text-slate-300'
                        }`}
                      >
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Active Tab View */}
            <div className="animate-fade-in">
              {activeTab === 'chat' && (
                <PlanoraChatTab
                  plan={currentPlan}
                  onRefreshPlan={() => loadAll(currentPlan.event.id)}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                />
              )}
              {activeTab === 'budget' && (
                <BudgetTab
                  plan={currentPlan}
                  onRefreshPlan={() => loadAll(currentPlan.event.id)}
                />
              )}
              {activeTab === 'timeline' && (
                <TimelineTab
                  plan={currentPlan}
                  onRefreshPlan={() => loadAll(currentPlan.event.id)}
                />
              )}
              {activeTab === 'stress' && (
                <StressTestTab
                  plan={currentPlan}
                  onRefreshPlan={() => loadAll(currentPlan.event.id)}
                />
              )}
              {activeTab === 'dayof' && (
                <DayOfIncidentTab
                  plan={currentPlan}
                  onRefreshPlan={() => loadAll(currentPlan.event.id)}
                />
              )}
              {activeTab === 'creative' && (
                <CreativeStudioTab
                  plan={currentPlan}
                  onRefreshPlan={() => loadAll(currentPlan.event.id)}
                />
              )}
              {activeTab === 'vendors' && (
                <VendorsStakeholdersTab
                  plan={currentPlan}
                  onRefreshPlan={() => loadAll(currentPlan.event.id)}
                />
              )}
              {activeTab === 'culture' && (
                <CulturalAccessibilityTab
                  plan={currentPlan}
                  onRefreshPlan={() => loadAll(currentPlan.event.id)}
                />
              )}
            </div>
          </>
        )}
      </main>

      {/* Modals */}
      <IntakeModal
        isOpen={intakeOpen}
        onClose={() => setIntakeOpen(false)}
        onCreateEvent={handleCreateEvent}
      />

      <ValidationGateModal
        isOpen={validationOpen}
        onClose={() => setValidationOpen(false)}
        validation={currentPlan?.validation || null}
      />

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        apiKeyConfigured={apiKeyConfigured}
        onKeySaved={() => loadAll()}
      />
    </div>
  );
}

export default App;
