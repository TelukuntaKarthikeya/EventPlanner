import React, { useState } from 'react';
import {
  Wallet, AlertTriangle, ShieldCheck, TrendingDown, TrendingUp,
  Sliders, Plus, Trash2, CheckCircle2, HelpCircle, Lock, ArrowRight, Sparkles
} from 'lucide-react';
import { FullEventPlan, BudgetItem, TradeoffResponse, TradeoffScenario } from '../types';
import { simulateTradeoff, applyTradeoffScenario, addOrUpdateBudgetItem, deleteBudgetItem } from '../api';

interface BudgetTabProps {
  plan: FullEventPlan;
  onRefreshPlan: () => void;
}

export const BudgetTab: React.FC<BudgetTabProps> = ({ plan, onRefreshPlan }) => {
  const { event, budget_items, reconciliation } = plan;
  const currency = event.currency;

  // Filter state
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');

  // Trade-off simulator state
  const [tradeoffModalOpen, setTradeoffModalOpen] = useState(false);
  const [tradeoffCategory, setTradeoffCategory] = useState<string>('Venue');
  const [tradeoffAmount, setTradeoffAmount] = useState<number>(0);
  const [simulating, setSimulating] = useState(false);
  const [tradeoffResult, setTradeoffResult] = useState<TradeoffResponse | null>(null);
  const [applyingScenario, setApplyingScenario] = useState<string | null>(null);

  // Add Item Modal
  const [addItemModalOpen, setAddItemModalOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Decoration and lighting');
  const [newItemAmount, setNewItemAmount] = useState(500);
  const [newItemStatus, setNewItemStatus] = useState<'confirmed' | 'quoted' | 'estimated' | 'unknown'>('estimated');
  const [newItemIsFixed, setNewItemIsFixed] = useState(false);
  const [newItemIsOptional, setNewItemIsOptional] = useState(false);
  const [newItemBasis, setNewItemBasis] = useState('Planning estimate');

  const categories = Array.from(new Set(budget_items.map((i) => i.category)));

  const handleOpenTradeoff = (categoryName?: string) => {
    const cat = categoryName || categories[0] || 'Venue';
    setTradeoffCategory(cat);
    const curAmt = reconciliation.category_breakdown[cat] || 1000;
    // Default to +15% increase simulation
    setTradeoffAmount(Math.round(curAmt * 1.15));
    setTradeoffResult(null);
    setTradeoffModalOpen(true);
  };

  const handleRunTradeoff = async () => {
    setSimulating(true);
    try {
      const res = await simulateTradeoff(event.id, tradeoffCategory, Number(tradeoffAmount));
      setTradeoffResult(res);
    } catch (err: any) {
      alert(`Simulation failed: ${err.message}`);
    } finally {
      setSimulating(false);
    }
  };

  const handleApplyTradeoff = async (scenario: TradeoffScenario) => {
    setApplyingScenario(scenario.id);
    try {
      await applyTradeoffScenario(event.id, scenario, tradeoffCategory, Number(tradeoffAmount));
      onRefreshPlan();
      setTradeoffModalOpen(false);
    } catch (err: any) {
      alert(`Failed to apply tradeoff: ${err.message}`);
    } finally {
      setApplyingScenario(null);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addOrUpdateBudgetItem(event.id, {
        category: newItemCategory,
        item_name: newItemName,
        amount: Number(newItemAmount),
        confirmation_status: newItemStatus,
        basis: newItemBasis,
        is_fixed: newItemIsFixed,
        is_adjustable: !newItemIsFixed,
        is_optional: newItemIsOptional,
        paid_amount: 0,
        payment_status: 'unpaid',
      });
      onRefreshPlan();
      setAddItemModalOpen(false);
      setNewItemName('');
    } catch (err: any) {
      alert(`Failed to add item: ${err.message}`);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to remove this expense line?')) return;
    try {
      await deleteBudgetItem(event.id, itemId);
      onRefreshPlan();
    } catch (err: any) {
      alert(`Failed to delete item: ${err.message}`);
    }
  };

  const filteredItems = selectedCategoryFilter === 'ALL'
    ? budget_items
    : budget_items.filter((i) => i.category === selectedCategoryFilter);

  return (
    <div className="space-y-6">
      {/* Top Financial Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Budget Card */}
        <div className="p-4 rounded-2xl bg-slate-850 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Authorized Budget Ceiling</span>
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">
            {currency} {reconciliation.total_budget.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-medium">
            <span>Hard constraint per Rule #1</span>
          </div>
        </div>

        {/* Projected Spend Card */}
        <div className="p-4 rounded-2xl bg-slate-850 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Total Projected Spend</span>
            <Wallet className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">
            {currency} {reconciliation.total_projected_cost.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {Math.round((reconciliation.total_projected_cost / reconciliation.total_budget) * 100)}% of ceiling allocated
          </div>
        </div>

        {/* Remaining / Deficit Card */}
        <div
          className={`p-4 rounded-2xl border shadow-md ${
            reconciliation.is_over_budget
              ? 'bg-rose-950/40 border-rose-800/80'
              : 'bg-slate-850 border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>{reconciliation.is_over_budget ? 'Budget Deficit' : 'Unallocated Buffer'}</span>
            {reconciliation.is_over_budget ? (
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400 animate-bounce" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            )}
          </div>
          <div
            className={`text-2xl font-bold ${
              reconciliation.is_over_budget ? 'text-rose-400' : 'text-emerald-400'
            }`}
          >
            {currency} {Math.abs(reconciliation.remaining_budget).toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {reconciliation.is_over_budget
              ? 'Exceeds budget ceiling — requires trade-off'
              : 'Free uncommitted margin'}
          </div>
        </div>

        {/* Contingency Pool Card */}
        <div className="p-4 rounded-2xl bg-slate-850 border border-amber-500/30 shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 rounded-bl-full pointer-events-none" />
          <div className="flex items-center justify-between text-xs text-amber-300 font-semibold mb-1">
            <span>Contingency Reserve</span>
            <ShieldCheck className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">
            {currency} {reconciliation.available_contingency.toLocaleString()}
          </div>
          <div className="text-[10px] text-amber-200/80 mt-1 leading-tight">
            Allocated: {currency} {reconciliation.contingency_allocated.toLocaleString()} • Committed: {currency} {reconciliation.contingency_committed.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Contingency Guardrail Notice */}
      <div className="p-3 bg-amber-950/30 border border-amber-500/30 rounded-xl flex items-start gap-2.5 text-xs text-amber-200/90">
        <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-amber-300">Section 5 Rule: Contingency Integrity Protected.</span>{' '}
          Contingency is isolated strictly for day-of emergencies (monsoon tenting, vendor cancellation, power failure). Planora never treats contingency as discretionary cash for luxury upgrades.
        </div>
      </div>

      {/* Controls & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full text-xs">
          <button
            onClick={() => setSelectedCategoryFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              selectedCategoryFilter === 'ALL'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            All Items ({budget_items.length})
          </button>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCategoryFilter(c)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
                selectedCategoryFilter === c
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Buttons: Tradeoff Simulator & Add Item */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenTradeoff()}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md shadow-indigo-600/20 transition cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Interactive Trade-offs</span>
          </button>
          <button
            onClick={() => setAddItemModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md shadow-emerald-600/20 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Budget Items Table */}
      <div className="bg-slate-850 rounded-2xl border border-slate-800 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-750">
              <tr>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Expense Item</th>
                <th className="px-4 py-3">Amount ({currency})</th>
                <th className="px-4 py-3">Confirmation Status</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-200">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/50 transition">
                  <td className="px-4 py-3 font-medium text-slate-300">
                    <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[11px] border border-slate-700/60">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-100">{item.item_name}</div>
                    {item.basis && <div className="text-[10px] text-slate-400">{item.basis}</div>}
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-slate-100">
                    {currency} {item.amount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        item.confirmation_status === 'confirmed'
                          ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                          : item.confirmation_status === 'quoted'
                          ? 'bg-sky-950/60 text-sky-300 border-sky-500/40'
                          : item.confirmation_status === 'unknown'
                          ? 'bg-rose-950/60 text-rose-300 border-rose-500/40'
                          : 'bg-amber-950/60 text-amber-300 border-amber-500/40'
                      }`}
                    >
                      {item.confirmation_status === 'confirmed' && '✓ Confirmed'}
                      {item.confirmation_status === 'quoted' && '📑 Quoted'}
                      {item.confirmation_status === 'estimated' && '≈ Estimate'}
                      {item.confirmation_status === 'unknown' && '? Unknown'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {item.is_fixed ? (
                      <span className="text-slate-400 font-medium text-[11px] flex items-center gap-1">
                        <Lock className="w-3 h-3 text-slate-400" /> Fixed
                      </span>
                    ) : item.is_optional ? (
                      <span className="text-indigo-400 font-medium text-[11px]">Optional</span>
                    ) : (
                      <span className="text-slate-400 font-medium text-[11px]">Adjustable</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[11px] font-medium ${
                        item.payment_status === 'fully_paid'
                          ? 'text-emerald-400'
                          : item.payment_status === 'deposit_paid'
                          ? 'text-sky-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {item.payment_status === 'fully_paid' && 'Fully Paid'}
                      {item.payment_status === 'deposit_paid' && `Deposit (${currency} ${item.paid_amount.toLocaleString()})`}
                      {item.payment_status === 'unpaid' && 'Unpaid'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleOpenTradeoff(item.category)}
                        className="p-1 text-slate-400 hover:text-indigo-300 hover:bg-slate-800 rounded transition"
                        title="Simulate trade-off on this category"
                      >
                        <Sliders className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition"
                        title="Delete expense item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trade-offs Simulator Modal */}
      {tradeoffModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Interactive Budget Trade-offs Engine</h3>
                  <p className="text-xs text-slate-400">
                    Section 5: Deterministically evaluates reallocations while preserving protected priorities.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setTradeoffModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                ✕
              </button>
            </div>

            {/* Input adjustment controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-850 border border-slate-800 mb-6">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Target Expense Category
                </label>
                <select
                  value={tradeoffCategory}
                  onChange={(e) => {
                    setTradeoffCategory(e.target.value);
                    const cur = reconciliation.category_breakdown[e.target.value] || 1000;
                    setTradeoffAmount(Math.round(cur * 1.15));
                    setTradeoffResult(null);
                  }}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c} (Current: {currency} {(reconciliation.category_breakdown[c] || 0).toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  New Adjusted Amount ({currency})
                </label>
                <input
                  type="number"
                  value={tradeoffAmount}
                  onChange={(e) => setTradeoffAmount(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                  <span>Current: {currency} {(reconciliation.category_breakdown[tradeoffCategory] || 0).toLocaleString()}</span>
                  <span className={tradeoffAmount >= (reconciliation.category_breakdown[tradeoffCategory] || 0) ? 'text-rose-400' : 'text-emerald-400'}>
                    Delta: {tradeoffAmount - (reconciliation.category_breakdown[tradeoffCategory] || 0) >= 0 ? '+' : ''}
                    {currency} {(tradeoffAmount - (reconciliation.category_breakdown[tradeoffCategory] || 0)).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="sm:col-span-2 flex justify-end">
                <button
                  onClick={handleRunTradeoff}
                  disabled={simulating}
                  className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow transition cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  {simulating ? 'Computing Feasible Reallocations...' : 'Compute Deterministic Trade-offs'}
                </button>
              </div>
            </div>

            {/* Results / Scenarios */}
            {tradeoffResult && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-200">
                    Trade-off Solutions ({tradeoffResult.scenarios.length} Scenarios Generated)
                  </h4>
                  <span className="text-xs text-slate-400">
                    Protected Priorities: <b className="text-slate-200">{event.protected_priorities.join(', ')}</b>
                  </span>
                </div>

                {!tradeoffResult.feasible && (
                  <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs">
                    <p className="font-bold mb-1">Infeasible Without User Approval</p>
                    <p>{tradeoffResult.message}</p>
                  </div>
                )}

                {tradeoffResult.scenarios.map((sc) => (
                  <div
                    key={sc.id}
                    className="p-4 rounded-xl bg-slate-850 border border-slate-750 hover:border-indigo-500/50 transition"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h5 className="font-bold text-slate-100 text-sm flex items-center gap-1.5">
                          <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                          {sc.title}
                        </h5>
                        <p className="text-xs text-slate-400 mt-0.5">{sc.description}</p>
                      </div>
                      <button
                        onClick={() => handleApplyTradeoff(sc)}
                        disabled={applyingScenario === sc.id}
                        className="shrink-0 px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow transition cursor-pointer"
                      >
                        {applyingScenario === sc.id ? 'Applying...' : 'Apply Scenario'}
                      </button>
                    </div>

                    {/* Changes list */}
                    {sc.changes.length > 0 && (
                      <div className="mt-3 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1.5 text-[11px]">
                        <span className="font-semibold text-slate-400 uppercase text-[10px] tracking-wider block">
                          Reallocated Line Items:
                        </span>
                        {sc.changes.map((ch, idx) => (
                          <div key={idx} className="flex items-center justify-between text-slate-300">
                            <span>{ch.item_name} ({ch.category})</span>
                            <span className="font-mono text-rose-400">
                              -{currency} {ch.reduction.toLocaleString()} → New: {currency} {ch.new_amount.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-800">
                      <div>
                        <span className="text-slate-500 font-medium">Downstream Impact:</span>{' '}
                        <span className="text-slate-300">{sc.impact_summary}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium">Risk Assessment:</span>{' '}
                        <span className="text-amber-400">{sc.risk_assessment}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {addItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6 relative">
            <h3 className="text-lg font-bold text-white mb-4">Add Budget Expense Line</h3>
            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Expense Item Name *</label>
                <input
                  type="text"
                  required
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="e.g. Drone Videography Rider"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
                  >
                    <option value="Venue">Venue</option>
                    <option value="Food and beverages">Food and beverages</option>
                    <option value="Decoration and lighting">Decoration and lighting</option>
                    <option value="Photography and videography">Photography and videography</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Transport and accommodation">Transport and accommodation</option>
                    <option value="Accessibility and guest facilities">Accessibility & facilities</option>
                    <option value="Invitations and guest communication">Invitations & comms</option>
                    <option value="Taxes, service fees, and other applicable charges">Fees & Taxes</option>
                    <option value="Contingency reserve">Contingency reserve</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Amount ({currency})</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newItemAmount}
                    onChange={(e) => setNewItemAmount(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Confirmation Status</label>
                  <select
                    value={newItemStatus}
                    onChange={(e: any) => setNewItemStatus(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
                  >
                    <option value="confirmed">Confirmed</option>
                    <option value="quoted">Quoted</option>
                    <option value="estimated">Estimated</option>
                    <option value="unknown">Unknown</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Basis of Estimate</label>
                  <input
                    type="text"
                    value={newItemBasis}
                    onChange={(e) => setNewItemBasis(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newItemIsFixed}
                    onChange={(e) => setNewItemIsFixed(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-emerald-600 focus:ring-0"
                  />
                  <span>Fixed Commitment</span>
                </label>
                <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newItemIsOptional}
                    onChange={(e) => setNewItemIsOptional(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-emerald-600 focus:ring-0"
                  />
                  <span>Optional Item</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setAddItemModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow"
                >
                  Add Line Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
