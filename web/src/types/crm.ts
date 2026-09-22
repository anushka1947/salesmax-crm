export interface Lead {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  source: string;
  status: string;
}

export interface Contact {
  id: number;
  first_name: string;
  last_name?: string | null;
  email?: string | null;
  phone?: string | null;
  company_name?: string | null;
  designation?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  lead_id?: number | null;
}

export interface Deal {
  id: number;
  title: string;
  value: number;
  stage: string;
  expected_close_date?: string | null;
  lead_id?: number | null;
  contact_id?: number | null;
  created_at: string;
}

export interface Task {
  id: number;
  title: string;
  type: string;
  due_date?: string | null;
  priority: string;
  status: string;
  lead_id?: number | null;
  contact_id?: number | null;
  created_at: string;
}

export interface Activity {
  id: number;
  type: string;
  title: string;
  description?: string | null;
  lead_id?: number | null;
  contact_id?: number | null;
  created_at: string;
}

export interface StageStat {
  stage: string;
  count: number;
  total_value: number;
}

export interface DashboardStats {
  total_leads: number;
  total_contacts: number;
  active_deals: number;
  pipeline_value: number;
  won_deals: number;
  won_value: number;
  conversion_rate: number;
  tasks_due_today: number;
  recent_activities: Activity[];
  deals_by_stage: {
    stage: string;
    count: number;
    total_value: number;
  }[];
}
