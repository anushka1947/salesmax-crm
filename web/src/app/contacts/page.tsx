"use client";

import { useState, useEffect } from "react";
import {
  Contact2,
  Search,
  Plus,
  Phone,
  Mail,
  Building2,
  MapPin,
  Trash2,
  Edit2,
  Loader2,
  RefreshCw,
  Briefcase,
  Link as LinkIcon,
} from "lucide-react";
import { api } from "@/lib/api";
import { Contact } from "@/types/crm";

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    company_name: "",
    designation: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [saving, setSaving] = useState(false);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const data = await api.getContacts();
      setContacts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleOpenCreate = () => {
    setEditingContact(null);
    setFormData({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      company_name: "",
      designation: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Contact) => {
    setEditingContact(c);
    setFormData({
      first_name: c.first_name,
      last_name: c.last_name || "",
      email: c.email || "",
      phone: c.phone || "",
      company_name: c.company_name || "",
      designation: c.designation || "",
      address: c.address || "",
      city: c.city || "",
      state: c.state || "",
      pincode: c.pincode || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this contact?")) return;
    try {
      await api.deleteContact(id);
      fetchContacts();
    } catch (err) {
      alert("Failed to delete contact");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingContact) {
        await api.updateContact(editingContact.id, formData);
      } else {
        await api.createContact(formData);
      }
      setIsModalOpen(false);
      fetchContacts();
    } catch (err: any) {
      alert("Error saving contact: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const filteredContacts = contacts.filter((c) => {
    const fullName = `${c.first_name} ${c.last_name || ""}`.toLowerCase();
    const query = searchTerm.toLowerCase();
    return (
      fullName.includes(query) ||
      (c.company_name && c.company_name.toLowerCase().includes(query)) ||
      (c.designation && c.designation.toLowerCase().includes(query)) ||
      (c.phone && c.phone.includes(query)) ||
      (c.email && c.email.toLowerCase().includes(query))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Contacts Registry
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
              {contacts.length} Contacts
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Verified customer relationships, company stakeholders, and converted account owners.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchContacts}
            className="p-2 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 text-slate-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Contact
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 flex gap-3 shadow-2xs">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search contacts by name, designation, company, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
          />
        </div>
      </div>

      {/* Contacts Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400 text-xs gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
            Loading contacts registry...
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-xs space-y-2">
            <Contact2 className="w-8 h-8 text-slate-300 mx-auto" />
            <p>No contacts found.</p>
            <button
              onClick={handleOpenCreate}
              className="text-purple-600 font-semibold hover:underline"
            >
              + Add a contact now
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-5 py-3">Contact Name</th>
                  <th className="px-5 py-3">Title / Designation</th>
                  <th className="px-5 py-3">Company</th>
                  <th className="px-5 py-3">Contact Details</th>
                  <th className="px-5 py-3">Location</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredContacts.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Name */}
                    <td className="px-5 py-3.5 font-semibold text-slate-900 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center">
                        {c.first_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span>
                            {c.first_name} {c.last_name || ""}
                          </span>
                          {c.lead_id && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-50 text-purple-600 font-mono flex items-center gap-0.5" title={`Originating Lead #${c.lead_id}`}>
                              <LinkIcon className="w-2.5 h-2.5" />
                              Lead #{c.lead_id}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 block font-normal font-mono">
                          ID: #{c.id}
                        </span>
                      </div>
                    </td>

                    {/* Designation */}
                    <td className="px-5 py-3.5">
                      {c.designation ? (
                        <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                          <Briefcase className="w-3 h-3 text-slate-400" />
                          {c.designation}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    {/* Company */}
                    <td className="px-5 py-3.5">
                      {c.company_name ? (
                        <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          {c.company_name}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    {/* Phone & Email */}
                    <td className="px-5 py-3.5">
                      <div className="space-y-0.5">
                        {c.phone && (
                          <span className="flex items-center gap-1 text-slate-700 font-mono text-[11px]">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {c.phone}
                          </span>
                        )}
                        {c.email && (
                          <span className="flex items-center gap-1 text-slate-500 text-[11px]">
                            <Mail className="w-3 h-3 text-slate-400" />
                            {c.email}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Location */}
                    <td className="px-5 py-3.5">
                      {c.city || c.state ? (
                        <span className="flex items-center gap-1 text-slate-600">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {[c.city, c.state].filter(Boolean).join(", ")}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(c)}
                          title="Edit Contact"
                          className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-purple-600 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          title="Delete Contact"
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

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-100 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-800">
              {editingContact ? "Edit Contact" : "Create New Contact"}
            </h3>

            <form onSubmit={handleSave} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.first_name}
                    onChange={(e) =>
                      setFormData({ ...formData, first_name: e.target.value })
                    }
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) =>
                      setFormData({ ...formData, last_name: e.target.value })
                    }
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={formData.company_name}
                    onChange={(e) =>
                      setFormData({ ...formData, company_name: e.target.value })
                    }
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Designation / Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Head of Growth"
                    value={formData.designation}
                    onChange={(e) =>
                      setFormData({ ...formData, designation: e.target.value })
                    }
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) =>
                      setFormData({ ...formData, state: e.target.value })
                    }
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
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
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
