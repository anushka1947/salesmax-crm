"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  DollarSign,
  TrendingUp,
  CheckSquare,
  Clock,
  ArrowUpRight,
  Sparkles,
  Phone,
  MessageSquare,
  FileText,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { api, API_BASE_URL } from "@/lib/api";
import { DashboardStats, Task } from "@/types/crm";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsData, tasksData] = await Promise.all([
        api.getDashboardStats(),
        api.getTasks("Pending"),
      ]);
      setStats(statsData);
      setTasks(tasksData.slice(0, 5));
    } catch (err: any) {
      console.error(err);
      setError(`Unable to connect to FastAPI backend at ${API_BASE_URL}. Is the server running?`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleTask = async (taskId: number) => {
    try {
      await api.toggleTask(taskId);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "call":
        return <Phone className="w-3.5 h-3.5 text-blue-600" />;
      case "whatsapp":
        return <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />;
      case "stage_change":
        return <TrendingUp className="w-3.5 h-3.5 text-purple-600" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-slate-600" />;
    }
  };

  if (loading && !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        <p className="text-sm font-medium">Connecting to SalesMax CRM engine...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center max-w-lg mx-auto my-12 space-y-3">
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
          <RefreshCw className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-slate-800 text-base">Backend Connection Notice</h3>
        <p className="text-xs text-red-600 leading-relaxed">{error}</p>
        <button
          onClick={loadData}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg text-xs font-semibold hover:bg-purple-700 shadow-xs"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Sales Overview
            <span className="text-xs font-normal px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
              Live PostgreSQL
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time pipeline metrics, conversion performance, and customer touchpoints.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-2xs transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
          <Link
            href="/pipeline"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            Open Pipeline
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Leads */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Leads</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">
              {stats?.total_leads ?? 0}
            </span>
            <span className="text-[11px] text-slate-400 font-medium">in funnel</span>
          </div>
          <div className="mt-2 text-[11px] text-purple-600 font-medium flex items-center gap-1">
            <Link href="/leads" className="hover:underline flex items-center gap-0.5">
              View leads registry &rarr;
            </Link>
          </div>
        </div>

        {/* Pipeline Value */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Active Pipeline</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">
              ₹{(stats?.pipeline_value ?? 0).toLocaleString("en-IN")}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-600 font-medium">
            Across {stats?.active_deals ?? 0} open deals
          </div>
        </div>

        {/* Deals Won */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Closed Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">
              ₹{(stats?.won_value ?? 0).toLocaleString("en-IN")}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-blue-600 font-medium">
            {stats?.won_deals ?? 0} deals won ({stats?.conversion_rate ?? 0}% win rate)
          </div>
        </div>

        {/* Urgent Follow-ups */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Tasks Due</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">
              {stats?.tasks_due_today ?? 0}
            </span>
            <span className="text-[11px] text-slate-400 font-medium">actions pending</span>
          </div>
          <div className="mt-2 text-[11px] text-amber-600 font-medium">
            <Link href="/tasks" className="hover:underline flex items-center gap-0.5">
              Open tasks agenda &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Main Grid: Pipeline Breakdown & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline Stage Funnel Breakdown */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Pipeline Stages Breakdown
              </h3>
              <p className="text-xs text-slate-500">
                Distribution of deal values across the active sales lifecycle
              </p>
            </div>
            <Link
              href="/pipeline"
              className="text-xs font-semibold text-purple-600 hover:text-purple-700"
            >
              Kanban Board &rarr;
            </Link>
          </div>

          <div className="space-y-3.5 pt-2">
            {stats?.deals_by_stage?.map((st) => {
              const maxVal = Math.max(
                ...(stats?.deals_by_stage?.map((s) => s.total_value) || [1]),
                1
              );
              const pct = Math.min(Math.round((st.total_value / maxVal) * 100), 100);

              return (
                <div key={st.stage} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                      {st.stage}
                    </span>
                    <span className="text-slate-500">
                      {st.count} {st.count === 1 ? "deal" : "deals"} ·{" "}
                      <span className="font-bold text-slate-800">
                        ₹{st.total_value.toLocaleString("en-IN")}
                      </span>
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(pct, st.count > 0 ? 5 : 0)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Agenda: Today's Tasks */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
              <h3 className="font-bold text-sm text-slate-900">
                Action Items Agenda
              </h3>
              <Link
                href="/tasks"
                className="text-xs font-semibold text-purple-600 hover:text-purple-700"
              >
                View all
              </Link>
            </div>

            {tasks.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">
                All scheduled follow-ups are completed! 🎉
              </p>
            ) : (
              <div className="divide-y divide-slate-100">
                {tasks.map((t) => (
                  <div
                    key={t.id}
                    className="py-2.5 flex items-start gap-2.5 group"
                  >
                    <button
                      onClick={() => handleToggleTask(t.id)}
                      className="mt-0.5 w-4 h-4 rounded border border-slate-300 hover:border-purple-600 flex items-center justify-center text-transparent hover:text-purple-600 transition-colors shrink-0"
                    >
                      ✓
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">
                        {t.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                        <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-medium">
                          {t.type}
                        </span>
                        {t.due_date && <span>Due: {t.due_date}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4">
            <Link
              href="/tasks"
              className="w-full block text-center py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors"
            >
              + Create Follow-up
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activity Stream */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div>
            <h3 className="font-bold text-sm text-slate-900">
              Live Activity Stream
            </h3>
            <p className="text-xs text-slate-500">
              Automated audit trail of calls, deals, WhatsApp, and status updates
            </p>
          </div>
          <span className="text-[11px] text-purple-700 bg-purple-50 font-semibold px-2 py-0.5 rounded-full border border-purple-200/60">
            Real-time Feed
          </span>
        </div>

        {!stats?.recent_activities || stats.recent_activities.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">
            No activities recorded yet. As you interact with leads, events will appear here.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {stats.recent_activities.slice(0, 6).map((act) => (
              <div
                key={act.id}
                className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/70 border border-slate-100"
              >
                <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
                  {getActivityIcon(act.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h5 className="text-xs font-semibold text-slate-800 truncate">
                      {act.title}
                    </h5>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {new Date(act.created_at).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  {act.description && (
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {act.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
