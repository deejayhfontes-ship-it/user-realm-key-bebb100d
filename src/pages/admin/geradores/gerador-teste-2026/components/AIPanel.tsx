import React, { useState, useRef, useCallback, useEffect } from 'react';
import { X, Paperclip, Send, Loader2, ImagePlus } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  image?: string;
  isLoading?: boolean;
  isError?: boolean;
}

interface Props {
  onClose: () => void;
}

export default function AIPanel({ onClose }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: '0',
    role: 'assistant',
    text: 'Olá! Sou seu assistente de design. Envie uma imagem de referência ou descreva o que quer criar e vou extrair um prompt otimizado para o gerador.',
  }]);
  const [input, setInput] = useState('');
  const [attachedImage, setAttachedImage] = useState<{ file: File; preview: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const dragCount = useRef(0);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  const addFiles = useCallback((files: FileList | File[]) => {
    const imgs = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (imgs.length > 0) {
      setAttachedImage({ file: imgs[0], preview: URL.createObjectURL(imgs[0]) });
    }
  }, []);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of Array.from(items)) {
      if (item.kind === 'file' && item.type.startsWith('image/')) {
        const f = item.getAsFile();
        if (f) { e.preventDefault(); addFiles([f]); break; }
      }
    }
  }, [addFiles]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() && !attachedImage) return;
    if (isProcessing) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input.trim(),
      image: attachedImage?.preview,
    };
    const loadingMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      text: '',
      isLoading: true,
    };

    setMessages(prev => [...prev, userMsg, loadingMsg]);
    const sentInput = input.trim();
    const hadImage = !!attachedImage;
    setInput('');
    setAttachedImage(null);
    setIsProcessing(true);

    await new Promise(r => setTimeout(r, 1800));

    const aiResponse = hadImage
      ? `Analisei sua imagem! Identifiquei:\n\n• **Estilo visual**: Fotografia publicitária premium\n• **Paleta**: Tons neutros com destaque vibrante\n• **Composição**: Regra dos terços, sujeito centralizado\n\nPrompt sugerido: *"${sentInput || 'Imagem publicitária com iluminação dramática, fundo desfocado, produto em destaque'}"*\n\nDeseja aplicar esse prompt ao gerador?`
      : `Entendi! Para criar "${sentInput}", sugiro:\n\n• **Estilo**: Fotografia editorial\n• **Iluminação**: Luz lateral suave\n• **Composição**: Ângulo 3/4 com fundo escuro\n\nPrompt otimizado pronto. 🎨`;

    setMessages(prev => prev.map(m =>
      m.isLoading ? { ...m, text: aiResponse, isLoading: false } : m
    ));
    setIsProcessing(false);
  }, [input, attachedImage, isProcessing]);

  return (
    <div className="flex h-full flex-col bg-[#08060f] border-l border-white/[0.06]">

      {/* Header */}
      <div className="shrink-0 flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-violet-400 animate-pulse" />
          <span className="text-sm font-semibold text-white">Assistente IA</span>
          <span className="rounded-full bg-violet-500/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-violet-300 border border-violet-500/20">Beta</span>
        </div>
        <button onClick={onClose} className="rounded-lg p-1.5 text-zinc-600 hover:bg-white/[0.06] hover:text-zinc-200 transition-all">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Messages */}
      <div ref={chatRef} className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
              msg.isError
                ? 'bg-red-500/10 border border-red-500/20 text-red-300'
                : msg.role === 'user'
                  ? 'bg-zinc-800 text-zinc-100 rounded-tr-none border border-white/5'
                  : 'bg-black/40 border border-violet-500/10 text-zinc-300 rounded-tl-none'
            }`}>
              {msg.image && (
                <img src={msg.image} alt="" className="rounded-lg mb-2.5 max-h-40 w-full object-cover border border-zinc-800" />
              )}
              {msg.isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '75ms' }} />
                    <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  </div>
                  <span className="text-xs text-violet-400 font-medium">Processando imagem...</span>
                </div>
              ) : (
                <p className="whitespace-pre-wrap">{msg.text}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Drag overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-50 bg-violet-500/10 border-4 border-dashed border-violet-400/50 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <ImagePlus className="h-10 w-10 text-violet-300 mx-auto mb-2 animate-pulse" />
            <p className="text-violet-200 font-semibold text-sm">Solte a imagem aqui</p>
          </div>
        </div>
      )}

      {/* Imagem anexada */}
      {attachedImage && (
        <div className="shrink-0 px-3 pt-2">
          <div className="relative inline-block">
            <img src={attachedImage.preview} alt="" className="h-14 w-14 rounded-xl object-cover border border-white/10" />
            <button
              onClick={() => setAttachedImage(null)}
              className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/90 text-white ring-1 ring-white/10"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <div
        className="shrink-0 p-3"
        onDragEnter={e => { e.preventDefault(); dragCount.current++; if (dragCount.current === 1) setIsDragging(true); }}
        onDragLeave={e => { e.preventDefault(); dragCount.current--; if (dragCount.current === 0) setIsDragging(false); }}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); dragCount.current = 0; setIsDragging(false); e.dataTransfer.files.length > 0 && addFiles(e.dataTransfer.files); }}
      >
        <div className="flex gap-2 rounded-[20px] p-2 border border-white/[0.06] bg-black/30 focus-within:border-violet-400/20 transition-all">
          <button
            onClick={() => fileRef.current?.click()}
            disabled={isProcessing}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-500/10 text-violet-300/80 transition-all hover:bg-violet-500/20 hover:text-violet-200 hover:scale-105"
          >
            <Paperclip className="h-[17px] w-[17px]" />
          </button>

          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            onPaste={handlePaste}
            placeholder="Envie uma imagem ou descreva o que criar..."
            disabled={isProcessing}
            rows={1}
            className="min-w-0 flex-1 resize-none bg-transparent px-1 text-[13px] text-zinc-100 outline-none placeholder-zinc-600 disabled:opacity-50 leading-relaxed"
            style={{ maxHeight: '80px' }}
          />

          <button
            onClick={sendMessage}
            disabled={(!input.trim() && !attachedImage) || isProcessing}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-600 text-white transition-all hover:bg-violet-500 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ boxShadow: (input.trim() || attachedImage) ? '0 0 12px rgba(139,92,246,0.4)' : undefined }}
          >
            {isProcessing
              ? <Loader2 className="h-[16px] w-[16px] animate-spin" />
              : <Send className="h-[16px] w-[16px]" />
            }
          </button>
        </div>
        <p className="mt-1.5 text-center text-[10px] text-zinc-700">
          Arraste, cole (Ctrl+V) ou faça upload de imagens
        </p>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={e => { e.target.files && addFiles(e.target.files); e.target.value = ''; }}
        />
      </div>
    </div>
  );
}
