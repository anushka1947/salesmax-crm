"use client";

import { useState, useEffect } from "react";
import {
  Phone,
  MessageSquare,
  FileText,
  TrendingUp,
  CheckCircle2,
  Clock,
  Plus,
  Send,
  Loader2,
} from "lucide-react";
import { api } from "@/lib/api";
import { Activity } from "@/types/crm";

interface ActivityTimelineProps {
  leadId?: number;
  contactId?: number;
  onActivityLogged?: () => void;
}

export default function ActivityTimeline({
  leadId,
  contactId,
  onActivityLogged,
}: ActivityTimelineProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeForm, setActiveForm] = useState<"none" | "call" | "whatsapp" | "note">("none");

  // Form states
  const [formText, setFormText] = useState("");
  const [callDuration, setCallDuration] = useState("2m 30s");
  const [callOutcome, setCallOutcome] = useState("Connected - Positive");
  const [submitting, setSubmitting] = useState(false);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const data = await api.getActivities({
        lead_id: leadId,
        contact_id: contactId,
        limit: 25,
      });
      setActivities(data);
    } catch (err) {
      console.error("Failed to load activities", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [leadId, contactId]);

  const handleLogActivity = async (type: string, title: string, desc: string) => {
    setSubmitting(true);
    try {
      await api.createActivity({
        type,
        title,
        description: desc,
        lead_id: leadId,
        contact_id: contactId,
      });
      setFormText("");
      setActiveForm("none");
      fetchActivities();
      if (onActivityLogged) onActivityLogged();
    } catch (err) {
      console.error("Failed to log activity", err);
    } finally {
      setSubmitting(false);
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
      case "task_completed":
      case "task_created":
        return <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Quick Action Buttons */}
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={() => setActiveForm(activeForm === "call" ? "none" : "call")}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
            activeForm === "call"
              ? "bg-blue-50 border-blue-200 text-blue-700 ring-2 ring-blue-500/20"
              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
          }`}
        >
          <Phone className="w-3.5 h-3.5 text-blue-600" />
          Log Call
        </button>

        <button
          onClick={() =>
            setActiveForm(activeForm === "whatsapp" ? "none" : "whatsapp")
          }
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
            activeForm === "whatsapp"
              ? "bg-emerald-50 border-emerald-200 text-emerald-700 ring-2 ring-emerald-500/20"
              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
          Log WhatsApp
        </button>

        <button
          onClick={() => setActiveForm(activeForm === "note" ? "none" : "note")}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
            activeForm === "note"
              ? "bg-purple-50 border-purple-200 text-purple-700 ring-2 ring-purple-500/20"
              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-purple-600" />
          Add Note
        </button>
      </div>

      {/* Mini Form Drawer */}
      {activeForm !== "none" && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-3 animate-in fade-in duration-150">
          {activeForm === "call" && (
            <>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={callDuration}
                    onChange={(e) => setCallDuration(e.target.value)}
                    className="w-full px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                    Outcome
                  </label>
                  <select
                    value={callOutcome}
                    onChange={(e) => setCallOutcome(e.target.value)}
                    className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
                  >
                    <option value="Connected - Positive">Connected - Positive</option>
                    <option value="Connected - Follow up requested">Follow up requested</option>
                    <option value="No Answer / Busy">No Answer / Busy</option>
                    <option value="Wrong Number">Wrong Number</option>
                  </select>
                </div>
              </div>
              <textarea
                placeholder="Call notes / summary..."
                value={formText}
                onChange={(e) => setFormText(e.target.value)}
                rows={2}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setActiveForm("none")}
                  className="px-3 py-1 text-xs text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
                <button
                  disabled={submitting}
                  onClick={() =>
                    handleLogActivity(
                      "call",
                      `Call Logged (${callOutcome})`,
                      `Duration: ${callDuration}. ${formText}`
                    )
                  }
                  className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-3 h-3 animate-spin" />}
                  Save Call Log
                </button>
              </div>
            </>
          )}

          {activeForm === "whatsapp" && (
            <>
              <div className="text-xs">
                <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                  Template or Message Note
                </label>
                <textarea
                  placeholder="e.g. Sent brochure and pricing breakdown over WhatsApp..."
                  value={formText}
                  onChange={(e) => setFormText(e.target.value)}
                  rows={2}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setActiveForm("none")}
                  className="px-3 py-1 text-xs text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
                <button
                  disabled={submitting || !formText}
                  onClick={() =>
                    handleLogActivity(
                      "whatsapp",
                      "WhatsApp Message Sent",
                      formText
                    )
                  }
                  className="flex items-center gap-1 px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-3 h-3 animate-spin" />}
                  Log WhatsApp
                </button>
              </div>
            </>
          )}

          {activeForm === "note" && (
            <>
              <div className="text-xs">
                <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                  Internal Note
                </label>
                <textarea
                  placeholder="Add internal notes on prospect requirements, budget, timeline..."
                  value={formText}
                  onChange={(e) => setFormText(e.target.value)}
                  rows={2}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setActiveForm("none")}
                  className="px-3 py-1 text-xs text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
                <button
                  disabled={submitting || !formText}
                  onClick={() =>
                    handleLogActivity(
                      "note",
                      "Internal Note Added",
                      formText
                    )
                  }
                  className="flex items-center gap-1 px-3 py-1 bg-purple-600 text-white rounded-lg text-xs font-semibold hover:bg-purple-700 disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-3 h-3 animate-spin" />}
                  Save Note
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Timeline Stream */}
      <div className="space-y-3 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
        {loading ? (
          <div className="flex items-center justify-center py-6 text-slate-400 text-xs gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading timeline...
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs">
            No activities recorded yet. Log a call or note above!
          </div>
        ) : (
          activities.map((act) => (
            <div key={act.id} className="relative flex items-start gap-3 pl-1">
              <div className="w-7 h-7 rounded-full bg-white border border-slate-200 shadow-xs flex items-center justify-center shrink-0 z-10">
                {getActivityIcon(act.type)}
              </div>
              <div className="flex-1 bg-white border border-slate-100 rounded-xl p-2.5 shadow-xs">
                <div className="flex items-center justify-between gap-2">
                  <h5 className="text-xs font-semibold text-slate-800">
                    {act.title}
                  </h5>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1 shrink-0">
                    <Clock className="w-3 h-3" />
                    {new Date(act.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                {act.description && (
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {act.description}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
