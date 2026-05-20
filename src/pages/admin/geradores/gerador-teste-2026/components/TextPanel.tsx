import React from 'react';
import { GeneratorState } from '@/lib/designbuilder-prompts';
import { Type, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

interface Props {
  state: GeneratorState;
  updateState: (key: keyof GeneratorState, value: any) => void;
}

export default function TextPanel({ state, updateState }: Props) {
  return (
    <div className="bg-[#121214] p-6 rounded-2xl border border-white/5 shadow-2xl">
      <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
        <Type className="w-4 h-4 text-purple-500" />
        <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Configuração de Texto</h3>
      </div>
      
      <div className="space-y-6">
        
        {/* Toggle Customizado Dark Mode */}
        <div className="flex items-center justify-between bg-black/20 p-4 rounded-xl border border-white/5">
          <div>
            <div className="text-sm font-semibold text-white">Preparar Negative Space</div>
            <div className="text-xs text-zinc-500 mt-1">Limpa uma área da arte para você inserir texto.</div>
          </div>
          <button 
            onClick={() => updateState('hasText', !state.hasText)}
            className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${state.hasText ? 'bg-purple-600' : 'bg-white/10'}`}
          >
            <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 ${state.hasText ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>

        {state.hasText && (
          <div className="space-y-3 animate-in fade-in slide-in-from-top-4">
            <label className="text-[11px] font-bold uppercase tracking-wider text-purple-400">Onde vai ficar o texto?</label>
            <div className="grid grid-cols-3 gap-3">
              <button 
                onClick={() => updateState('textPosition', 'align-left')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${state.textPosition === 'align-left' ? 'bg-purple-600/20 border-purple-500/50 text-purple-300' : 'bg-black/40 border-white/5 text-zinc-500'}`}
              >
                <AlignLeft className="w-5 h-5 mb-1" />
                <span className="text-[10px] font-semibold uppercase">Esquerda</span>
              </button>
              <button 
                onClick={() => updateState('textPosition', 'align-center')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${state.textPosition === 'align-center' ? 'bg-purple-600/20 border-purple-500/50 text-purple-300' : 'bg-black/40 border-white/5 text-zinc-500'}`}
              >
                <AlignCenter className="w-5 h-5 mb-1" />
                <span className="text-[10px] font-semibold uppercase">Centro</span>
              </button>
              <button 
                onClick={() => updateState('textPosition', 'align-right')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${state.textPosition === 'align-right' ? 'bg-purple-600/20 border-purple-500/50 text-purple-300' : 'bg-black/40 border-white/5 text-zinc-500'}`}
              >
                <AlignRight className="w-5 h-5 mb-1" />
                <span className="text-[10px] font-semibold uppercase">Direita</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
