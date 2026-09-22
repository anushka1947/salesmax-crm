"use client";

import { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Users,
  DollarSign,
  Award,
  Loader2,
  RefreshCw,
  ArrowUpRight,
} from "lucide-react";
import { api } from "@/lib/api";
import { DashboardStats, Lead, Deal } from "@/types/crm";

export default function ReportsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReportData = async () => {
    try {
      setLoading(true);
      const [statsData, leadsData, dealsData] = await Promise.all([
        api.getDashboardStats(),
        api.getLeads(),
        api.getDeals(),
      ]);
      setStats(statsData);
      setLeads(leadsData);
      setDeals(dealsData);
    } catch (err) {
      console.error("Failed to load reports", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReportData();
  }, []);

  // Compute lead sources breakdown
  const sourceCounts: Record<string, number> = {};
  leads.forEach((l) => {
    const src = l.source || "other";
    sourceCounts[src] = (sourceCounts[src] || 0) + 1;
  });

  // Compute lead status breakdown
  const statusCounts: Record<string, number> = {};
  leads.forEach((l) => {
    const st = l.status || "new";
    statusCounts[st] = (statusCounts[st] || 0) + 1;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Reports & Sales Intelligence
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real performance analytics generated from active leads, deals, and pipeline transactions.
          </p>
        </div>
        <button
          onClick={loadReportData}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-2xs transition-colors self-start"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Metrics
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24 text-slate-400 text-xs gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
          Compiling sales intelligence...
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">
                  Total Commercial Pipeline
                </span>
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="mt-2 text-2xl font-bold text-slate-900">
                ₹{(stats?.pipeline_value ?? 0).toLocaleString("en-IN")}
              </div>
              <p className="text-[11px] text-emerald-600 mt-1 font-medium">
                Active opportunities being negotiated
              </p>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">
                  Won Deal Revenue
                </span>
                <Award className="w-4 h-4 text-purple-600" />
              </div>
              <div className="mt-2 text-2xl font-bold text-slate-900">
                ₹{(stats?.won_value ?? 0).toLocaleString("en-IN")}
              </div>
              <p className="text-[11px] text-purple-600 mt-1 font-medium">
                {stats?.won_deals ?? 0} successfully closed contracts
              </p>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">
                  Pipeline Win Rate
                </span>
                <TrendingUp className="w-4 h-4 text-blue-600" />
              </div>
              <div className="mt-2 text-2xl font-bold text-slate-900">
                {stats?.conversion_rate ?? 0}%
              </div>
              <p className="text-[11px] text-blue-600 mt-1 font-medium">
                Conversion from proposal to closed won
              </p>
            </div>
          </div>

          {/* Grids: Lead Sources & Deal Stages */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Acquisition Channel Breakdown */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="pb-2 border-b border-slate-100">
                <h3 className="font-bold text-sm text-slate-900">
                  Lead Volume by Acquisition Channel
                </h3>
                <p className="text-xs text-slate-500">
                  Where your highest volume of prospect inquiries originate
                </p>
              </div>

              <div className="space-y-3 pt-2">
                {Object.keys(sourceCounts).length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">
                    No lead sources logged yet.
                  </p>
                ) : (
                  Object.entries(sourceCounts).map(([source, count]) => {
                    const pct = Math.round((count / leads.length) * 100);
                    return (
                      <div key={source} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-700 capitalize">
                            {source.replace("_", " ")}
                          </span>
                          <span className="text-slate-500">
                            {count} leads ({pct}%)
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-600 rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Stage Value Allocation */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="pb-2 border-b border-slate-100">
                <h3 className="font-bold text-sm text-slate-900">
                  Pipeline Stage Valuation Breakdown
                </h3>
                <p className="text-xs text-slate-500">
                  Monetary value weighted per pipeline column
                </p>
              </div>

              <div className="space-y-3 pt-2">
                {stats?.deals_by_stage?.map((st) => (
                  <div
                    key={st.stage}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-800 block">
                        {st.stage}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {st.count} {st.count === 1 ? "opportunity" : "opportunities"}
                      </span>
                    </div>
                    <span className="font-extrabold text-purple-700 text-sm">
                      ₹{st.total_value.toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Lead Qualification Funnel */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="pb-2 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">
                Full Sales Conversion Funnel
              </h3>
              <p className="text-xs text-slate-500">
                Step-by-step prospect progression from capture to closed revenue
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2 text-center">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
                <span className="text-xs text-slate-500 font-medium">1. Leads Captured</span>
                <div className="text-xl font-bold text-slate-800 mt-1">{leads.length}</div>
              </div>
              <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-200/70">
                <span className="text-xs text-purple-700 font-medium">2. Qualified</span>
                <div className="text-xl font-bold text-purple-900 mt-1">
                  {leads.filter((l) => l.status === "qualified" || l.status === "converted").length}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-200/70">
                <span className="text-xs text-indigo-700 font-medium">3. Deals Opened</span>
                <div className="text-xl font-bold text-indigo-900 mt-1">{deals.length}</div>
              </div>
              <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/70">
                <span className="text-xs text-emerald-700 font-medium">4. Deals Won</span>
                <div className="text-xl font-bold text-emerald-900 mt-1">
                  {deals.filter((d) => d.stage === "Won").length}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
