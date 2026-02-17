export interface Service {
  id: string;
  user_id: string;
  icon: string | null;
  title: string;
  slug: string;
  short_description: string;
  full_description: string | null;
  features: string[];
  deliverables: string[];
  price_range: string | null;
  delivery_time: string | null;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServiceFormData {
  icon: string;
  title: string;
  slug: string;
  short_description: string;
  full_description: string;
  features: string[];
  deliverables: string[];
  price_range: string;
  delivery_time: string;
  image_url: string;
  display_order: number;
  is_active: boolean;
}

export const defaultServiceFormData: ServiceFormData = {
  icon: 'Palette',
  title: '',
  slug: '',
  short_description: '',
  full_description: '',
  features: [],
  deliverables: [],
  price_range: '',
  delivery_time: '',
  image_url: '',
  display_order: 0,
  is_active: true,
};
