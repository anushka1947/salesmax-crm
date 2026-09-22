import {
  Lead,
  Contact,
  Deal,
  Task,
  Activity,
  DashboardStats,
} from "@/types/crm";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    let errorDetail = "API request failed";
    try {
      const errorJson = await response.json();
      errorDetail = errorJson.detail || errorJson.message || errorDetail;
    } catch {
      errorDetail = response.statusText;
    }
    throw new Error(errorDetail);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const api = {
  // --- Dashboard ---
  getDashboardStats: () => request<DashboardStats>("/api/dashboard/stats"),

  // --- Leads ---
  getLeads: () => request<Lead[]>("/api/leads/"),
  getLead: (id: number) => request<Lead>(`/api/leads/${id}`),
  createLead: (data: Partial<Lead>) =>
    request<Lead>("/api/leads/", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateLead: (id: number, data: Partial<Lead>) =>
    request<Lead>(`/api/leads/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteLead: (id: number) =>
    request<void>(`/api/leads/${id}`, {
      method: "DELETE",
    }),

  // --- Contacts ---
  getContacts: () => request<Contact[]>("/api/contacts/"),
  getContact: (id: number) => request<Contact>(`/api/contacts/${id}`),
  createContact: (data: Partial<Contact>) =>
    request<Contact>("/api/contacts/", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateContact: (id: number, data: Partial<Contact>) =>
    request<Contact>(`/api/contacts/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteContact: (id: number) =>
    request<void>(`/api/contacts/${id}`, {
      method: "DELETE",
    }),

  // --- Deals ---
  getDeals: (stage?: string) => {
    const query = stage ? `?stage=${encodeURIComponent(stage)}` : "";
    return request<Deal[]>(`/api/deals/${query}`);
  },
  getDeal: (id: number) => request<Deal>(`/api/deals/${id}`),
  createDeal: (data: Partial<Deal>) =>
    request<Deal>("/api/deals/", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateDeal: (id: number, data: Partial<Deal>) =>
    request<Deal>(`/api/deals/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  updateDealStage: (id: number, stage: string) =>
    request<Deal>(`/api/deals/${id}/stage`, {
      method: "PUT",
      body: JSON.stringify({ stage }),
    }),
  deleteDeal: (id: number) =>
    request<void>(`/api/deals/${id}`, {
      method: "DELETE",
    }),

  // --- Tasks ---
  getTasks: (status?: string) => {
    const query = status ? `?status=${encodeURIComponent(status)}` : "";
    return request<Task[]>(`/api/tasks/${query}`);
  },
  getTask: (id: number) => request<Task>(`/api/tasks/${id}`),
  createTask: (data: Partial<Task>) =>
    request<Task>("/api/tasks/", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  toggleTask: (id: number) =>
    request<Task>(`/api/tasks/${id}/toggle`, {
      method: "PUT",
    }),
  deleteTask: (id: number) =>
    request<void>(`/api/tasks/${id}`, {
      method: "DELETE",
    }),

  // --- Activities ---
  getActivities: (params?: {
    lead_id?: number;
    contact_id?: number;
    type?: string;
    limit?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.lead_id) searchParams.append("lead_id", String(params.lead_id));
    if (params?.contact_id) searchParams.append("contact_id", String(params.contact_id));
    if (params?.type) searchParams.append("type", params.type);
    if (params?.limit) searchParams.append("limit", String(params.limit));

    const qs = searchParams.toString() ? `?${searchParams.toString()}` : "";
    return request<Activity[]>(`/api/activities/${qs}`);
  },
  createActivity: (data: Partial<Activity>) =>
    request<Activity>("/api/activities/", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
