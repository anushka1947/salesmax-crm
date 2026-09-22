"use client";

import { useState } from "react";
import {
  X,
  Phone,
  MessageSquare,
  Sparkles,
  UserCheck,
  Building2,
  Mail,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { Lead } from "@/types/crm";
import { api } from "@/lib/api";
import ActivityTimeline from "./ActivityTimeline";

interface LeadDrawerProps {
  lead: Lead | null;
  onClose: () => void;
  onLeadUpdated: () => void;
}

export default function LeadDrawer({
  lead,
  onClose,
  onLeadUpdated,
}: LeadDrawerProps) {
  const [converting, setConverting] = useState(false);
  const [convertedSuccess, setConvertedSuccess] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [generatingAi, setGeneratingAi] = useState(false);

  if (!lead) return null;

  const handleConvertToContact = async () => {
    setConverting(true);
    try {
      // Split name into first_name and last_name
      const nameParts = lead.name.trim().split(" ");
      const firstName = nameParts[0] || lead.name;
      const lastName = nameParts.slice(1).join(" ") || undefined;

      await api.createContact({
        first_name: firstName,
        last_name: lastName,
        email: lead.email,
        phone: lead.phone,
        company_name: lead.company,
        lead_id: lead.id,
      });

      // Update lead status to converted
      await api.updateLead(lead.id, { status: "converted" });

      // Log activity
      await api.createActivity({
        type: "status_change",
        title: "Lead Converted to Contact",
        description: `${lead.name} was successfully promoted to a CRM Contact account.`,
        lead_id: lead.id,
      });

      setConvertedSuccess(true);
      onLeadUpdated();
    } catch (err: any) {
      alert("Failed to convert lead: " + err.message);
    } finally {
      setConverting(false);
    }
  };

  const handleGenerateAiSummary = () => {
    setGeneratingAi(true);
    setTimeout(() => {
      setAiSummary(
        `• High intent prospect interested in B2B CRM capabilities.\n` +
        `• Primary communication channel: WhatsApp & direct phone calls.\n` +
        `• Recommended Next Action: Schedule product walkthrough demo and send proposal draft within 24h.`
      );
      setGeneratingAi(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
      />
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-white shadow-2xl flex flex-col border-l border-slate-200">
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                  {lead.status}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {lead.source}
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900">{lead.name}</h2>
              {lead.company && (
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <Building2 className="w-3.5 h-3.5" />
                  {lead.company}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Actions Row */}
          <div className="px-6 py-3 border-b border-slate-100 flex items-center gap-2 bg-white flex-wrap">
            {lead.phone && (
              <a
                href={`tel:${lead.phone}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                Call ({lead.phone})
              </a>
            )}

            {lead.phone && (
              <a
                href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                WhatsApp
              </a>
            )}

            <button
              onClick={handleConvertToContact}
              disabled={converting || convertedSuccess || lead.status === "converted"}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-semibold transition-colors disabled:opacity-50 ml-auto"
            >
              {converting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : convertedSuccess || lead.status === "converted" ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <UserCheck className="w-3.5 h-3.5" />
              )}
              <span>
                {convertedSuccess || lead.status === "converted"
                  ? "Converted to Contact"
                  : "Convert to Contact"}
              </span>
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Contact details card */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[11px] text-slate-400 block mb-0.5">
                  Email Address
                </span>
                <span className="font-medium text-slate-700 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {lead.email || "—"}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block mb-0.5">
                  Phone Number
                </span>
                <span className="font-medium text-slate-700 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {lead.phone || "—"}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block mb-0.5">
                  Company
                </span>
                <span className="font-medium text-slate-700">
                  {lead.company || "—"}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block mb-0.5">
                  Lead ID
                </span>
                <span className="font-mono text-slate-500">#{lead.id}</span>
              </div>
            </div>

            {/* AI Insights Card */}
            <div className="border border-purple-200/70 bg-gradient-to-br from-purple-50/60 to-indigo-50/40 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-purple-800 font-bold text-xs">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span>SalesMax AI Summary</span>
                </div>
                {!aiSummary && (
                  <button
                    onClick={handleGenerateAiSummary}
                    disabled={generatingAi}
                    className="text-[11px] font-semibold text-purple-700 hover:text-purple-900 bg-white/80 border border-purple-200 px-2 py-0.5 rounded-md shadow-2xs"
                  >
                    {generatingAi ? "Generating..." : "Generate Insights"}
                  </button>
                )}
              </div>
              {aiSummary ? (
                <div className="text-xs text-purple-950 whitespace-pre-line leading-relaxed bg-white/70 p-3 rounded-lg border border-purple-100">
                  {aiSummary}
                </div>
              ) : (
                <p className="text-xs text-slate-500">
                  Click generate to analyze lead interactions and get next recommended actions.
                </p>
              )}
            </div>

            {/* Activity Timeline Section */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                Customer Interaction Timeline
              </h4>
              <ActivityTimeline
                leadId={lead.id}
                onActivityLogged={onLeadUpdated}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
