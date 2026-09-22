"use client";

import { useState, useEffect } from "react";
import {
  KanbanSquare,
  Plus,
  DollarSign,
  Calendar,
  Trash2,
  Loader2,
  RefreshCw,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { api } from "@/lib/api";
import { Deal } from "@/types/crm";

const STAGES = [
  { id: "New", label: "New Lead", color: "border-t-blue-500 bg-blue-50/20" },
  { id: "Qualified", label: "Qualified", color: "border-t-purple-500 bg-purple-50/20" },
  { id: "Proposal", label: "Proposal Sent", color: "border-t-amber-500 bg-amber-50/20" },
  { id: "Negotiation", label: "Negotiation", color: "border-t-indigo-500 bg-indigo-50/20" },
  { id: "Won", label: "Closed Won", color: "border-t-emerald-500 bg-emerald-50/20" },
  { id: "Lost", label: "Closed Lost", color: "border-t-slate-400 bg-slate-50/20" },
];

export default function PipelinePage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Deal Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dealTitle, setDealTitle] = useState("");
  const [dealValue, setDealValue] = useState("");
  const [dealStage, setDealStage] = useState("New");
  const [expectedClose, setExpectedClose] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      const data = await api.getDeals();
      setDeals(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  const handleCreateDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.createDeal({
        title: dealTitle,
        value: parseFloat(dealValue) || 0,
        stage: dealStage,
        expected_close_date: expectedClose || undefined,
      });
      setIsModalOpen(false);
      setDealTitle("");
      setDealValue("");
      fetchDeals();
    } catch (err: any) {
      alert("Failed to create deal: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleStageChange = async (dealId: number, newStage: string) => {
    try {
      await api.updateDealStage(dealId, newStage);
      fetchDeals();
    } catch (err: any) {
      alert("Failed to update deal stage: " + err.message);
    }
  };

  const handleDeleteDeal = async (dealId: number) => {
    if (!confirm("Are you sure you want to delete this deal?")) return;
    try {
      await api.deleteDeal(dealId);
      fetchDeals();
    } catch (err: any) {
      alert("Failed to delete deal");
    }
  };

  const totalPipelineValue = deals
    .filter((d) => d.stage !== "Won" && d.stage !== "Lost")
    .reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Sales Pipeline
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Active: ₹{totalPipelineValue.toLocaleString("en-IN")}
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Visual Kanban board. Move opportunities across deal stages to forecast revenue.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchDeals}
            className="p-2 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 text-slate-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Deal
          </button>
        </div>
      </div>

      {/* Kanban Board Columns Container */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400 text-xs gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
          Loading pipeline deals...
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4 pt-1 items-start min-h-[70vh]">
          {STAGES.map((col) => {
            const stageDeals = deals.filter((d) => d.stage === col.id);
            const stageValue = stageDeals.reduce((acc, d) => acc + d.value, 0);

            return (
              <div
                key={col.id}
                className="w-72 shrink-0 bg-slate-100/70 border border-slate-200/80 rounded-2xl flex flex-col max-h-[75vh]"
              >
                {/* Column Header */}
                <div
                  className={`p-3.5 border-b border-slate-200/80 border-t-4 rounded-t-2xl bg-white ${col.color}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-800">
                      {col.label}
                    </span>
                    <span className="text-[11px] font-bold px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600">
                      {stageDeals.length}
                    </span>
                  </div>
                  <div className="text-[11px] font-semibold text-slate-500 mt-1">
                    ₹{stageValue.toLocaleString("en-IN")}
                  </div>
                </div>

                {/* Deal Cards Container */}
                <div className="p-2.5 flex-1 overflow-y-auto space-y-2.5">
                  {stageDeals.length === 0 ? (
                    <div className="text-center py-8 text-[11px] text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                      No deals in stage
                    </div>
                  ) : (
                    stageDeals.map((deal) => (
                      <div
                        key={deal.id}
                        className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs hover:border-purple-300 hover:shadow-md transition-all space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-bold text-slate-900 leading-tight">
                            {deal.title}
                          </h4>
                          <button
                            onClick={() => handleDeleteDeal(deal.id)}
                            className="text-slate-300 hover:text-red-500 transition-colors p-0.5 shrink-0"
                            title="Delete Deal"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Value Badge */}
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                            ₹{deal.value.toLocaleString("en-IN")}
                          </span>
                          {deal.expected_close_date && (
                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {deal.expected_close_date}
                            </span>
                          )}
                        </div>

                        {/* Move Stage Selector */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">Move to:</span>
                          <select
                            value={deal.stage}
                            onChange={(e) =>
                              handleStageChange(deal.id, e.target.value)
                            }
                            className="text-[11px] font-semibold bg-slate-50 border border-slate-200 rounded-md px-1.5 py-0.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
                          >
                            {STAGES.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Deal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-100 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-800">
              Create New Deal Opportunity
            </h3>

            <form onSubmit={handleCreateDeal} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Deal Opportunity Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Enterprise Cloud License"
                  value={dealTitle}
                  onChange={(e) => setDealTitle(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Value (₹ INR) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="250000"
                    value={dealValue}
                    onChange={(e) => setDealValue(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Initial Stage
                  </label>
                  <select
                    value={dealStage}
                    onChange={(e) => setDealStage(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {STAGES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Expected Close Date
                </label>
                <input
                  type="date"
                  value={expectedClose}
                  onChange={(e) => setExpectedClose(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Deal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
