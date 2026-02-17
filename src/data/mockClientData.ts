// =============================================================
// DADOS MOCKADOS PARA A ÁREA DO CLIENTE
// =============================================================
// TODO: Substituir por busca real do Supabase quando integrar:
// const { data } = await supabase.from('clients').select('*').eq('user_id', user.id)
// =============================================================

export interface MockUser {
  name: string;
  email: string;
  phone: string;
  avatar: string | null;
}

export interface MockCredits {
  used: number;
  total: number;
  resetDate: string;
}

export interface MockGenerator {
  id: number;
  name: string;
  type: string;
  icon: string;
  color: string;
  description: string;
  enabled: boolean;
  tags: string[];
}

export interface MockArt {
  id: number;
  name: string;
  date: string;
  generator: string;
  thumbnail: string | null;
}

export interface MockPlan {
  name: string;
  creditsPerMonth: number;
  features: string[];
}

export interface MockClientData {
  user: MockUser;
  credits: MockCredits;
  generators: MockGenerator[];
  recentArts: MockArt[];
  plan: MockPlan;
  monthlyUsage: { month: string; credits: number }[];
}

export const mockClientData: MockClientData = {
  user: {
    name: "Prefeitura de Osasco",
    email: "prefeitura@osasco.sp.gov.br",
    phone: "(11) 99999-9999",
    avatar: null
  },
  credits: {
    used: 45,
    total: 100,
    resetDate: "2026-02-28"
  },
  generators: [
    { 
      id: 1, 
      name: "Gerador de Stories", 
      type: "stories", 
      icon: "Smartphone", 
      color: "bg-lime-400",
      description: "Crie stories verticais para Instagram e Facebook",
      enabled: true,
      tags: ["Instagram", "Facebook", "Redes Sociais"]
    },
    { 
      id: 2, 
      name: "Gerador de Derivações IA", 
      type: "derivations", 
      icon: "Sparkles", 
      color: "bg-purple-400",
      description: "Crie variações automáticas de uma arte base",
      enabled: true,
      tags: ["IA", "Variações", "Automático"]
    },
    { 
      id: 3, 
      name: "Carrossel de Interações", 
      type: "carousel", 
      icon: "Images", 
      color: "bg-blue-400",
      description: "Carrosséis para Instagram com múltiplos cards",
      enabled: true,
      tags: ["Instagram", "Carrossel", "Engajamento"]
    }
  ],
  recentArts: [
    { id: 1, name: "Story Aniversário da Cidade", date: "2026-01-28", generator: "Stories", thumbnail: null },
    { id: 2, name: "Post Aviso Importante", date: "2026-01-27", generator: "Derivações IA", thumbnail: null },
    { id: 3, name: "Carrossel Dicas de Saúde", date: "2026-01-25", generator: "Carrossel", thumbnail: null },
    { id: 4, name: "Story Evento Cultural", date: "2026-01-24", generator: "Stories", thumbnail: null },
    { id: 5, name: "Post Comunicado Oficial", date: "2026-01-23", generator: "Derivações IA", thumbnail: null },
    { id: 6, name: "Carrossel Turismo Local", date: "2026-01-22", generator: "Carrossel", thumbnail: null },
    { id: 7, name: "Story Campanha Vacinação", date: "2026-01-20", generator: "Stories", thumbnail: null },
    { id: 8, name: "Post Obras da Cidade", date: "2026-01-18", generator: "Derivações IA", thumbnail: null }
  ],
  plan: {
    name: "Profissional",
    creditsPerMonth: 100,
    features: [
      "100 créditos por mês",
      "3 geradores ativos",
      "Suporte prioritário",
      "Histórico de 90 dias"
    ]
  },
  monthlyUsage: [
    { month: "Ago", credits: 78 },
    { month: "Set", credits: 92 },
    { month: "Out", credits: 65 },
    { month: "Nov", credits: 88 },
    { month: "Dez", credits: 71 },
    { month: "Jan", credits: 45 }
  ]
};
