import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Smartphone, Layers, ArrowRight, Crown, Sparkles, LogOut, Loader2 } from 'lucide-react';

interface UserProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
}

export default function PrefeituraVIP() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-lime-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">

      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-lime-400 to-green-500 rounded-xl flex items-center justify-center">
            <Crown className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-white tracking-tight">PREFEITURA+</h1>
            <span className="text-xs text-gray-500">Acesso VIP</span>
          </div>
        </div>
        <button 
          onClick={() => supabase.auth.signOut().then(() => navigate('/login'))} 
          className="text-gray-400 hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      {/* Conteúdo */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-2">Olá! Pronto para criar?</h2>
          <p className="text-gray-400">Escolha o tipo de conteúdo abaixo.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card Stories */}
          <button
            onClick={() => navigate('/prefeitura/stories')}
            className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 text-left hover:border-lime-400/50 transition-all group"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-lime-400 to-green-500 rounded-xl flex items-center justify-center mb-4">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-1">Story para Instagram</h3>
            <p className="text-sm text-gray-400 mb-4">Crie stories verticais com texto e imagem</p>
            <span className="text-lime-400 text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
              Criar agora <ArrowRight className="w-4 h-4" />
            </span>
          </button>

          {/* Card Carrossel */}
          <button
            onClick={() => navigate('/prefeitura/carrossel')}
            className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 text-left hover:border-blue-400/50 transition-all group"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-1">Carrossel de Interações</h3>
            <p className="text-sm text-gray-400 mb-4">Posts múltiplos para engajamento</p>
            <span className="text-blue-400 text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
              Criar agora <ArrowRight className="w-4 h-4" />
            </span>
          </button>
        </div>
      </main>
    </div>
  );
}
