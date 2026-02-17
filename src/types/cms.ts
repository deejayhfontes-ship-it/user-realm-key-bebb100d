// Contact Messages
export interface ContactMessage {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  admin_notes: string | null;
  created_at: string;
  read_at: string | null;
}

export type ContactMessageStatus = ContactMessage['status'];

// Newsletter Subscribers
export interface NewsletterSubscriber {
  id: string;
  user_id: string;
  email: string;
  name: string | null;
  is_active: boolean;
  created_at: string;
}

// Company About
export interface CompanyAbout {
  id: string;
  user_id: string;
  headline: string;
  story_title: string | null;
  full_description: string | null;
  mission: string | null;
  vision: string | null;
  values: string[];
  foundation_year: string | null;
  team_size: string | null;
  projects_count: string | null;
  clients_count: string | null;
  about_image_url: string | null;
  differentials: Differential[];
  created_at: string;
  updated_at: string;
}

export interface Differential {
  icon: string;
  title: string;
  description: string;
}

export interface CompanyAboutFormData {
  headline: string;
  story_title: string;
  full_description: string;
  mission: string;
  vision: string;
  values: string[];
  foundation_year: string;
  team_size: string;
  projects_count: string;
  clients_count: string;
  about_image_url: string;
  differentials: Differential[];
}

export const defaultCompanyAboutFormData: CompanyAboutFormData = {
  headline: 'Quem Somos',
  story_title: '',
  full_description: '',
  mission: '',
  vision: '',
  values: [],
  foundation_year: '',
  team_size: '',
  projects_count: '',
  clients_count: '',
  about_image_url: '',
  differentials: [],
};

// Channel Settings
export interface ChannelSettings {
  id: string;
  user_id: string;
  whatsapp_number: string | null;
  whatsapp_default_message: string;
  whatsapp_show_float_button: boolean;
  instagram_url: string | null;
  behance_url: string | null;
  linkedin_url: string | null;
  youtube_url: string | null;
  contact_email: string | null;
  support_hours: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChannelSettingsFormData {
  whatsapp_number: string;
  whatsapp_default_message: string;
  whatsapp_show_float_button: boolean;
  instagram_url: string;
  behance_url: string;
  linkedin_url: string;
  youtube_url: string;
  contact_email: string;
  support_hours: string;
}

export const defaultChannelSettingsFormData: ChannelSettingsFormData = {
  whatsapp_number: '',
  whatsapp_default_message: 'Olá! Vi o site da Fontes Graphics e gostaria de mais informações.',
  whatsapp_show_float_button: true,
  instagram_url: '',
  behance_url: '',
  linkedin_url: '',
  youtube_url: '',
  contact_email: '',
  support_hours: 'Seg-Sex: 9h às 18h',
};
