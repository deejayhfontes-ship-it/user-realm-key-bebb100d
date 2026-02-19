import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Send, Loader2, Bot, Sparkles, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GoogleGenAI } from '@google/genai';
import { supabase } from '@/integrations/supabase/client';

// ── Personas ──
const PERSONAS = [
    {
        id: 'prompt_architect',
        label: 'Prompt Architect',
        icon: Sparkles,
        color: 'violet',
        systemInstruction: `Você é o Prompt Architect — um especialista em criar prompts fotorrealistas para geração de imagens AI.

Seu papel:
- Ajudar o usuário a construir prompts profissionais para geração de imagens
- Extrair detalhes visuais de referências (pose, roupa, textura, iluminação, câmera)
- NUNCA extrair características físicas do rosto/corpo (gênero, cor de pele, cabelo)
- Sempre gerar prompts em INGLÊS para melhor performance
- Usar vocabulário de fotografia profissional (lente, abertura, ISO, iluminação)
- Incluir aspectos como: 8K, ultra-realistic, cinematic, commercial photography

Estrutura de prompt recomendada:
[SUJEITO] + [ROUPA/POSE] + [ILUMINAÇÃO] + [CÂMERA/LENTE] + [FUNDO] + [ESTILO] + [QUALITY TAGS]

Responda sempre em português do Brasil, mas gere prompts em inglês.`,
    },
    {
        id: 'creative_assistant',
        label: 'Creative Assistant',
        icon: Lightbulb,
        color: 'amber',
        systemInstruction: `Você é o Creative Assistant — um diretor de arte criativo especializado em composições visuais de alto impacto.

Seu papel:
- Brainstorm de cenários e composições para landing pages, anúncios e materiais visuais
- Sugerir paletas de cores, estilos de iluminação e atmosferas
- Recomendar enquadramentos e ângulos de câmera
- Propor conceitos visuais baseados no nicho do usuário
- Inspirar com referências de direção de arte moderna

Para cada sugestão, considere:
- Impacto visual e conversão
- Psicologia das cores
- Hierarquia visual
- Tendências de design 2025

Responda sempre em português do Brasil, seja criativo e inspirador.`,
    },
];

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
}

interface AIChatPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AIChatPanel({ isOpen, onClose }: AIChatPanelProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedPersona, setSelectedPersona] = useState(PERSONAS[0]);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    // Focus input when panel opens
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [isOpen]);

    const getApiKey = useCallback(async (): Promise<string> => {
        const { data } = await (supabase
            .from('ai_providers') as any)
            .select('api_key_encrypted, system_prompt')
            .eq('slug', 'designer-do-futuro')
            .eq('is_active', true)
            .limit(1)
            .single();

        if (data?.api_key_encrypted) return data.api_key_encrypted;

        if (data?.system_prompt) {
            try {
                const meta = JSON.parse(data.system_prompt);
                if (meta.api_keys?.[0]) return meta.api_keys[0];
            } catch { /* noop */ }
        }

        throw new Error('API key não configurada.');
    }, []);

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;
        const userMsg: ChatMessage = { role: 'user', content: input.trim(), timestamp: Date.now() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const apiKey = await getApiKey();
            const genAI = new GoogleGenAI({ apiKey });

            // Build conversation history for context
            const historyContents = [...messages, userMsg].map(m => m.content).join('\n');
            const fullPrompt = historyContents;

            const response = await genAI.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: fullPrompt,
                config: {
                    systemInstruction: selectedPersona.systemInstruction,
                },
            });

            const text = response.text || 'Desculpe, não consegui gerar uma resposta.';
            setMessages(prev => [...prev, { role: 'assistant', content: text.trim(), timestamp: Date.now() }]);
        } catch (err: any) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `❌ Erro: ${err.message || 'Falha na comunicação com a IA'}`,
                timestamp: Date.now(),
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed top-0 right-0 w-[450px] h-full bg-[#111111] border-l border-white/10 z-50 flex flex-col shadow-2xl animate-in slide-in-from-right-full duration-300">
            {/* Header */}
            <div className="h-[52px] border-b border-white/10 flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-violet-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Chat IA</span>
                </div>
                <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Persona Selector */}
            <div className="p-3 border-b border-white/5 flex gap-2">
                {PERSONAS.map(p => (
                    <button
                        key={p.id}
                        onClick={() => {
                            setSelectedPersona(p);
                            setMessages([]);
                        }}
                        className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${selectedPersona.id === p.id
                                ? p.color === 'violet'
                                    ? 'bg-violet-600/20 text-violet-400 border border-violet-500/30'
                                    : 'bg-amber-600/20 text-amber-400 border border-amber-500/30'
                                : 'bg-white/5 text-white/40 border border-white/5 hover:border-white/10'
                            }`}
                    >
                        <p.icon className="w-3.5 h-3.5" />
                        {p.label}
                    </button>
                ))}
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                    <div className="text-center mt-16 opacity-60">
                        <selectedPersona.icon className="w-10 h-10 mx-auto mb-3 text-white/20" />
                        <p className="text-[10px] font-bold uppercase tracking-wider text-white/25">
                            {selectedPersona.label}
                        </p>
                        <p className="text-[9px] text-white/15 mt-1">
                            {selectedPersona.id === 'prompt_architect'
                                ? 'Descreva o que precisa e eu monto o prompt perfeito'
                                : 'Me conte o nicho e eu sugiro composições incríveis'}
                        </p>
                    </div>
                )}
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${msg.role === 'user'
                                ? 'bg-violet-600 text-white rounded-br-sm'
                                : 'bg-white/5 text-white/80 border border-white/10 rounded-bl-sm'
                            }`}>
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white/5 border border-white/10 rounded-2xl rounded-bl-sm px-4 py-3">
                            <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />
                        </div>
                    </div>
                )}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-white/10">
                <div className="flex gap-2">
                    <textarea
                        ref={inputRef}
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Digite sua mensagem..."
                        rows={2}
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white resize-none outline-none placeholder:text-white/30 focus:border-violet-500/50"
                    />
                    <Button
                        onClick={sendMessage}
                        disabled={!input.trim() || isLoading}
                        className="bg-violet-600 hover:bg-violet-500 text-white px-4 self-end rounded-xl"
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default AIChatPanel;
