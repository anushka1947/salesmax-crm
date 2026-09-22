"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  Building2,
  Trash2,
  Edit2,
  ExternalLink,
  Loader2,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { api } from "@/lib/api";
import { Lead } from "@/types/crm";
import LeadDrawer from "@/components/LeadDrawer";

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Add/Edit modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    source: "web_form",
    status: "new",
  });
  const [saving, setSaving] = useState(false);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const data = await api.getLeads();
      setLeads(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleOpenCreate = () => {
    setEditingLead(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      company: "",
      source: "web_form",
      status: "new",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (lead: Lead, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingLead(lead);
    setFormData({
      name: lead.name,
      email: lead.email || "",
      phone: lead.phone || "",
      company: lead.company || "",
      source: lead.source,
      status: lead.status,
    });
    setIsModalOpen(true);
  };

  const handleDeleteLead = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this lead?")) return;
    try {
      await api.deleteLead(id);
      fetchLeads();
    } catch (err) {
      alert("Failed to delete lead");
    }
  };

  const handleSaveLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingLead) {
        await api.updateLead(editingLead.id, formData);
      } else {
        await api.createLead(formData);
      }
      setIsModalOpen(false);
      fetchLeads();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Filtered leads
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.company && lead.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (lead.phone && lead.phone.includes(searchTerm)) ||
      (lead.email && lead.email.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === "all" || lead.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "new":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "contacted":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "qualified":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "converted":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "lost":
        return "bg-slate-100 text-slate-600 border-slate-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const getSourceBadge = (source: string) => {
    switch (source.toLowerCase()) {
      case "facebook":
        return "bg-blue-100/60 text-blue-800";
      case "google":
        return "bg-rose-100/60 text-rose-800";
      case "indiamart":
        return "bg-emerald-100/60 text-emerald-800";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Lead Management
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
              {leads.length} Leads
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Capture, qualify, and route incoming sales prospects from multiple ad and inbound channels.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchLeads}
            className="p-2 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 text-slate-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add New Lead
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col md:flex-row gap-3 items-center justify-between shadow-2xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name, phone, company, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
          />
        </div>

        {/* Status filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {["all", "new", "contacted", "qualified", "converted", "lost"].map(
            (st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-all shrink-0 ${
                  statusFilter === st
                    ? "bg-purple-600 text-white shadow-2xs"
                    : "text-slate-600 hover:bg-slate-100 bg-slate-50"
                }`}
              >
                {st}
              </button>
            )
          )}
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400 text-xs gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
            Loading leads registry...
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-xs space-y-2">
            <Users className="w-8 h-8 text-slate-300 mx-auto" />
            <p>No leads found matching current search/filter criteria.</p>
            <button
              onClick={handleOpenCreate}
              className="text-purple-600 font-semibold hover:underline"
            >
              + Create a new lead now
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-5 py-3">Lead Name</th>
                  <th className="px-5 py-3">Company</th>
                  <th className="px-5 py-3">Contact Info</th>
                  <th className="px-5 py-3">Source</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => setSelectedLead(lead)}
                    className="hover:bg-purple-50/30 cursor-pointer transition-colors group"
                  >
                    {/* Name */}
                    <td className="px-5 py-3.5 font-semibold text-slate-900 flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 font-bold text-[11px] flex items-center justify-center">
                        {lead.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span>{lead.name}</span>
                        <span className="text-[10px] text-slate-400 block font-normal font-mono">
                          ID: #{lead.id}
                        </span>
                      </div>
                    </td>

                    {/* Company */}
                    <td className="px-5 py-3.5">
                      {lead.company ? (
                        <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          {lead.company}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    {/* Phone & Email */}
                    <td className="px-5 py-3.5">
                      <div className="space-y-0.5">
                        {lead.phone && (
                          <span className="flex items-center gap-1 text-slate-700 font-mono text-[11px]">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {lead.phone}
                          </span>
                        )}
                        {lead.email && (
                          <span className="flex items-center gap-1 text-slate-500 text-[11px]">
                            <Mail className="w-3 h-3 text-slate-400" />
                            {lead.email}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Source */}
                    <td className="px-5 py-3.5">
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${getSourceBadge(
                          lead.source
                        )}`}
                      >
                        {lead.source}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3.5">
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border capitalize ${getStatusBadge(
                          lead.status
                        )}`}
                      >
                        {lead.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100">
                        <button
                          onClick={(e) => handleOpenEdit(lead, e)}
                          title="Edit Lead"
                          className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-purple-600 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteLead(lead.id, e)}
                          title="Delete Lead"
                          className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-red-600 transition-colors"
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
        )}
      </div>

      {/* Customer 360 Slide-over Drawer */}
      {selectedLead && (
        <LeadDrawer
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onLeadUpdated={fetchLeads}
        />
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-100 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-800">
              {editingLead ? "Edit Lead Information" : "Create New Lead"}
            </h3>

            <form onSubmit={handleSaveLead} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) =>
                    setFormData({ ...formData, company: e.target.value })
                  }
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Source
                  </label>
                  <select
                    value={formData.source}
                    onChange={(e) =>
                      setFormData({ ...formData, source: e.target.value })
                    }
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="web_form">Web Form</option>
                    <option value="facebook">Meta Lead Ads</option>
                    <option value="google">Google Ads</option>
                    <option value="manual">Manual Entry</option>
                    <option value="referral">Referral</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="qualified">Qualified</option>
                    <option value="converted">Converted</option>
                    <option value="lost">Lost</option>
                  </select>
                </div>
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
                  Save Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
