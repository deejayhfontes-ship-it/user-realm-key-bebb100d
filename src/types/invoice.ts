export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  serviceDate?: string;
}

export interface PixConfig {
  pixKey: string;
  merchantName: string;
  merchantCity: string;
  enabled: boolean;
}

export interface WiseConfig {
  username: string;
  enabled: boolean;
}

export interface InvoiceData {
  id?: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  billTo: {
    name: string;
    company: string;
    address: string;
    email: string;
  };
  shipTo: {
    name: string;
    event: string;
    location: string;
    phone: string;
    email: string;
  };
  items: InvoiceItem[];
  showNotes: boolean;
  discount: number;
  taxRate: number;
  notes: string;
  pix: PixConfig;
  wise: WiseConfig;
  status?: 'pending' | 'paid' | 'overdue' | 'cancelled';
}

export interface InvoiceRow {
  id: string;
  invoice_number: string;
  bill_to_name: string;
  bill_to_company: string | null;
  bill_to_address: string | null;
  bill_to_email: string | null;
  ship_to_name: string;
  ship_to_event: string | null;
  ship_to_location: string | null;
  ship_to_phone: string | null;
  ship_to_email: string | null;
  date: string;
  due_date: string | null;
  items: InvoiceItem[];
  discount: number;
  tax_rate: number;
  total: number;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  notes: string | null;
  pix_config: PixConfig | null;
  wise_config: WiseConfig | null;
  pix_code: string | null;
  pix_txid: string | null;
  pix_generated_at: string | null;
  pix_config_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}
