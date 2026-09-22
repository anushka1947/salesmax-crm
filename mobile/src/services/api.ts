import { Platform } from 'react-native';
import {
  Lead,
  Contact,
  Deal,
  Task,
  Activity,
  DashboardStats,
} from '../types/crm';

// Default resolution:
// - EXPO_PUBLIC_API_URL if configured in .env
// - 10.0.2.2:8000 for Android emulator
// - localhost:8000 for iOS simulator / web
let customApiBaseUrl: string | null = null;

export const getApiBaseUrl = (): string => {
  if (customApiBaseUrl) {
    return customApiBaseUrl;
  }
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000';
  }
  return 'http://localhost:8000';
};

export const setApiBaseUrl = (url: string) => {
  customApiBaseUrl = url.replace(/\/+$/, '');
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${endpoint}`;

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorDetail = `Request failed (${response.status})`;
      try {
        const errJson = await response.json();
        errorDetail = errJson.detail || errJson.message || errorDetail;
      } catch {
        errorDetail = response.statusText || errorDetail;
      }
      throw new Error(errorDetail);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return await response.json();
  } catch (error: any) {
    if (error.message && error.message.includes('Network request failed')) {
      throw new Error(
        `Cannot connect to backend at ${baseUrl}.\n` +
          (Platform.OS === 'android'
            ? 'For Android emulator, ensure backend is running at http://10.0.2.2:8000. For physical phone, use your PC LAN IPv4 (e.g. http://192.168.x.x:8000).'
            : 'Ensure FastAPI backend is running at ' + baseUrl)
      );
    }
    throw error;
  }
}

export const api = {
  // Base URL access
  getBaseUrl: getApiBaseUrl,
  setBaseUrl: setApiBaseUrl,

  // --- Dashboard ---
  getDashboardStats: () => request<DashboardStats>('/api/dashboard/stats'),

  // --- Leads ---
  getLeads: () => request<Lead[]>('/api/leads/'),
  getLead: (id: number) => request<Lead>(`/api/leads/${id}`),
  createLead: (data: Partial<Lead>) =>
    request<Lead>('/api/leads/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateLead: (id: number, data: Partial<Lead>) =>
    request<Lead>(`/api/leads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteLead: (id: number) =>
    request<void>(`/api/leads/${id}`, {
      method: 'DELETE',
    }),

  // --- Contacts ---
  getContacts: () => request<Contact[]>('/api/contacts/'),
  getContact: (id: number) => request<Contact>(`/api/contacts/${id}`),
  createContact: (data: Partial<Contact>) =>
    request<Contact>('/api/contacts/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateContact: (id: number, data: Partial<Contact>) =>
    request<Contact>(`/api/contacts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteContact: (id: number) =>
    request<void>(`/api/contacts/${id}`, {
      method: 'DELETE',
    }),

  // --- Deals ---
  getDeals: (stage?: string) => {
    const query = stage ? `?stage=${encodeURIComponent(stage)}` : '';
    return request<Deal[]>(`/api/deals/${query}`);
  },
  getDeal: (id: number) => request<Deal>(`/api/deals/${id}`),
  createDeal: (data: Partial<Deal>) =>
    request<Deal>('/api/deals/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateDeal: (id: number, data: Partial<Deal>) =>
    request<Deal>(`/api/deals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  updateDealStage: (id: number, stage: string) =>
    request<Deal>(`/api/deals/${id}/stage`, {
      method: 'PUT',
      body: JSON.stringify({ stage }),
    }),
  deleteDeal: (id: number) =>
    request<void>(`/api/deals/${id}`, {
      method: 'DELETE',
    }),

  // --- Tasks ---
  getTasks: (status?: string) => {
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    return request<Task[]>(`/api/tasks/${query}`);
  },
  getTask: (id: number) => request<Task>(`/api/tasks/${id}`),
  createTask: (data: Partial<Task>) =>
    request<Task>('/api/tasks/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  toggleTask: (id: number) =>
    request<Task>(`/api/tasks/${id}/toggle`, {
      method: 'PUT',
    }),
  deleteTask: (id: number) =>
    request<void>(`/api/tasks/${id}`, {
      method: 'DELETE',
    }),

  // --- Activities ---
  getActivities: (params?: {
    lead_id?: number;
    contact_id?: number;
    type?: string;
    limit?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.lead_id) searchParams.append('lead_id', String(params.lead_id));
    if (params?.contact_id) searchParams.append('contact_id', String(params.contact_id));
    if (params?.type) searchParams.append('type', params.type);
    if (params?.limit) searchParams.append('limit', String(params.limit));

    const qs = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return request<Activity[]>(`/api/activities/${qs}`);
  },
  createActivity: (data: Partial<Activity>) =>
    request<Activity>('/api/activities/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
