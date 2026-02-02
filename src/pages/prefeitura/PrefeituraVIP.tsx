import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { 
  Smartphone, 
  Layers, 
  ArrowRight, 
  Crown, 
  Sparkles,
  LogOut,
  User,
  TrendingUp,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UserProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
}

export default function PrefeituraVIP() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      navigate('/login');
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (profile?.role !== 'prefeitura_vip') {
      navigate('/dashboard');
      return;
    }

    setUser(profile);
    setLoading(false);
  }

  const ferramentas = [
    {
      id: 'stories',
      titulo: 'Story para Instagram',
      descricao: 'Crie stories verticais com texto e imagem',
      icone: Smartphone,
      cor: 'from-lime-400 to-green-500',
      glow: 'lime',
      rota: '/prefeitura/stories'
    },
    {
      id: 'carrossel',
      titulo: 'Carrossel de Interações',
      descricao: 'Posts múltiplos para engajamento',
      icone: Layers,
      cor: 'from-blue-500 to-indigo-600',
      glow: 'blue',
      rota: '/prefeitura/carrossel'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-lime-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      
      {/* Header Superior */}
      <header className="sticky top-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-lime-400 to-green-500 rounded-xl flex items-center justify-center">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold text-white tracking-tight">
                  PREFEITURA MAIS FÁCIL
                </span>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-lime-400 rounded-full animate-pulse" />
                  Sistema Online • Heliodora/MG
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-white">{user?.full_name || 'Prefeitura'}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => supabase.auth.signOut().then(() => navigate('/login'))}
                className="text-gray-400 hover:text-red-400 hover:bg-red-950/30 rounded-xl"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>

          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        
        {/* Área de Boas-vindas */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-lime-500/10 border border-lime-500/20 text-lime-400 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Acesso Exclusivo VIP
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Olá! Pronto para criar?
          </h1>
          <p className="text-lg text-gray-400 max-w-xl mx-auto">
            Escolha abaixo o tipo de conteúdo que você precisa fazer. É rápido e fácil!
          </p>
        </div>

        {/* Cards de Ação - Design Premium */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {ferramentas.map((item) => {
            const Icon = item.icone;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.rota)}
                className="group relative bg-[#141414] border border-white/10 rounded-3xl p-8 text-left transition-all duration-300 hover:border-lime-400/30 hover:shadow-2xl hover:shadow-lime-900/10 overflow-hidden"
              >
                {/* Glow effect */}
                <div className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${item.cor} opacity-0 group-hover:opacity-20 blur-3xl transition-opacity duration-500`} />
                
                {/* Conteúdo */}
                <div className="relative z-10">
                  <div className={`w-14 h-14 bg-gradient-to-br ${item.cor} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-lime-400 transition-colors">
                    {item.titulo}
                  </h3>
                  <p className="text-gray-400 mb-6">
                    {item.descricao}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-medium">
                      Acesso Ilimitado
                    </span>
                    <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center group-hover:bg-lime-500 transition-colors">
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                    </div>
                  </div>
                </div>

                {/* Barra de progresso na base */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5">
                  <div className={`h-full bg-gradient-to-r ${item.cor} w-0 group-hover:w-full transition-all duration-500`} />
                </div>
              </button>
            );
          })}
        </div>

        {/* Stats/Rodapé */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-[#111] rounded-2xl border border-white/5">
          <div className="text-center p-4">
            <p className="text-xs text-gray-500 mb-1">Criações este mês</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl font-bold text-white">--</span>
              <TrendingUp className="w-4 h-4 text-lime-400" />
            </div>
          </div>

          <div className="text-center p-4 border-y md:border-y-0 md:border-x border-white/5">
            <p className="text-xs text-gray-500 mb-1">Plano Ativo</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl font-bold text-lime-400">VIP</span>
              <Crown className="w-4 h-4 text-lime-400" />
            </div>
          </div>

          <div className="text-center p-4">
            <div className="flex items-center justify-center gap-2">
              <p className="text-xs text-gray-500">Precisa de ajuda?</p>
              <p className="text-xs text-lime-400">Suporte técnico disponível</p>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
