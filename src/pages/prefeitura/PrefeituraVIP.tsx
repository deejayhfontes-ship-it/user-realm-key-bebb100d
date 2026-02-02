import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  Sparkles, 
  ArrowUpRight, 
  LogOut, 
  User,
  Crown,
  Loader2
} from 'lucide-react';

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
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      // Carrega geradores VIP ativos
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-lime-50/30 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-lime-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-lime-50/30">
      {/* Top Navigation - Minimalista Premium */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-lime-400 to-lime-500 rounded-2xl flex items-center justify-center shadow-lg shadow-lime-200">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold text-gray-900 tracking-tight">
                  PREFEITURA+FÁCIL
                </span>
                <p className="text-xs text-gray-400 -mt-0.5">
                  Heliodora • VIP Access
                </p>
              </div>
            </div>

            {/* User Area */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-2xl">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">
                  {profile?.email || user?.email || 'Usuário'}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all duration-300"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Header Área - Bem espaçoso e premium */}
        <header className="mb-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-lime-100 text-lime-700 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Acesso Exclusivo
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4 tracking-tight">
            Olá, Secretaria 👋
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Ferramentas profissionais de criação de conteúdo, 
            simplificadas para sua produtividade.
          </p>
        </header>

        {/* Grid Premium - Cards mais elevados */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {geradores.map((gerador, index) => (
            <button
              key={gerador.id}
              onClick={() => navigate(gerador.rota_frontend || `/prefeitura/${gerador.slug}`)}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
              className="group relative bg-white rounded-[2rem] p-8 text-left transition-all duration-500 ease-out border border-gray-100 hover:border-lime-200 hover:shadow-2xl hover:shadow-lime-100/50 hover:-translate-y-1 overflow-hidden"
            >
              {/* Background gradiente sutil no hover */}
              <div className={`absolute inset-0 bg-gradient-to-br from-lime-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <div className="text-4xl">
                    {gerador.icone || '📱'}
                  </div>
                  
                  <div className={`w-10 h-10 rounded-full bg-gray-100 group-hover:bg-lime-400 flex items-center justify-center transition-all duration-300 ${hoveredCard === index ? 'scale-110' : ''}`}>
                    <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-lime-700 transition-colors">
                    {gerador.nome}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-4">
                    {gerador.descricao || 'Acesse esta ferramenta'}
                  </p>
                  
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-gray-400 group-hover:text-lime-600 transition-colors">
                    <Sparkles className="w-4 h-4" />
                    Acessar ferramenta
                  </span>
                </div>
              </div>

              {/* Linha decorativa inferior */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-lime-400 to-lime-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
            </button>
          ))}
        </div>

        {/* Empty State */}
        {geradores.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhum gerador disponível
            </h3>
            <p className="text-gray-500">
              Entre em contato com o administrador para liberar seus acessos.
            </p>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-20 pt-8 border-t border-gray-100">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-400">
            <p>© 2026 Prefeitura Mais Fácil • Todos os direitos reservados</p>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-lime-400 rounded-full animate-pulse" />
                Sistema Online
              </span>
              <span>Versão 2.0</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
