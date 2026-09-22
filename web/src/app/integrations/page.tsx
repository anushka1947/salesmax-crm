"use client";

import { useState } from "react";
import {
  Plug,
  MessageSquare,
  Facebook,
  Globe,
  Share2,
  CheckCircle2,
  Copy,
  Zap,
  Loader2,
  Sparkles,
} from "lucide-react";
import { api } from "@/lib/api";

export default function IntegrationsPage() {
  const [simulating, setSimulating] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const webhookUrl = "http://127.0.0.1:8000/api/leads/";

  const handleCopy = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateLead = async (source: string, sampleLead: any) => {
    setSimulating(source);
    setSuccessMsg(null);
    try {
      const created = await api.createLead(sampleLead);
      await api.createActivity({
        type: "lead_created",
        title: `Inbound Lead Ingested from ${source}`,
        description: `Captured prospect: ${created.name} (${created.company || "Direct"}). Assigned status: ${created.status}.`,
        lead_id: created.id,
      });
      setSuccessMsg(
        `Successfully captured lead "${created.name}" from ${source}! Check the Leads table or Dashboard.`
      );
    } catch (err: any) {
      alert("Failed to ingest lead: " + err.message);
    } finally {
      setSimulating(null);
    }
  };

  const INTEGRATIONS = [
    {
      id: "whatsapp",
      name: "WhatsApp Business API",
      category: "Messaging & Outreach",
      icon: MessageSquare,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200",
      description:
        "Official Meta Cloud API integration. Send pre-approved templates, 2-way live chat, and automated follow-ups.",
      status: "Connected (Demo Ready)",
      actionLabel: "Test WhatsApp Hook",
      sample: {
        name: "Neha Kapoor",
        email: "neha.k@enterprise.in",
        phone: "+91-9811223344",
        company: "Kapoor Logistics",
        source: "referral",
        status: "new",
      },
    },
    {
      id: "meta",
      name: "Meta Lead Ads",
      category: "Ad Ingestion",
      icon: Facebook,
      color: "text-blue-600 bg-blue-50 border-blue-200",
      description:
        "Real-time instant lead capture from Facebook & Instagram Instant Forms straight into your CRM funnel.",
      status: "Active (Webhook Ready)",
      actionLabel: "Simulate Meta Lead",
      sample: {
        name: "Aditya Verma",
        email: "aditya@verma-industries.com",
        phone: "+91-9876501234",
        company: "Verma Industries",
        source: "facebook",
        status: "new",
      },
    },
    {
      id: "indiamart",
      name: "IndiaMART Ingestion",
      category: "B2B Marketplace",
      icon: Globe,
      color: "text-amber-600 bg-amber-50 border-amber-200",
      description:
        "Automatic push notifications and lead ingestion for IndiaMART seller portal inquiries with instant rep alert.",
      status: "Active (Polling)",
      actionLabel: "Simulate IndiaMART Lead",
      sample: {
        name: "Suresh Reddy",
        email: "suresh@deccanmachinery.co.in",
        phone: "+91-9844005511",
        company: "Deccan Heavy Machinery",
        source: "indiamart",
        status: "new",
      },
    },
    {
      id: "justdial",
      name: "JustDial Leads",
      category: "Directory Aggregator",
      icon: Share2,
      color: "text-rose-600 bg-rose-50 border-rose-200",
      description:
        "Instant SMS/Webhook listener capturing B2B telecalling inquiries from JustDial commercial listings.",
      status: "Active",
      actionLabel: "Simulate JustDial Lead",
      sample: {
        name: "Kavita Nair",
        email: "kavita.n@cochinpharma.in",
        phone: "+91-9744112233",
        company: "Cochin BioPharma",
        source: "manual",
        status: "new",
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          Integrations & Inbound Webhooks
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
            Demo Suite
          </span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Connect marketing channels, directories, and messaging gateways directly into SalesMax CRM.
        </p>
      </div>

      {/* Webhook Endpoint Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-md space-y-3">
        <div className="flex items-center gap-2 text-purple-300 text-xs font-bold uppercase tracking-wider">
          <Zap className="w-4 h-4 text-amber-400" />
          <span>Inbound REST Webhook Listener</span>
        </div>
        <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
          Third-party platforms push incoming prospect submissions directly to this endpoint. You can test
          inbound capture immediately using the simulation buttons below!
        </p>

        <div className="flex items-center gap-2 pt-1 max-w-xl">
          <div className="flex-1 bg-black/40 border border-slate-700 px-3 py-2 rounded-xl font-mono text-xs text-purple-200 truncate">
            {webhookUrl}
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors shrink-0"
          >
            {copied ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            <span>{copied ? "Copied!" : "Copy Webhook"}</span>
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3 text-xs text-emerald-800 animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-medium">{successMsg}</span>
        </div>
      )}

      {/* Integration Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {INTEGRATIONS.map((item) => {
          const Icon = item.icon;
          const isCurrentSimulating = simulating === item.name;

          return (
            <div
              key={item.id}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${item.color}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">
                        {item.name}
                      </h3>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {item.category}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                    {item.status}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Ready for live events
                </span>
                <button
                  disabled={isCurrentSimulating}
                  onClick={() => handleSimulateLead(item.name, item.sample)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-purple-600 text-white text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  {isCurrentSimulating ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  )}
                  <span>{item.actionLabel}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
