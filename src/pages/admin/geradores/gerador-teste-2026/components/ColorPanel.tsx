import React from 'react';
import { GeneratorState } from '@/lib/designbuilder-prompts';
import { Palette } from 'lucide-react';

interface Props {
  state: GeneratorState;
  updateState: (key: keyof GeneratorState, value: any) => void;
}

export default function ColorPanel({ state, updateState }: Props) {
  return (
    <div className="bg-[#121214] p-6 rounded-2xl border border-white/5 shadow-2xl">
      <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
        <Palette className="w-4 h-4 text-purple-500" />
        <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Paleta de Cores</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Cor Ambiente */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">Ambiente</label>
          <div className="flex gap-2">
            <input 
              type="color" 
              value={state.ambientColor}
              onChange={(e) => updateState('ambientColor', e.target.value)}
              className="w-10 h-10 p-0 border-0 rounded overflow-hidden cursor-pointer bg-transparent"
            />
            <input 
              type="text" 
              value={state.ambientColor}
              onChange={(e) => updateState('ambientColor', e.target.value)}
              className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 text-xs uppercase font-mono outline-none text-white focus:border-purple-500/50"
            />
          </div>
        </div>

        {/* Luz Complementar */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">Rim Light</label>
          <div className="flex gap-2">
            <input 
              type="color" 
              value={state.complementaryLight}
              onChange={(e) => updateState('complementaryLight', e.target.value)}
              className="w-10 h-10 p-0 border-0 rounded overflow-hidden cursor-pointer bg-transparent"
            />
            <input 
              type="text" 
              value={state.complementaryLight}
              onChange={(e) => updateState('complementaryLight', e.target.value)}
              className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 text-xs uppercase font-mono outline-none text-white focus:border-purple-500/50"
            />
          </div>
        </div>

        {/* Cor Destaque */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">Destaque</label>
          <div className="flex gap-2">
            <input 
              type="color" 
              value={state.highlightColor}
              onChange={(e) => updateState('highlightColor', e.target.value)}
              className="w-10 h-10 p-0 border-0 rounded overflow-hidden cursor-pointer bg-transparent"
            />
            <input 
              type="text" 
              value={state.highlightColor}
              onChange={(e) => updateState('highlightColor', e.target.value)}
              className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 text-xs uppercase font-mono outline-none text-white focus:border-purple-500/50"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
