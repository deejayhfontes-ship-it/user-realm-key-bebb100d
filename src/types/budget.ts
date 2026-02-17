export interface CatalogItem {
  id: string;
  sku: string | null;
  name: string;
  description: string | null;
  unit: string;
  default_price: number;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface BudgetSettings {
  id: string;
  user_id: string;
  company_name: string | null;
  company_document: string | null;
  company_address: string | null;
  company_phone: string | null;
  company_email: string | null;
  logo_url: string | null;
  show_fontes_logo: boolean;
  show_criate_logo: boolean;
  default_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Budget {
  id: string;
  budget_number: string;
  date: string;
  validity_days: number;
  client_name: string;
  client_document: string | null;
  client_email: string | null;
  client_phone: string | null;
  client_address: string | null;
  subtotal: number;
  global_discount_type: 'fixed' | 'percent';
  global_discount_value: number;
  shipping: number;
  total: number;
  notes: string | null;
  terms_and_conditions: string | null;
  status: 'draft' | 'sent' | 'approved' | 'rejected' | 'expired';
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface BudgetLine {
  id: string;
  budget_id: string;
  catalog_item_id: string | null;
  description: string;
  quantity: number;
  unit_price: number;
  discount_type: 'fixed' | 'percent';
  discount_value: number;
  total: number;
  sort_order: number;
  created_at: string;
}

export interface BudgetWithLines extends Budget {
  lines: BudgetLine[];
}

export interface NewBudgetLine {
  catalog_item_id: string | null;
  description: string;
  quantity: number;
  unit_price: number;
  discount_type: 'fixed' | 'percent';
  discount_value: number;
  total: number;
}
