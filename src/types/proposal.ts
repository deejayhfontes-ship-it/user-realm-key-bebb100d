export interface ScopeItem {
  id: string;
  title: string;
  description: string;
}

export type RecurrenceType = 'once' | 'monthly' | 'yearly';

export interface Proposal {
  id: string;
  proposal_number: string;
  date: string;
  validity_days: number;
  status: 'draft' | 'sent' | 'approved' | 'rejected' | 'expired';
  client_name: string;
  client_company: string | null;
  client_email: string | null;
  client_phone: string | null;
  client_address: string | null;
  project_title: string;
  project_description: string | null;
  scope_items: ScopeItem[];
  investment_value: number;
  payment_conditions: string | null;
  estimated_days: number | null;
  recurrence_type: RecurrenceType;
  contract_period_months: number | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProposalSettings {
  id: string;
  user_id: string | null;
  company_name: string | null;
  company_document: string | null;
  company_address: string | null;
  company_phone: string | null;
  company_email: string | null;
  company_website: string | null;
  logo_url: string | null;
  default_notes: string | null;
  default_payment_conditions: string | null;
  show_fontes_logo: boolean;
  show_criate_logo: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface NewProposal {
  client_name: string;
  client_company?: string;
  client_email?: string;
  client_phone?: string;
  client_address?: string;
  project_title: string;
  project_description?: string;
  scope_items: ScopeItem[];
  investment_value: number;
  payment_conditions?: string;
  estimated_days?: number;
  recurrence_type?: RecurrenceType;
  contract_period_months?: number;
  notes?: string;
  validity_days?: number;
}
