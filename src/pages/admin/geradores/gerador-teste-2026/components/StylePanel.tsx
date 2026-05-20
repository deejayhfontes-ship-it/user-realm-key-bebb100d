import React from 'react';
import { GeneratorState } from '@/lib/designbuilder-prompts';
import { Sparkles, Palette } from 'lucide-react';

interface Props {
  state: GeneratorState;
  updateState: (key: keyof GeneratorState, value: any) => void;
}

const styles = [
  { id: 'ultra_realistic', label: 'Ultra Realista' },
  { id: 'pro_portrait', label: 'Retrato Pro' },
  { id: 'advertising', label: 'Publicitário' },
  { id: 'glassmorphism', label: 'Glassmorphism' },
  { id: 'minimalist', label: 'Minimalista' },
  { id: 'tech', label: 'Tecnológico' },
  { id: 'cartoon', label: 'Cartoon' },
  { id: 'gamer', label: 'Gamer' },
  { id: 'elegant', label: 'Elegante' }
];

export default function StylePanel({ state, updateState }: Props) {
  return (
    <div className="bg-[#121214] p-6 rounded-2xl border border-white/5 shadow-2xl">
      <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
        <Sparkles className="w-4 h-4 text-purple-500" />
        <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Composição & Estilo</h3>
      </div>
      
      <div className="space-y-8">
        
        {/* Slider de Sobriedade Customizado */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Sobriedade vs Criatividade</label>
            <span className="text-xs font-mono font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">{state.sobriety}</span>
          </div>
          
          <input 
            type="range"
            min="0"
            max="100"
            value={state.sobriety}
            onChange={(e) => updateState('sobriety', Number(e.target.value))}
            className="w-full accent-purple-600 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
          />
          
          <div className="flex justify-between text-[10px] uppercase font-bold text-zinc-600">
            <span>Criativo (0)</span>
            <span>Sóbrio (100)</span>
          </div>
        </div>

        {/* Grade de Estilos */}
        <div className="space-y-3">
          <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Estilo Visual</label>
          <div className="grid grid-cols-3 gap-2">
            {styles.map(s => (
              <button
                key={s.id}
                onClick={() => updateState('visualStyle', s.id)}
                className={`py-2 px-2 text-[10px] font-semibold uppercase rounded-lg border transition-all ${state.visualStyle === s.id ? 'bg-purple-600/20 border-purple-500 text-purple-300' : 'bg-black/40 border-white/5 text-zinc-500 hover:border-white/20'}`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Elementos Flutuantes?</label>
          <input 
            type="text"
            placeholder="Ex: Notas de dólar, pétalas, código matrix..." 
            value={state.floatingElements}
            onChange={(e) => updateState('floatingElements', e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all text-white placeholder:text-zinc-700"
          />
        </div>
      </div>
    </div>
  );
}
