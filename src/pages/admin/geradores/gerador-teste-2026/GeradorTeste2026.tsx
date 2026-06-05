import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, MessageSquare } from 'lucide-react';
import { GeneratorState } from '@/lib/designbuilder-prompts';
import { useGeminiImageGeneration } from '@/hooks/useGeminiImageGeneration';
import type { GenerationConfig } from '@/hooks/useGeminiImageGeneration';
import { toast } from 'sonner';

import SidebarForm from './components/SidebarForm';
import ResultArea from './components/ResultArea';
import AIPanel from './components/AIPanel';
import AgentSelector from './components/AgentSelector';
import AgentWorkspace from './components/AgentWorkspace';

// Mapear cameraShot → shotType do hook
const SHOT_MAP: Record<string, string> = {
  'close-up': 'CLOSE_UP',
  'medium': 'MEDIUM',
  'american': 'AMERICAN',
};

// Mapear formato → dimension
const FORMAT_DIM: Record<string, string> = {
  'stories': '1080x1920',
  'feed_square': '1080x1080',
  'feed_portrait': '1080x1350',
  'horizontal_16_9': '2752x1536',
};

export default function GeradorTeste2026() {
  const navigate = useNavigate();
  const [activeAgent, setActiveAgent] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [finalPrompt, setFinalPrompt] = useState<string>('');
  const [showAI, setShowAI] = useState(false);
  const [format, setFormat] = useState('stories');

  // Hook real com API Gemini (busca key do Supabase automaticamente)
  const { generate, isGenerating, progress } = useGeminiImageGeneration();

  const [state, setState] = useState<GeneratorState>({
    subjectPosition: 'center',
    subjectDescription: '',
    niche: '',
    sceneDescription: '',
    textPosition: 'align-left',
    hasText: false,
    ambientColor: '#1a1a2e',
    complementaryLight: '#e2e2e2',
    highlightColor: '#7C3AED',
    cameraShot: 'medium',
    floatingElements: '',
    visualStyle: 'ultra_realistic',
    sobriety: 50,
    additionalPrompt: '',
  });

  const updateState = (key: keyof GeneratorState, value: any) => {
    setState(prev => ({ ...prev, [key]: value }));
  };

  const handleGenerate = async () => {
    if (!state.niche) {
      toast.error('Preencha o campo Nicho/Projeto!');
      return;
    }

    setResultImage(null);

    // Monta o config no formato que o hook espera
    const config: GenerationConfig = {
      niche: state.niche,
      gender: 'Não especificado',
      subjectDescription: state.subjectDescription || undefined,
      environment: state.sceneDescription || undefined,
      sobriety: state.sobriety,
      style: state.visualStyle,
      useStyle: !!state.visualStyle,
      colors: {
        ambient: state.ambientColor,
        rim: state.complementaryLight,
        complementary: state.highlightColor,
      },
      colorFlags: {
        ambient: true,
        rim: true,
        complementary: true,
      },
      ambientOpacity: 60,
      useBlur: false,
      useGradient: state.hasText,
      useFloatingElements: !!state.floatingElements,
      floatingElementsDescription: state.floatingElements || undefined,
      shotType: SHOT_MAP[state.cameraShot] || 'MEDIUM',
      additionalInstructions: state.additionalPrompt || undefined,
      dimension: FORMAT_DIM[format] || '1080x1920',
      safeAreaSide: state.subjectPosition === 'left' ? 'LEFT'
        : state.subjectPosition === 'right' ? 'RIGHT' : 'CENTER',
      personCount: 1,
    };

    try {
      const result = await generate(config, []);
      if (result?.imageBase64) {
        const src = `data:${result.mimeType || 'image/png'};base64,${result.imageBase64}`;
        setResultImage(src);
        if (result.finalPrompt) setFinalPrompt(result.finalPrompt);
        toast.success('🎨 Imagem gerada com sucesso!');
      } else {
        toast.error('A API não retornou uma imagem. Tente novamente.');
      }
    } catch (err: any) {
      console.error('[GeradorTeste2026] Erro:', err);
      toast.error(err?.message || 'Erro ao gerar imagem. Verifique a API key no painel de Provedores.');
    }
  };

  if (!activeAgent) {
    return <AgentSelector onSelectAgent={setActiveAgent} />;
  }

  // Agentes simples: abre workspace local sem construtor completo
  const FULL_BUILDER_AGENTS = ['orion', 'orion-pro'];
  if (!FULL_BUILDER_AGENTS.includes(activeAgent)) {
    return <AgentWorkspace agentId={activeAgent} onBack={() => setActiveAgent(null)} />;
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#080612] text-zinc-100" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── HEADER ── */}
      <header className="shrink-0 z-50 flex items-center justify-between px-5 py-3 border-b border-white/[0.06] bg-[#080612]/95 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveAgent(null)}
            title="Voltar para Agentes"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-white/[0.06] hover:text-zinc-200 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="h-4 w-px bg-white/[0.08]" />
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <span className="text-sm font-bold text-white">DesignBuilder Studio</span>
              <span className="ml-2 text-[10px] text-zinc-500">Motor IA v3.1 Pro</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Status de progresso da geração */}
          {isGenerating && progress && (
            <span className="text-xs text-violet-300 animate-pulse mr-2">{progress}</span>
          )}
          <button
            onClick={() => setShowAI(s => !s)}
            className={`flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-medium transition-all border ${
              showAI
                ? 'bg-violet-500/20 text-violet-300 border-violet-400/30'
                : 'text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-200 border-white/[0.06]'
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Assistente IA
          </button>
        </div>
      </header>

      {/* ── LAYOUT PRINCIPAL ── */}
      <div className="flex flex-1 overflow-hidden">

        <aside className="w-[480px] shrink-0 overflow-hidden border-r border-white/[0.06] bg-[#09090e]">
          <SidebarForm
            state={state}
            updateState={updateState}
            isGenerating={isGenerating}
            onGenerate={handleGenerate}
          />
        </aside>

        <main className="flex-1 overflow-hidden relative"
          style={{ background: 'linear-gradient(135deg, #080612, #0d0520)' }}>
          <ResultArea
            isGenerating={isGenerating}
            resultImage={resultImage}
            finalPrompt={finalPrompt}
            onGenerate={handleGenerate}
            niche={state.niche}
          />
        </main>

        {showAI && (
          <aside className="w-[480px] shrink-0 overflow-hidden border-l border-white/[0.06]">
            <AIPanel onClose={() => setShowAI(false)} />
          </aside>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.2); border-radius: 9999px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(139,92,246,0.4); }
        input[type=range]::-webkit-slider-thumb {
          appearance: none; width: 14px; height: 14px; border-radius: 50%;
          background: #a855f7; cursor: pointer; box-shadow: 0 0 8px #a855f766;
        }
      `}</style>
    </div>
  );
}
