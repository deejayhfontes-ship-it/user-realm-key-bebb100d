import React from 'react';
import { Image as ImageIcon, Wand2, Download } from 'lucide-react';

interface Props {
  isGenerating: boolean;
  resultImage: string | null;
  onGenerate: () => void;
}

export default function PreviewPanel({ isGenerating, resultImage, onGenerate }: Props) {
  return (
    <div className="bg-[#121214] p-4 rounded-3xl border border-white/5 shadow-2xl flex flex-col h-[700px]">
      
      {/* Área de Visualização */}
      <div className="flex-1 relative rounded-2xl overflow-hidden bg-black/40 border border-white/5 flex items-center justify-center">
        {resultImage ? (
          <div className="absolute inset-0 group">
            <img 
              src={resultImage} 
              alt="Resultado gerado" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
            />
            {/* Overlay para download */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
              <button className="w-full h-12 bg-white text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors">
                <Download className="w-4 h-4" />
                Baixar Alta Resolução
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-zinc-600 p-8 text-center">
            <div className="w-20 h-20 rounded-full border border-white/5 bg-black/20 flex items-center justify-center mb-6 shadow-inner">
              <ImageIcon className="w-8 h-8 opacity-40" />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-2">Preview 8K</h3>
            <p className="text-xs text-zinc-600 max-w-[250px]">
              A imagem renderizada aparecerá aqui. Configure os painéis ao lado.
            </p>
          </div>
        )}

        {/* Loader Overlays */}
        {isGenerating && (
          <div className="absolute inset-0 bg-[#121214]/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
            <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mb-4" />
            <div className="text-xs font-bold uppercase tracking-widest text-purple-400 animate-pulse">
              Processando IA...
            </div>
          </div>
        )}
      </div>

      {/* Botão de Ação */}
      <div className="mt-4 pt-4 border-t border-white/5">
        <button 
          onClick={onGenerate}
          disabled={isGenerating}
          className="w-full h-16 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-2xl flex items-center justify-center gap-3 transition-all shadow-[0_0_30px_-5px_rgba(147,51,234,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Wand2 className="w-5 h-5" />
          <span className="text-sm uppercase tracking-widest">
            {isGenerating ? 'Gerando...' : 'Gerar Imagem'}
          </span>
        </button>
      </div>
    </div>
  );
}
