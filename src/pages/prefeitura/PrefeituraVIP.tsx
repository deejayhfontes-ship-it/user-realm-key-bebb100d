<<<<<<< HEAD
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ArrowUpRight,
  ArrowLeft,
  LogOut,
  User,
  Crown,
  Loader2,
  Smartphone,
  Layers,
  Upload,
  Image as ImageIcon,
  Type,
  Wand2,
  Send,
  Palette,
  FileText,
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  Copy
} from 'lucide-react';
import { LiveChatWidget } from '@/components/landing/LiveChatWidget';

type ViewType = 'list' | 'stories' | 'carrossel' | 'external-stories';

interface GeradorVIP {
  id: string;
  nome: string;
  slug: string;
  descricao: string | null;
  icone: string | null;
  cor: string | null;
  ativo: boolean | null;
  ordem: number | null;
  rota_frontend: string | null;
}

export default function PrefeituraVIP() {
  const [geradores, setGeradores] = useState<GeradorVIP[]>([]);
  const [view, setView] = useState<ViewType>('list');
  const [loading, setLoading] = useState(true);
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  // --- Consulta de Protocolo ---
  const [protocoloBusca, setProtocoloBusca] = useState('');
  const [resultadoConsulta, setResultadoConsulta] = useState<any>(null);
  const [buscando, setBuscando] = useState(false);
  const [erroBusca, setErroBusca] = useState('');

  const buscarProtocolo = () => {
    if (!protocoloBusca.trim()) return;
    setBuscando(true);
    setErroBusca('');
    setResultadoConsulta(null);

    setTimeout(() => {
      const solicitacoes = JSON.parse(localStorage.getItem('solicitacoes_sbstudio') || '[]');
      const encontrada = solicitacoes.find((s: any) => s.protocolo?.toUpperCase() === protocoloBusca.trim().toUpperCase());

      if (encontrada) {
        setResultadoConsulta(encontrada);
      } else {
        setErroBusca('Protocolo não encontrado. Verifique o número e tente novamente.');
      }
      setBuscando(false);
    }, 600);
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'concluido': return { label: 'Concluído', color: 'text-green-400', bg: 'bg-green-400/10 border-green-400/20' };
      case 'em-andamento': return { label: 'Em Andamento', color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/20' };
      case 'atrasado': return { label: 'Atrasado', color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/20' };
      default: return { label: 'Recebido', color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/20' };
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      const { data: geradoresData, error } = await supabase
        .from('geradores_vip')
        .select('*')
        .eq('ativo', true)
        .order('ordem', { ascending: true });

      if (error) throw error;
      if (geradoresData) setGeradores(geradoresData);
    } catch (error) {
      console.error('Erro ao carregar geradores:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const getViewTitle = () => {
    switch (view) {
      case 'stories': return 'Gerador de Stories';
      case 'carrossel': return 'Carrossel de Interações';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-lime-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505]">
      {/* Header Sticky Premium */}
      <header className="sticky top-0 z-50 backdrop-blur-2xl bg-[#0a0a0a]/70 border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left Section */}
            <div className="flex items-center gap-4">
              {view !== 'list' ? (
                <button
                  onClick={() => setView('list')}
                  className="flex items-center gap-2 px-4 py-2 text-zinc-400 hover:text-white rounded-xl hover:bg-white/[0.06] transition-all duration-300"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span className="font-medium">Voltar</span>
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-lime-400 to-green-500 rounded-2xl flex items-center justify-center shadow-lg shadow-lime-400/20">
                    <Crown className="w-5 h-5 text-black" />
                  </div>
                  <div>
                    <span className="text-lg font-bold text-white tracking-tight">
                      PREFEITURA+FÁCIL
                    </span>
                    <p className="text-xs text-zinc-500">
                      Heliodora • VIP Access
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Center Title (when in editor) */}
            {view !== 'list' && (
              <h1 className="absolute left-1/2 -translate-x-1/2 text-xl font-bold text-white">
                {getViewTitle()}
              </h1>
            )}

            {/* Right Section */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/[0.04] border border-white/[0.06] rounded-2xl">
                <User className="w-4 h-4 text-zinc-500" />
                <span className="text-sm font-medium text-zinc-300">
                  {profile?.email || user?.email || 'heliodora@prefeitura.com.br'}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="p-3 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-2xl transition-all duration-300"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {/* LIST VIEW */}
          {view === 'list' && (
            <motion.div
              key="list"
              initial={{ opacity: 0, x: -32 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -32 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              {/* Header */}
              <div className="mb-16 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-lime-400/10 border border-lime-400/20 text-lime-400 rounded-full text-sm font-medium mb-6">
                  <Sparkles className="w-4 h-4" />
                  Acesso VIP
                </div>

                <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight">
                  Olá, equipe!
                </h1>
                <p className="text-xl text-zinc-400 font-light">
                  Pronto para criar conteúdo?
                </p>
              </div>

              {/* Grid Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {/* Card Stories */}
                <button
                  onClick={() => navigate('/prefeitura/gerador-conteudo')}
                  className="group relative bg-[#131313] rounded-[2rem] p-8 text-left transition-all duration-500 border border-white/[0.06] hover:border-lime-400/30 hover:shadow-[0_0_60px_-15px_rgba(163,230,53,0.25)] hover:-translate-y-1 overflow-hidden flex flex-col min-h-[280px]"
                >
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-auto">
                      <div className="w-16 h-16 bg-gradient-to-br from-lime-400 to-green-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                        <Smartphone className="w-8 h-8 text-black" />
                      </div>
                      <div className="w-10 h-10 rounded-full bg-white/[0.04] group-hover:bg-lime-400 flex items-center justify-center transition-all duration-300">
                        <ArrowUpRight className="w-5 h-5 text-zinc-600 group-hover:text-black transition-colors" />
                      </div>
                    </div>

                    <div className="mt-auto">
                      <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-lime-400 transition-colors">
                        Story para Instagram
                      </h3>
                      <span className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 group-hover:text-lime-400 transition-colors">
                        <Wand2 className="w-4 h-4" />
                        Acessar ferramenta
                      </span>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-lime-400 to-green-400 w-0 group-hover:w-full transition-all duration-700" />
                </button>

                {/* Card Carrossel */}
                <button
                  onClick={() => navigate('/prefeitura/gerador-conteudo?tab=carrossel')}
                  className="group relative bg-[#131313] rounded-[2rem] p-8 text-left transition-all duration-500 border border-white/[0.06] hover:border-indigo-400/30 hover:shadow-[0_0_60px_-15px_rgba(129,140,248,0.25)] hover:-translate-y-1 overflow-hidden flex flex-col min-h-[280px]"
                >
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-auto">
                      <div className="w-16 h-16 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                        <Layers className="w-8 h-8 text-white" />
                      </div>
                      <div className="w-10 h-10 rounded-full bg-white/[0.04] group-hover:bg-indigo-400 flex items-center justify-center transition-all duration-300">
                        <ArrowUpRight className="w-5 h-5 text-zinc-600 group-hover:text-white transition-colors" />
                      </div>
                    </div>

                    <div className="mt-auto">
                      <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-indigo-400 transition-colors">
                        Carrossel de Interações
                      </h3>
                      <span className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 group-hover:text-indigo-400 transition-colors">
                        <Wand2 className="w-4 h-4" />
                        Acessar ferramenta
                      </span>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-400 to-purple-500 w-0 group-hover:w-full transition-all duration-700" />
                </button>

                {/* Card Solicitações de Artes */}
                <button
                  onClick={() => navigate('/prefeitura/solicitacao-artes')}
                  className="group relative bg-[#131313] rounded-[2rem] p-8 text-left transition-all duration-500 border border-white/[0.06] hover:border-amber-400/30 hover:shadow-[0_0_60px_-15px_rgba(251,191,36,0.25)] hover:-translate-y-1 overflow-hidden flex flex-col min-h-[280px]"
                >
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-auto">
                      <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                        <Send className="w-8 h-8 text-black" />
                      </div>
                      <div className="w-10 h-10 rounded-full bg-white/[0.04] group-hover:bg-amber-400 flex items-center justify-center transition-all duration-300">
                        <ArrowUpRight className="w-5 h-5 text-zinc-600 group-hover:text-black transition-colors" />
                      </div>
                    </div>

                    <div className="mt-auto">
                      <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-amber-400 transition-colors">
                        Solicitações de Artes
                      </h3>
                      <span className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 group-hover:text-amber-400 transition-colors">
                        <Wand2 className="w-4 h-4" />
                        Enviar pedido
                      </span>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-400 to-orange-500 w-0 group-hover:w-full transition-all duration-700" />
                </button>

                {/* Card Brand Kit */}
                <button
                  onClick={() => navigate('/prefeitura/brand-kit')}
                  className="group relative bg-[#131313] rounded-[2rem] p-8 text-left transition-all duration-500 border border-white/[0.06] hover:border-rose-400/30 hover:shadow-[0_0_60px_-15px_rgba(251,113,133,0.25)] hover:-translate-y-1 overflow-hidden flex flex-col min-h-[280px]"
                >
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-auto">
                      <div className="w-16 h-16 bg-gradient-to-br from-rose-400 to-pink-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                        <Palette className="w-8 h-8 text-white" />
                      </div>
                      <div className="w-10 h-10 rounded-full bg-white/[0.04] group-hover:bg-rose-400 flex items-center justify-center transition-all duration-300">
                        <ArrowUpRight className="w-5 h-5 text-zinc-600 group-hover:text-white transition-colors" />
                      </div>
                    </div>

                    <div className="mt-auto">
                      <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-rose-400 transition-colors">
                        Brand Kit Prefeitura
                      </h3>
                      <span className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 group-hover:text-rose-400 transition-colors">
                        <Wand2 className="w-4 h-4" />
                        Logos e cores
                      </span>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-rose-400 to-pink-500 w-0 group-hover:w-full transition-all duration-700" />
                </button>

                {/* Card Modelos e Geradores */}
                <button
                  onClick={() => navigate('/prefeitura/modelos-oficiais')}
                  className="group relative bg-[#131313] rounded-[2rem] p-8 text-left transition-all duration-500 border border-white/[0.06] hover:border-cyan-400/30 hover:shadow-[0_0_60px_-15px_rgba(34,211,238,0.25)] hover:-translate-y-1 overflow-hidden flex flex-col min-h-[280px]"
                >
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-auto">
                      <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-teal-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                        <FileText className="w-8 h-8 text-black" />
                      </div>
                      <div className="w-10 h-10 rounded-full bg-white/[0.04] group-hover:bg-cyan-400 flex items-center justify-center transition-all duration-300">
                        <ArrowUpRight className="w-5 h-5 text-zinc-600 group-hover:text-black transition-colors" />
                      </div>
                    </div>

                    <div className="mt-auto">
                      <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">
                        Modelos Oficiais
                      </h3>
                      <span className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 group-hover:text-cyan-400 transition-colors">
                        <Wand2 className="w-4 h-4" />
                        Templates e geradores
                      </span>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-400 to-teal-500 w-0 group-hover:w-full transition-all duration-700" />
                </button>
              </div>

              {/* === CARD DE CONSULTA DE PROTOCOLO === */}
              <div className="max-w-6xl mx-auto mt-12">
                <div className="relative bg-[#131313] rounded-[2rem] p-8 border border-white/[0.06] overflow-hidden">
                  {/* Decoração */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-lime-400/[0.03] to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />

                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 bg-gradient-to-br from-lime-400 to-green-500 rounded-2xl flex items-center justify-center">
                        <Search className="w-7 h-7 text-black" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">Consultar Protocolo</h3>
                        <p className="text-sm text-zinc-500">Acompanhe o status da sua solicitação</p>
                      </div>
                    </div>

                    {/* Campo de busca */}
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={protocoloBusca}
                        onChange={(e) => setProtocoloBusca(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && buscarProtocolo()}
                        placeholder="Ex: SB-DG-202602-123456"
                        className="flex-1 bg-zinc-900/50 border border-zinc-800 focus:border-lime-400/50 text-white placeholder-zinc-600 rounded-xl px-5 py-3.5 outline-none transition-colors text-sm"
                      />
                      <button
                        onClick={buscarProtocolo}
                        disabled={buscando || !protocoloBusca.trim()}
                        className="px-6 py-3.5 bg-gradient-to-r from-lime-400 to-green-500 text-black font-semibold rounded-xl hover:shadow-lg hover:shadow-lime-400/25 transition-all duration-300 flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {buscando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                        Buscar
                      </button>
                    </div>

                    {/* Resultado */}
                    {erroBusca && (
                      <div className="mt-4 flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                        <p className="text-sm text-red-400">{erroBusca}</p>
                      </div>
                    )}

                    {resultadoConsulta && (
                      <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-5 p-5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-4"
                      >
                        {/* Header do resultado */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-lime-400/10 rounded-xl flex items-center justify-center">
                              <CheckCircle className="w-5 h-5 text-lime-400" />
                            </div>
                            <div>
                              <p className="text-white font-semibold">{resultadoConsulta.titulo}</p>
                              <p className="text-xs text-zinc-500 font-mono">{resultadoConsulta.protocolo}</p>
                            </div>
                          </div>
                          <span className={`text-xs font-medium px-3 py-1.5 rounded-full border ${getStatusInfo(resultadoConsulta.status).bg} ${getStatusInfo(resultadoConsulta.status).color}`}>
                            {getStatusInfo(resultadoConsulta.status).label}
                          </span>
                        </div>

                        {/* Detalhes */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="p-3 rounded-lg bg-zinc-800/50">
                            <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Tipo</p>
                            <p className="text-sm text-white font-medium">{resultadoConsulta.tipoMaterial || '—'}</p>
                          </div>
                          <div className="p-3 rounded-lg bg-zinc-800/50">
                            <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Departamento</p>
                            <p className="text-sm text-white font-medium">{resultadoConsulta.departamento || '—'}</p>
                          </div>
                          <div className="p-3 rounded-lg bg-zinc-800/50">
                            <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Progresso</p>
                            <p className="text-sm text-white font-medium">{resultadoConsulta.progresso || 0}%</p>
                          </div>
                          <div className="p-3 rounded-lg bg-zinc-800/50">
                            <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Prazo</p>
                            <p className="text-sm text-white font-medium">{resultadoConsulta.prazoEstimado?.data || '—'}</p>
                          </div>
                        </div>

                        {/* Barra de progresso */}
                        <div>
                          <div className="flex justify-between text-xs text-zinc-500 mb-1.5">
                            <span>Progresso geral</span>
                            <span>{resultadoConsulta.progresso || 0}%</span>
                          </div>
                          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-lime-400 to-green-500 transition-all duration-700"
                              style={{ width: `${resultadoConsulta.progresso || 0}%` }}
                            />
                          </div>
                        </div>

                        {/* Botão copiar protocolo */}
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(resultadoConsulta.protocolo);
                          }}
                          className="flex items-center gap-2 text-xs text-zinc-500 hover:text-lime-400 transition-colors"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          Copiar protocolo
                        </button>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STORIES EDITOR VIEW */}
          {view === 'stories' && (
            <motion.div
              key="stories"
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 32 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="grid grid-cols-1 lg:grid-cols-5 gap-8"
            >
              {/* Form Section (60%) */}
              <div className="lg:col-span-3 space-y-6">
                <div className="bg-[#111111] border border-white/[0.08] rounded-2xl p-6">
                  <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-lime-400" />
                    Upload da Imagem
                  </h2>

                  <label className="block">
                    <div className="border-2 border-dashed border-zinc-800 hover:border-lime-400/50 rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 group">
                      <div className="w-16 h-16 bg-zinc-900 group-hover:bg-lime-400/10 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors">
                        <Upload className="w-8 h-8 text-zinc-600 group-hover:text-lime-400 transition-colors" />
                      </div>
                      <p className="text-zinc-400 mb-2">Arraste uma imagem ou clique para selecionar</p>
                      <p className="text-zinc-600 text-sm">PNG, JPG até 10MB • 1080x1920 recomendado</p>
                    </div>
                    <input type="file" className="hidden" accept="image/*" />
                  </label>
                </div>

                <div className="bg-[#111111] border border-white/[0.08] rounded-2xl p-6">
                  <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                    <Type className="w-5 h-5 text-lime-400" />
                    Texto do Story
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-2">Título principal</label>
                      <input
                        type="text"
                        placeholder="Ex: Novo projeto inaugurado!"
                        className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-lime-400/50 text-white placeholder-zinc-600 rounded-xl px-4 py-3 outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-2">Subtítulo (opcional)</label>
                      <input
                        type="text"
                        placeholder="Ex: Confira todos os detalhes"
                        className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-lime-400/50 text-white placeholder-zinc-600 rounded-xl px-4 py-3 outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <button className="w-full bg-gradient-to-r from-lime-400 to-green-500 text-black font-bold py-4 rounded-xl hover:shadow-lg hover:shadow-lime-400/25 transition-all duration-300 flex items-center justify-center gap-2">
                  <Wand2 className="w-5 h-5" />
                  Gerar Imagem
                </button>
              </div>

              {/* Preview Section (40%) */}
              <div className="lg:col-span-2">
                <div className="sticky top-32">
                  <div className="bg-[#111111] border border-white/[0.08] rounded-2xl p-6">
                    <h2 className="text-lg font-semibold text-white mb-6">Preview</h2>
                    <div className="aspect-[9/16] bg-zinc-900 rounded-2xl flex items-center justify-center border border-white/[0.04]">
                      <div className="text-center text-zinc-600">
                        <Smartphone className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">O preview aparecerá aqui</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* CARROSSEL EDITOR VIEW */}
          {view === 'carrossel' && (
            <motion.div
              key="carrossel"
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 32 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="grid grid-cols-1 lg:grid-cols-5 gap-8"
            >
              {/* Form Section (60%) */}
              <div className="lg:col-span-3 space-y-6">
                <div className="bg-[#111111] border border-white/[0.08] rounded-2xl p-6">
                  <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-indigo-400" />
                    Configurar Carrossel
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-2">Título do carrossel</label>
                      <input
                        type="text"
                        placeholder="Ex: 5 projetos que transformaram a cidade"
                        className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-indigo-400/50 text-white placeholder-zinc-600 rounded-xl px-4 py-3 outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-2">Número de slides</label>
                      <select className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-indigo-400/50 text-white rounded-xl px-4 py-3 outline-none transition-colors">
                        <option value="3">3 slides</option>
                        <option value="5">5 slides</option>
                        <option value="7">7 slides</option>
                        <option value="10">10 slides</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-[#111111] border border-white/[0.08] rounded-2xl p-6">
                  <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-indigo-400" />
                    Imagens do Carrossel
                  </h2>

                  <label className="block">
                    <div className="border-2 border-dashed border-zinc-800 hover:border-indigo-400/50 rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 group">
                      <div className="w-16 h-16 bg-zinc-900 group-hover:bg-indigo-400/10 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors">
                        <Upload className="w-8 h-8 text-zinc-600 group-hover:text-indigo-400 transition-colors" />
                      </div>
                      <p className="text-zinc-400 mb-2">Arraste imagens ou clique para selecionar</p>
                      <p className="text-zinc-600 text-sm">PNG, JPG até 10MB • 1080x1080 recomendado</p>
                    </div>
                    <input type="file" className="hidden" accept="image/*" multiple />
                  </label>
                </div>

                <button className="w-full bg-gradient-to-r from-indigo-400 to-purple-500 text-white font-bold py-4 rounded-xl hover:shadow-lg hover:shadow-indigo-400/25 transition-all duration-300 flex items-center justify-center gap-2">
                  <Wand2 className="w-5 h-5" />
                  Gerar Carrossel
                </button>
              </div>

              {/* Preview Section (40%) */}
              <div className="lg:col-span-2">
                <div className="sticky top-32">
                  <div className="bg-[#111111] border border-white/[0.08] rounded-2xl p-6">
                    <h2 className="text-lg font-semibold text-white mb-6">Preview</h2>
                    <div className="aspect-square bg-zinc-900 rounded-2xl flex items-center justify-center border border-white/[0.04]">
                      <div className="text-center text-zinc-600">
                        <Layers className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">O preview aparecerá aqui</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      {/* Chat Widget - reposicionado para canto inferior + neon glow */}
      <style>{`
        .prefeitura-chat > div {
          top: auto !important;
          bottom: 24px !important;
          right: 24px !important;
        }
        .prefeitura-chat > div > button {
          background: rgba(163, 230, 53, 0.15) !important;
          border: 1px solid rgba(163, 230, 53, 0.4) !important;
          box-shadow: 0 0 20px rgba(163, 230, 53, 0.35), 0 0 40px rgba(163, 230, 53, 0.15), inset 0 1px 0 rgba(163, 230, 53, 0.2) !important;
          animation: neonPulse 2s ease-in-out infinite !important;
        }
        .prefeitura-chat > div > button:hover {
          box-shadow: 0 0 30px rgba(163, 230, 53, 0.5), 0 0 60px rgba(163, 230, 53, 0.25) !important;
          transform: scale(1.1) !important;
        }
        .prefeitura-chat > div > button svg {
          color: #a3e635 !important;
          filter: drop-shadow(0 0 6px rgba(163, 230, 53, 0.6)) !important;
        }
        @keyframes neonPulse {
          0%, 100% { box-shadow: 0 0 20px rgba(163, 230, 53, 0.35), 0 0 40px rgba(163, 230, 53, 0.15); }
          50% { box-shadow: 0 0 25px rgba(163, 230, 53, 0.5), 0 0 50px rgba(163, 230, 53, 0.25); }
        }
      `}</style>
      <div className="prefeitura-chat">
        <LiveChatWidget />
      </div>
    </div>
  );
}
=======
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ArrowUpRight,
  ArrowLeft,
  LogOut,
  User,
  Crown,
  Loader2,
  Smartphone,
  Layers,
  Upload,
  Image as ImageIcon,
  Type,
  Wand2,
  Send,
  Palette,
  FileText,
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  Copy
} from 'lucide-react';
import { LiveChatWidget } from '@/components/landing/LiveChatWidget';

type ViewType = 'list' | 'stories' | 'carrossel' | 'external-stories';

interface GeradorVIP {
  id: string;
  nome: string;
  slug: string;
  descricao: string | null;
  icone: string | null;
  cor: string | null;
  ativo: boolean | null;
  ordem: number | null;
  rota_frontend: string | null;
}

export default function PrefeituraVIP() {
  const [geradores, setGeradores] = useState<GeradorVIP[]>([]);
  const [view, setView] = useState<ViewType>('list');
  const [loading, setLoading] = useState(true);
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  // --- Consulta de Protocolo ---
  const [protocoloBusca, setProtocoloBusca] = useState('');
  const [resultadoConsulta, setResultadoConsulta] = useState<any>(null);
  const [buscando, setBuscando] = useState(false);
  const [erroBusca, setErroBusca] = useState('');

  const buscarProtocolo = () => {
    if (!protocoloBusca.trim()) return;
    setBuscando(true);
    setErroBusca('');
    setResultadoConsulta(null);

    setTimeout(() => {
      const solicitacoes = JSON.parse(localStorage.getItem('solicitacoes_sbstudio') || '[]');
      const encontrada = solicitacoes.find((s: any) => s.protocolo?.toUpperCase() === protocoloBusca.trim().toUpperCase());

      if (encontrada) {
        setResultadoConsulta(encontrada);
      } else {
        setErroBusca('Protocolo não encontrado. Verifique o número e tente novamente.');
      }
      setBuscando(false);
    }, 600);
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'concluido': return { label: 'Concluído', color: 'text-green-400', bg: 'bg-green-400/10 border-green-400/20' };
      case 'em-andamento': return { label: 'Em Andamento', color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/20' };
      case 'atrasado': return { label: 'Atrasado', color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/20' };
      default: return { label: 'Recebido', color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/20' };
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      const { data: geradoresData, error } = await supabase
        .from('geradores_vip')
        .select('*')
        .eq('ativo', true)
        .order('ordem', { ascending: true });

      if (error) throw error;
      if (geradoresData) setGeradores(geradoresData);
    } catch (error) {
      console.error('Erro ao carregar geradores:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const getViewTitle = () => {
    switch (view) {
      case 'stories': return 'Gerador de Stories';
      case 'carrossel': return 'Carrossel de Interações';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-lime-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505]">
      {/* Header Sticky Premium */}
      <header className="sticky top-0 z-50 backdrop-blur-2xl bg-[#0a0a0a]/70 border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left Section */}
            <div className="flex items-center gap-4">
              {view !== 'list' ? (
                <button
                  onClick={() => setView('list')}
                  className="flex items-center gap-2 px-4 py-2 text-zinc-400 hover:text-white rounded-xl hover:bg-white/[0.06] transition-all duration-300"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span className="font-medium">Voltar</span>
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-lime-400 to-green-500 rounded-2xl flex items-center justify-center shadow-lg shadow-lime-400/20">
                    <Crown className="w-5 h-5 text-black" />
                  </div>
                  <div>
                    <span className="text-lg font-bold text-white tracking-tight">
                      PREFEITURA+FÁCIL
                    </span>
                    <p className="text-xs text-zinc-500">
                      Heliodora • VIP Access
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Center Title (when in editor) */}
            {view !== 'list' && (
              <h1 className="absolute left-1/2 -translate-x-1/2 text-xl font-bold text-white">
                {getViewTitle()}
              </h1>
            )}

            {/* Right Section */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/[0.04] border border-white/[0.06] rounded-2xl">
                <User className="w-4 h-4 text-zinc-500" />
                <span className="text-sm font-medium text-zinc-300">
                  {profile?.email || user?.email || 'heliodora@prefeitura.com.br'}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="p-3 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-2xl transition-all duration-300"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {/* LIST VIEW */}
          {view === 'list' && (
            <motion.div
              key="list"
              initial={{ opacity: 0, x: -32 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -32 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              {/* Header */}
              <div className="mb-16 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-lime-400/10 border border-lime-400/20 text-lime-400 rounded-full text-sm font-medium mb-6">
                  <Sparkles className="w-4 h-4" />
                  Acesso VIP
                </div>

                <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight">
                  Olá, equipe!
                </h1>
                <p className="text-xl text-zinc-400 font-light">
                  Pronto para criar conteúdo?
                </p>
              </div>

              {/* Grid Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {/* Card Stories */}
                <button
                  onClick={() => navigate('/prefeitura/gerador-conteudo')}
                  className="group relative bg-[#131313] rounded-[2rem] p-8 text-left transition-all duration-500 border border-white/[0.06] hover:border-lime-400/30 hover:shadow-[0_0_60px_-15px_rgba(163,230,53,0.25)] hover:-translate-y-1 overflow-hidden flex flex-col min-h-[280px]"
                >
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-auto">
                      <div className="w-16 h-16 bg-gradient-to-br from-lime-400 to-green-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                        <Smartphone className="w-8 h-8 text-black" />
                      </div>
                      <div className="w-10 h-10 rounded-full bg-white/[0.04] group-hover:bg-lime-400 flex items-center justify-center transition-all duration-300">
                        <ArrowUpRight className="w-5 h-5 text-zinc-600 group-hover:text-black transition-colors" />
                      </div>
                    </div>

                    <div className="mt-auto">
                      <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-lime-400 transition-colors">
                        Story para Instagram
                      </h3>
                      <span className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 group-hover:text-lime-400 transition-colors">
                        <Wand2 className="w-4 h-4" />
                        Acessar ferramenta
                      </span>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-lime-400 to-green-400 w-0 group-hover:w-full transition-all duration-700" />
                </button>

                {/* Card Carrossel */}
                <button
                  onClick={() => navigate('/prefeitura/gerador-conteudo?tab=carrossel')}
                  className="group relative bg-[#131313] rounded-[2rem] p-8 text-left transition-all duration-500 border border-white/[0.06] hover:border-indigo-400/30 hover:shadow-[0_0_60px_-15px_rgba(129,140,248,0.25)] hover:-translate-y-1 overflow-hidden flex flex-col min-h-[280px]"
                >
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-auto">
                      <div className="w-16 h-16 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                        <Layers className="w-8 h-8 text-white" />
                      </div>
                      <div className="w-10 h-10 rounded-full bg-white/[0.04] group-hover:bg-indigo-400 flex items-center justify-center transition-all duration-300">
                        <ArrowUpRight className="w-5 h-5 text-zinc-600 group-hover:text-white transition-colors" />
                      </div>
                    </div>

                    <div className="mt-auto">
                      <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-indigo-400 transition-colors">
                        Carrossel de Interações
                      </h3>
                      <span className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 group-hover:text-indigo-400 transition-colors">
                        <Wand2 className="w-4 h-4" />
                        Acessar ferramenta
                      </span>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-400 to-purple-500 w-0 group-hover:w-full transition-all duration-700" />
                </button>

                {/* Card Solicitações de Artes */}
                <button
                  onClick={() => navigate('/prefeitura/solicitacao-artes')}
                  className="group relative bg-[#131313] rounded-[2rem] p-8 text-left transition-all duration-500 border border-white/[0.06] hover:border-amber-400/30 hover:shadow-[0_0_60px_-15px_rgba(251,191,36,0.25)] hover:-translate-y-1 overflow-hidden flex flex-col min-h-[280px]"
                >
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-auto">
                      <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                        <Send className="w-8 h-8 text-black" />
                      </div>
                      <div className="w-10 h-10 rounded-full bg-white/[0.04] group-hover:bg-amber-400 flex items-center justify-center transition-all duration-300">
                        <ArrowUpRight className="w-5 h-5 text-zinc-600 group-hover:text-black transition-colors" />
                      </div>
                    </div>

                    <div className="mt-auto">
                      <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-amber-400 transition-colors">
                        Solicitações de Artes
                      </h3>
                      <span className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 group-hover:text-amber-400 transition-colors">
                        <Wand2 className="w-4 h-4" />
                        Enviar pedido
                      </span>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-400 to-orange-500 w-0 group-hover:w-full transition-all duration-700" />
                </button>

                {/* Card Brand Kit */}
                <button
                  onClick={() => navigate('/prefeitura/brand-kit')}
                  className="group relative bg-[#131313] rounded-[2rem] p-8 text-left transition-all duration-500 border border-white/[0.06] hover:border-rose-400/30 hover:shadow-[0_0_60px_-15px_rgba(251,113,133,0.25)] hover:-translate-y-1 overflow-hidden flex flex-col min-h-[280px]"
                >
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-auto">
                      <div className="w-16 h-16 bg-gradient-to-br from-rose-400 to-pink-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                        <Palette className="w-8 h-8 text-white" />
                      </div>
                      <div className="w-10 h-10 rounded-full bg-white/[0.04] group-hover:bg-rose-400 flex items-center justify-center transition-all duration-300">
                        <ArrowUpRight className="w-5 h-5 text-zinc-600 group-hover:text-white transition-colors" />
                      </div>
                    </div>

                    <div className="mt-auto">
                      <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-rose-400 transition-colors">
                        Brand Kit Prefeitura
                      </h3>
                      <span className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 group-hover:text-rose-400 transition-colors">
                        <Wand2 className="w-4 h-4" />
                        Logos e cores
                      </span>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-rose-400 to-pink-500 w-0 group-hover:w-full transition-all duration-700" />
                </button>

                {/* Card Modelos e Geradores */}
                <button
                  onClick={() => navigate('/prefeitura/modelos-oficiais')}
                  className="group relative bg-[#131313] rounded-[2rem] p-8 text-left transition-all duration-500 border border-white/[0.06] hover:border-cyan-400/30 hover:shadow-[0_0_60px_-15px_rgba(34,211,238,0.25)] hover:-translate-y-1 overflow-hidden flex flex-col min-h-[280px]"
                >
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-auto">
                      <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-teal-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                        <FileText className="w-8 h-8 text-black" />
                      </div>
                      <div className="w-10 h-10 rounded-full bg-white/[0.04] group-hover:bg-cyan-400 flex items-center justify-center transition-all duration-300">
                        <ArrowUpRight className="w-5 h-5 text-zinc-600 group-hover:text-black transition-colors" />
                      </div>
                    </div>

                    <div className="mt-auto">
                      <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">
                        Modelos Oficiais
                      </h3>
                      <span className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 group-hover:text-cyan-400 transition-colors">
                        <Wand2 className="w-4 h-4" />
                        Templates e geradores
                      </span>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-400 to-teal-500 w-0 group-hover:w-full transition-all duration-700" />
                </button>
              </div>

              {/* === CARD DE CONSULTA DE PROTOCOLO === */}
              <div className="max-w-6xl mx-auto mt-12">
                <div className="relative bg-[#131313] rounded-[2rem] p-8 border border-white/[0.06] overflow-hidden">
                  {/* Decoração */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-lime-400/[0.03] to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />

                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 bg-gradient-to-br from-lime-400 to-green-500 rounded-2xl flex items-center justify-center">
                        <Search className="w-7 h-7 text-black" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">Consultar Protocolo</h3>
                        <p className="text-sm text-zinc-500">Acompanhe o status da sua solicitação</p>
                      </div>
                    </div>

                    {/* Campo de busca */}
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={protocoloBusca}
                        onChange={(e) => setProtocoloBusca(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && buscarProtocolo()}
                        placeholder="Ex: SB-DG-202602-123456"
                        className="flex-1 bg-zinc-900/50 border border-zinc-800 focus:border-lime-400/50 text-white placeholder-zinc-600 rounded-xl px-5 py-3.5 outline-none transition-colors text-sm"
                      />
                      <button
                        onClick={buscarProtocolo}
                        disabled={buscando || !protocoloBusca.trim()}
                        className="px-6 py-3.5 bg-gradient-to-r from-lime-400 to-green-500 text-black font-semibold rounded-xl hover:shadow-lg hover:shadow-lime-400/25 transition-all duration-300 flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {buscando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                        Buscar
                      </button>
                    </div>

                    {/* Resultado */}
                    {erroBusca && (
                      <div className="mt-4 flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                        <p className="text-sm text-red-400">{erroBusca}</p>
                      </div>
                    )}

                    {resultadoConsulta && (
                      <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-5 p-5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-4"
                      >
                        {/* Header do resultado */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-lime-400/10 rounded-xl flex items-center justify-center">
                              <CheckCircle className="w-5 h-5 text-lime-400" />
                            </div>
                            <div>
                              <p className="text-white font-semibold">{resultadoConsulta.titulo}</p>
                              <p className="text-xs text-zinc-500 font-mono">{resultadoConsulta.protocolo}</p>
                            </div>
                          </div>
                          <span className={`text-xs font-medium px-3 py-1.5 rounded-full border ${getStatusInfo(resultadoConsulta.status).bg} ${getStatusInfo(resultadoConsulta.status).color}`}>
                            {getStatusInfo(resultadoConsulta.status).label}
                          </span>
                        </div>

                        {/* Detalhes */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="p-3 rounded-lg bg-zinc-800/50">
                            <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Tipo</p>
                            <p className="text-sm text-white font-medium">{resultadoConsulta.tipoMaterial || '—'}</p>
                          </div>
                          <div className="p-3 rounded-lg bg-zinc-800/50">
                            <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Departamento</p>
                            <p className="text-sm text-white font-medium">{resultadoConsulta.departamento || '—'}</p>
                          </div>
                          <div className="p-3 rounded-lg bg-zinc-800/50">
                            <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Progresso</p>
                            <p className="text-sm text-white font-medium">{resultadoConsulta.progresso || 0}%</p>
                          </div>
                          <div className="p-3 rounded-lg bg-zinc-800/50">
                            <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Prazo</p>
                            <p className="text-sm text-white font-medium">{resultadoConsulta.prazoEstimado?.data || '—'}</p>
                          </div>
                        </div>

                        {/* Barra de progresso */}
                        <div>
                          <div className="flex justify-between text-xs text-zinc-500 mb-1.5">
                            <span>Progresso geral</span>
                            <span>{resultadoConsulta.progresso || 0}%</span>
                          </div>
                          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-lime-400 to-green-500 transition-all duration-700"
                              style={{ width: `${resultadoConsulta.progresso || 0}%` }}
                            />
                          </div>
                        </div>

                        {/* Botão copiar protocolo */}
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(resultadoConsulta.protocolo);
                          }}
                          className="flex items-center gap-2 text-xs text-zinc-500 hover:text-lime-400 transition-colors"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          Copiar protocolo
                        </button>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STORIES EDITOR VIEW */}
          {view === 'stories' && (
            <motion.div
              key="stories"
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 32 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="grid grid-cols-1 lg:grid-cols-5 gap-8"
            >
              {/* Form Section (60%) */}
              <div className="lg:col-span-3 space-y-6">
                <div className="bg-[#111111] border border-white/[0.08] rounded-2xl p-6">
                  <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-lime-400" />
                    Upload da Imagem
                  </h2>

                  <label className="block">
                    <div className="border-2 border-dashed border-zinc-800 hover:border-lime-400/50 rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 group">
                      <div className="w-16 h-16 bg-zinc-900 group-hover:bg-lime-400/10 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors">
                        <Upload className="w-8 h-8 text-zinc-600 group-hover:text-lime-400 transition-colors" />
                      </div>
                      <p className="text-zinc-400 mb-2">Arraste uma imagem ou clique para selecionar</p>
                      <p className="text-zinc-600 text-sm">PNG, JPG até 10MB • 1080x1920 recomendado</p>
                    </div>
                    <input type="file" className="hidden" accept="image/*" />
                  </label>
                </div>

                <div className="bg-[#111111] border border-white/[0.08] rounded-2xl p-6">
                  <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                    <Type className="w-5 h-5 text-lime-400" />
                    Texto do Story
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-2">Título principal</label>
                      <input
                        type="text"
                        placeholder="Ex: Novo projeto inaugurado!"
                        className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-lime-400/50 text-white placeholder-zinc-600 rounded-xl px-4 py-3 outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-2">Subtítulo (opcional)</label>
                      <input
                        type="text"
                        placeholder="Ex: Confira todos os detalhes"
                        className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-lime-400/50 text-white placeholder-zinc-600 rounded-xl px-4 py-3 outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <button className="w-full bg-gradient-to-r from-lime-400 to-green-500 text-black font-bold py-4 rounded-xl hover:shadow-lg hover:shadow-lime-400/25 transition-all duration-300 flex items-center justify-center gap-2">
                  <Wand2 className="w-5 h-5" />
                  Gerar Imagem
                </button>
              </div>

              {/* Preview Section (40%) */}
              <div className="lg:col-span-2">
                <div className="sticky top-32">
                  <div className="bg-[#111111] border border-white/[0.08] rounded-2xl p-6">
                    <h2 className="text-lg font-semibold text-white mb-6">Preview</h2>
                    <div className="aspect-[9/16] bg-zinc-900 rounded-2xl flex items-center justify-center border border-white/[0.04]">
                      <div className="text-center text-zinc-600">
                        <Smartphone className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">O preview aparecerá aqui</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* CARROSSEL EDITOR VIEW */}
          {view === 'carrossel' && (
            <motion.div
              key="carrossel"
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 32 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="grid grid-cols-1 lg:grid-cols-5 gap-8"
            >
              {/* Form Section (60%) */}
              <div className="lg:col-span-3 space-y-6">
                <div className="bg-[#111111] border border-white/[0.08] rounded-2xl p-6">
                  <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-indigo-400" />
                    Configurar Carrossel
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-2">Título do carrossel</label>
                      <input
                        type="text"
                        placeholder="Ex: 5 projetos que transformaram a cidade"
                        className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-indigo-400/50 text-white placeholder-zinc-600 rounded-xl px-4 py-3 outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-2">Número de slides</label>
                      <select className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-indigo-400/50 text-white rounded-xl px-4 py-3 outline-none transition-colors">
                        <option value="3">3 slides</option>
                        <option value="5">5 slides</option>
                        <option value="7">7 slides</option>
                        <option value="10">10 slides</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-[#111111] border border-white/[0.08] rounded-2xl p-6">
                  <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-indigo-400" />
                    Imagens do Carrossel
                  </h2>

                  <label className="block">
                    <div className="border-2 border-dashed border-zinc-800 hover:border-indigo-400/50 rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 group">
                      <div className="w-16 h-16 bg-zinc-900 group-hover:bg-indigo-400/10 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors">
                        <Upload className="w-8 h-8 text-zinc-600 group-hover:text-indigo-400 transition-colors" />
                      </div>
                      <p className="text-zinc-400 mb-2">Arraste imagens ou clique para selecionar</p>
                      <p className="text-zinc-600 text-sm">PNG, JPG até 10MB • 1080x1080 recomendado</p>
                    </div>
                    <input type="file" className="hidden" accept="image/*" multiple />
                  </label>
                </div>

                <button className="w-full bg-gradient-to-r from-indigo-400 to-purple-500 text-white font-bold py-4 rounded-xl hover:shadow-lg hover:shadow-indigo-400/25 transition-all duration-300 flex items-center justify-center gap-2">
                  <Wand2 className="w-5 h-5" />
                  Gerar Carrossel
                </button>
              </div>

              {/* Preview Section (40%) */}
              <div className="lg:col-span-2">
                <div className="sticky top-32">
                  <div className="bg-[#111111] border border-white/[0.08] rounded-2xl p-6">
                    <h2 className="text-lg font-semibold text-white mb-6">Preview</h2>
                    <div className="aspect-square bg-zinc-900 rounded-2xl flex items-center justify-center border border-white/[0.04]">
                      <div className="text-center text-zinc-600">
                        <Layers className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">O preview aparecerá aqui</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      {/* Chat Widget - reposicionado para canto inferior + neon glow */}
      <style>{`
        .prefeitura-chat > div {
          top: auto !important;
          bottom: 24px !important;
          right: 24px !important;
        }
        .prefeitura-chat > div > button {
          background: rgba(163, 230, 53, 0.15) !important;
          border: 1px solid rgba(163, 230, 53, 0.4) !important;
          box-shadow: 0 0 20px rgba(163, 230, 53, 0.35), 0 0 40px rgba(163, 230, 53, 0.15), inset 0 1px 0 rgba(163, 230, 53, 0.2) !important;
          animation: neonPulse 2s ease-in-out infinite !important;
        }
        .prefeitura-chat > div > button:hover {
          box-shadow: 0 0 30px rgba(163, 230, 53, 0.5), 0 0 60px rgba(163, 230, 53, 0.25) !important;
          transform: scale(1.1) !important;
        }
        .prefeitura-chat > div > button svg {
          color: #a3e635 !important;
          filter: drop-shadow(0 0 6px rgba(163, 230, 53, 0.6)) !important;
        }
        @keyframes neonPulse {
          0%, 100% { box-shadow: 0 0 20px rgba(163, 230, 53, 0.35), 0 0 40px rgba(163, 230, 53, 0.15); }
          50% { box-shadow: 0 0 25px rgba(163, 230, 53, 0.5), 0 0 50px rgba(163, 230, 53, 0.25); }
        }
      `}</style>
      <div className="prefeitura-chat">
        <LiveChatWidget />
      </div>
    </div>
  );
}
>>>>>>> 156f36cf0eee94361ff12bfb77e006213e68283d
