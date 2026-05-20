import React from 'react';
import { GeneratorState } from '@/lib/designbuilder-prompts';
import { Layout } from 'lucide-react';

interface Props {
  state: GeneratorState;
  updateState: (key: keyof GeneratorState, value: any) => void;
}

export default function ContextPanel({ state, updateState }: Props) {
  return (
    <div className="bg-[#121214] p-6 rounded-2xl border border-white/5 shadow-2xl">
      <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
        <Layout className="w-4 h-4 text-purple-500" />
        <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Contexto do Projeto</h3>
      </div>
      
      <div className="space-y-5">
        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Nicho / Projeto <span className="text-red-500">*</span></label>
          <input 
            type="text"
            placeholder="Ex: Campanha Verão 2026..." 
            value={state.niche}
            onChange={(e) => updateState('niche', e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all text-white placeholder:text-zinc-700"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Cenário / Contexto</label>
          <textarea 
            placeholder="Descreva o ambiente físico, clima ou contexto onde a cena se passa..." 
            rows={3}
            value={state.sceneDescription}
            onChange={(e) => updateState('sceneDescription', e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all text-white placeholder:text-zinc-700 resize-none"
          />
        </div>
      </div>
    </div>
  );
}
