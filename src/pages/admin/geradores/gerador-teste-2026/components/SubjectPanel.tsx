import React from 'react';
import { GeneratorState } from '@/lib/designbuilder-prompts';
import { User, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

interface Props {
  state: GeneratorState;
  updateState: (key: keyof GeneratorState, value: any) => void;
}

export default function SubjectPanel({ state, updateState }: Props) {
  return (
    <div className="bg-[#121214] p-6 rounded-2xl border border-white/5 shadow-2xl">
      <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
        <User className="w-4 h-4 text-purple-500" />
        <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400">O Sujeito</h3>
      </div>
      
      <div className="space-y-6">
        
        {/* Posição do Sujeito em Grid UI */}
        <div className="space-y-3">
          <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Posição do Sujeito</label>
          <div className="grid grid-cols-3 gap-3">
            <button 
              onClick={() => updateState('subjectPosition', 'left')}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${state.subjectPosition === 'left' ? 'bg-purple-600/10 border-purple-500 text-purple-400' : 'bg-black/20 border-white/5 text-zinc-500 hover:border-white/20 hover:text-zinc-300'}`}
            >
              <AlignLeft className="w-6 h-6 mb-2" />
              <span className="text-xs font-semibold">Esquerda</span>
            </button>
            <button 
              onClick={() => updateState('subjectPosition', 'center')}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${state.subjectPosition === 'center' ? 'bg-purple-600/10 border-purple-500 text-purple-400' : 'bg-black/20 border-white/5 text-zinc-500 hover:border-white/20 hover:text-zinc-300'}`}
            >
              <AlignCenter className="w-6 h-6 mb-2" />
              <span className="text-xs font-semibold">Centro</span>
            </button>
            <button 
              onClick={() => updateState('subjectPosition', 'right')}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${state.subjectPosition === 'right' ? 'bg-purple-600/10 border-purple-500 text-purple-400' : 'bg-black/20 border-white/5 text-zinc-500 hover:border-white/20 hover:text-zinc-300'}`}
            >
              <AlignRight className="w-6 h-6 mb-2" />
              <span className="text-xs font-semibold">Direita</span>
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Descrição do Sujeito</label>
          <textarea 
            placeholder="Ex: Mulher 30 anos, blazer branco..." 
            rows={2}
            value={state.subjectDescription}
            onChange={(e) => updateState('subjectDescription', e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all text-white placeholder:text-zinc-700 resize-none"
          />
        </div>

        {/* Plano de câmera em dropdown style escuro */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Enquadramento (Câmera)</label>
          <select 
            value={state.cameraShot}
            onChange={(e) => updateState('cameraShot', e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all text-white appearance-none cursor-pointer"
          >
            <option value="close-up">Close-up (Rosto)</option>
            <option value="medium">Plano Médio (Busto)</option>
            <option value="american">Plano Americano (Dos joelhos pra cima)</option>
          </select>
        </div>

      </div>
    </div>
  );
}
