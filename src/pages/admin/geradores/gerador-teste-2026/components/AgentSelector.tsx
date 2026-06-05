import React, { useState, useEffect } from 'react';
import {
  Bot, Sparkles, Wand2, Zap, Search, Layers, Package,
  ChevronRight, Grid3X3, Clock, Star
} from 'lucide-react';

// Injeta a fonte real do DesignBuilder (Plus Jakarta Sans + Inter)
const FONT_URL = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap';


// ─── Definição dos Agentes ────────────────────────────────────────────────────
export interface AgentConfig {
  id: string;
  name: string;
  category: 'Builder' | 'Imagem' | 'Produto';
  description: string;
  icon: React.ElementType;
  badge?: 'BETA' | 'NOVO' | 'PRO';
  accentColor: string;
  glowColor: string;
  available: boolean;
}

export const AGENTS: AgentConfig[] = [
  {
    id: 'orion',
    name: 'Órion',
    category: 'Builder',
    description: 'Construa qualquer estilo de design.',
    icon: Bot,
    accentColor: '#7c3aed',
    glowColor: 'rgba(124,58,237,0.18)',
    available: true,
  },
  {
    id: 'orion-pro',
    name: 'Órion Pro',
    category: 'Builder',
    description: 'Versão avançada para composições mais detalhadas e refinadas.',
    icon: Sparkles,
    badge: 'BETA',
    accentColor: '#2563eb',
    glowColor: 'rgba(37,99,235,0.18)',
    available: true,
  },
  {
    id: 'db-1-1',
    name: 'Design Builder 1.1',
    category: 'Builder',
    description: 'Construa estilos visuais com base em referências públicas e briefing criativo.',
    icon: Layers,
    accentColor: '#6b7280',
    glowColor: 'rgba(107,114,128,0.12)',
    available: true,
  },
  {
    id: 'db-1-2',
    name: 'Design Builder 1.2',
    category: 'Builder',
    description: 'Versão aprimorada para criação de campanhas e peças com direção de arte.',
    icon: Grid3X3,
    accentColor: '#6b7280',
    glowColor: 'rgba(107,114,128,0.12)',
    available: true,
  },
  {
    id: 'ref',
    name: 'Ref',
    category: 'Builder',
    description: 'Replique estilos visuais com fidelidade a partir de referências enviadas pelo usuário.',
    icon: Search,
    accentColor: '#d97706',
    glowColor: 'rgba(217,119,6,0.18)',
    available: true,
  },
  {
    id: 'enhance',
    name: 'Enhance',
    category: 'Imagem',
    description: 'Melhore imagens borradas, antigas ou com baixa qualidade.',
    icon: Zap,
    badge: 'BETA',
    accentColor: '#059669',
    glowColor: 'rgba(5,150,105,0.18)',
    available: true,
  },
  {
    id: 'hydra',
    name: 'Hydra',
    category: 'Produto',
    description: 'Fotos realistas de produto e composições profissionais.',
    icon: Package,
    badge: 'BETA',
    accentColor: '#db2777',
    glowColor: 'rgba(219,39,119,0.18)',
    available: true,
  },
];

// ─── Componente Badge ─────────────────────────────────────────────────────────
function Badge({ type }: { type: AgentConfig['badge'] }) {
  const styles: Record<string, string> = {
    BETA: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    NOVO: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    PRO: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  };
  if (!type) return null;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold tracking-widest border ${styles[type]}`}>
      {type}
    </span>
  );
}

// ─── Card do Agente ───────────────────────────────────────────────────────────
function AgentCard({ agent, onClick }: { agent: AgentConfig; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  const Icon = agent.icon;

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative flex flex-col items-start p-6 rounded-2xl text-left w-full transition-all duration-300 overflow-hidden"
      style={{
        background: hovered
          ? `linear-gradient(135deg, #18181b, #111113)`
          : '#121214',
        border: `1px solid ${hovered ? agent.accentColor + '55' : 'rgba(255,255,255,0.06)'}`,
        boxShadow: hovered ? `0 0 32px ${agent.glowColor}, 0 4px 24px rgba(0,0,0,0.4)` : '0 1px 4px rgba(0,0,0,0.3)',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
      }}
    >
      {/* Glow de fundo animado */}
      <div
        className="absolute inset-0 rounded-2xl transition-opacity duration-300 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 20% 20%, ${agent.glowColor}, transparent 70%)`,
          opacity: hovered ? 1 : 0,
        }}
      />

      {/* Linha de brilho no topo */}
      <div
        className="absolute top-0 left-6 right-6 h-px transition-opacity duration-300"
        style={{
          background: `linear-gradient(90deg, transparent, ${agent.accentColor}80, transparent)`,
          opacity: hovered ? 1 : 0,
        }}
      />

      {/* Header: Ícone + Badge */}
      <div className="relative z-10 flex items-start justify-between w-full mb-5">
        <div
          className="p-3 rounded-xl transition-transform duration-300"
          style={{
            background: `${agent.accentColor}18`,
            border: `1px solid ${agent.accentColor}30`,
            transform: hovered ? 'scale(1.08)' : 'scale(1)',
            color: agent.accentColor,
          }}
        >
          <Icon size={22} />
        </div>
        <Badge type={agent.badge} />
      </div>

      {/* Categoria */}
      <span
        className="relative z-10 text-[11px] font-semibold uppercase tracking-widest mb-1.5"
        style={{ color: agent.accentColor }}
      >
        {agent.category}
      </span>

      {/* Nome */}
      <h3 className="relative z-10 text-[17px] font-semibold text-zinc-100 mb-2 leading-snug">
        {agent.name}
      </h3>

      {/* Descrição */}
      <p className="relative z-10 text-sm text-zinc-400 leading-relaxed flex-1">
        {agent.description}
      </p>

      {/* CTA */}
      <div
        className="relative z-10 flex items-center gap-1.5 mt-5 text-xs font-semibold transition-all duration-300"
        style={{
          color: agent.accentColor,
          opacity: hovered ? 1 : 0,
          transform: hovered ? 'translateY(0)' : 'translateY(6px)',
        }}
      >
        Abrir Agente <ChevronRight size={13} />
      </div>
    </button>
  );
}

// ─── Componente Principal ─────────────────────────────────────────────────────
interface AgentSelectorProps {
  onSelectAgent: (agentId: string) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  Builder: 'Construtores',
  Imagem: 'Imagem',
  Produto: 'Produto',
};

export default function AgentSelector({ onSelectAgent }: AgentSelectorProps) {
  const [filter, setFilter] = useState<string>('Todos');
  const categories = ['Todos', 'Builder', 'Imagem', 'Produto'];

  // Injetar fonte Plus Jakarta Sans (a mesma que o DesignBuilder usa)
  useEffect(() => {
    if (!document.querySelector(`link[href="${FONT_URL}"]`)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = FONT_URL;
      document.head.appendChild(link);
    }
  }, []);

  const filtered = filter === 'Todos'
    ? AGENTS
    : AGENTS.filter(a => a.category === filter);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

  return (
    <div
      className="w-full min-h-screen text-white flex flex-col relative overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, #08080e 0%, #0a0812 50%, #080810 100%)',
        fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
      }}
    >

      {/* Glows de ambiente */}
      <div className="absolute top-0 left-[10%] w-[40%] h-[35%] rounded-full blur-[140px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(124,58,237,0.08), transparent)' }} />
      <div className="absolute bottom-0 right-[5%] w-[35%] h-[35%] rounded-full blur-[140px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(37,99,235,0.06), transparent)' }} />

      <div className="relative z-10 flex-1 flex flex-col max-w-[1400px] mx-auto w-full px-6 md:px-10 py-10">

        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/20">
              <Star size={10} className="text-violet-400" />
              <span className="text-[11px] text-violet-300 font-medium">DesignBuilder Studio</span>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-light tracking-tight text-zinc-100 mb-2">
            {greeting},&nbsp;
            <span className="font-semibold bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">
              Marllon
            </span>
          </h1>
          <p className="text-zinc-400 text-base md:text-lg">
            Selecione o agente de IA para iniciar seu projeto.
          </p>
        </div>

        {/* ── Filtros por Categoria ──────────────────────────────────────────── */}
        <div className="flex items-center gap-2 mb-8 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className="px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200"
              style={{
                background: filter === cat ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${filter === cat ? 'rgba(124,58,237,0.5)' : 'rgba(255,255,255,0.08)'}`,
                color: filter === cat ? '#c4b5fd' : '#71717a',
              }}
            >
              {cat === 'Todos' ? 'Todos' : CATEGORY_LABELS[cat] || cat}
            </button>
          ))}

          <div className="ml-auto flex items-center gap-2 text-xs text-zinc-600">
            <Clock size={12} />
            <span>{filtered.length} agente{filtered.length !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* ── Grid de Agentes ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map(agent => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onClick={() => onSelectAgent(agent.id)}
            />
          ))}
        </div>

        {/* ── Footer info ───────────────────────────────────────────────────── */}
        <div className="mt-12 pt-6 border-t border-white/[0.04] flex items-center justify-between">
          <p className="text-xs text-zinc-600">Motor IA v3.1 Pro · Gemini</p>
          <p className="text-xs text-zinc-600">Agentes BETA podem apresentar variações nos resultados.</p>
        </div>
      </div>
    </div>
  );
}
