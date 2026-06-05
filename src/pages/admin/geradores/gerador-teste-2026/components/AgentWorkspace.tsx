import React, { useState, useRef, useCallback } from 'react';
import {
  ArrowLeft, Upload, X, Copy, Check, Trash2, Loader2,
  Sparkles, ImageIcon, Download, RefreshCw, Zap, ChevronDown,
  AlertCircle
} from 'lucide-react';
import { AGENTS } from './AgentSelector';

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface FormData {
  nicho_projeto: string;
  subject_description: string;
  subject_position: 'left' | 'center' | 'right';
  scene_description: string;
  dimensions: '1:1' | '4:5' | '9:16' | '16:9';
  quality: '1K' | '2K' | '4K';
  estilo_visual: string;
  plano: 'close' | 'medium' | 'american';
  sobriedade_criatividade: number;
  prompt_adicional: string;
}

// ─── System Prompt Completo do Orion (extraído via engenharia reversa) ────────
function buildOrionPrompt(form: FormData, subjectFileName?: string): string {
  const visualStyleMap: Record<string, string> = {
    ultra_realistic: 'Ultra-realistic photographic quality. Hyperdetailed true-to-life photography with natural lighting and zero AI artifacts. Sharp focus across subject, natural skin texture with visible pores. No stylization, no filters — pure photorealism. Shot on medium-format digital camera. Cinematic lighting setup, volumetric lighting, dramatic shadows on face. 8k resolution, commercial photography aesthetic, shot on 85mm lens f/1.4.',
    classico: 'Classic editorial photography style. Timeless composition, balanced natural lighting, rich colors. Medium-format aesthetic with fine detail.',
    elegante: 'Elegant luxury photography. Refined lighting, sophisticated mood, premium brand aesthetic. Soft shadows, high contrast between subject and background.',
    institucional: 'Clean corporate photography. Professional lighting setup, neutral tones, authoritative composition. Trust-building visual language.',
    tecnologico: 'Futuristic tech aesthetic. Cool blue-purple tones, precision lighting, sharp edges. High-tech environment with digital atmosphere.',
    glassmorphism: 'Glassmorphism visual style. Frosted glass elements, depth layers, vibrant color gradients behind translucent surfaces. Ultra-modern UI feel.',
    minimalista: 'Minimalist photography. Maximum negative space, single focal point, monochromatic or duotone palette. Clean and uncluttered composition.',
  };

  const positionMap: Record<string, string> = {
    left: 'Place the PRIMARY SUBJECT\'s vertical centerline at exactly the 25% horizontal mark of the canvas (left side). Leave right side open for text.',
    center: 'Place the PRIMARY SUBJECT\'s vertical centerline at exactly the 50% horizontal mark of the canvas (the geometric center). The primary subject must be the unambiguous focal point.',
    right: 'Place the PRIMARY SUBJECT\'s vertical centerline at exactly the 75% horizontal mark of the canvas (right side). Leave left side open for text.',
  };

  const dimensionsMap: Record<string, string> = {
    '1:1': 'format 1080x1080',
    '4:5': 'format 1080x1350 (VERTICAL POSTER FORMAT)',
    '9:16': 'format 1080x1920 (STORY/REELS FORMAT)',
    '16:9': 'format 1920x1080 (LANDSCAPE/BANNER FORMAT)',
  };

  const planoMap: Record<string, string> = {
    close: 'close-up portrait (face and shoulders only, tight framing)',
    medium: 'medium shot (waist up, balanced composition)',
    american: 'american shot (knees up, full context visible)',
  };

  const sobrietyNote = form.sobriedade_criatividade > 70
    ? 'LIGHTING DIRECTIVE: Professional daylight setup. Clean, neutral tones. Corporate and polished. Avoid dramatic shadows.'
    : form.sobriedade_criatividade < 30
    ? 'LIGHTING DIRECTIVE: Dramatic cinematic lighting. High contrast, strong shadows. Creative and bold color grading. Vibrant atmosphere.'
    : 'LIGHTING DIRECTIVE: Balanced cinematic setup. Volumetric lighting, natural yet dramatic shadows.';

  const visualStyle = visualStyleMap[form.estilo_visual] || visualStyleMap['ultra_realistic'];
  const canvasRule = form.dimensions === '9:16' || form.dimensions === '4:5'
    ? `CANVAS RULE: This image must be composed as a VERTICAL POSTER FORMAT. The intended view area is ${form.dimensions === '9:16' ? '1080x1920' : '1080x1350'}. Center all critical action and the subject's face vertically so they are not cut off.`
    : `CANVAS RULE: Compose for ${dimensionsMap[form.dimensions]} format. Ensure subject is well-framed with appropriate breathing room.`;

  return `=== TOP PRIORITY COMPOSITION RULE — READ FIRST, APPLY ABSOLUTELY ===
SUBJECT POSITION (MANDATORY — overrides any other composition instruction): ${positionMap[form.subject_position]}
Background elements, props, and atmosphere must be balanced around the primary subject.
=== END TOP PRIORITY ===

Create an 8K ultra-realistic cinematic ${planoMap[form.plano]}, ${dimensionsMap[form.dimensions]}, perfectly replicating the subject's physical traits, facial expression, and overall look from the reference image${form.subject_description ? `, ${form.subject_description}` : ''}, VISUAL STYLE: ${visualStyle}

${form.scene_description ? `SCENE & CONTEXT: ${form.scene_description}\n\n` : ''}USER INPUT LOCK (HIGHEST PRIORITY — these are the user's literal inputs; if any instruction earlier in the prompt contradicts these values, IGNORE the earlier one and follow these EXACTLY):
  • SUBJECT APPEARANCE & POSE (apply EVERY DETAIL VERBATIM, do not paraphrase, do not omit): "${form.subject_description || 'person'}"
  • NICHE / PROJECT (anchors composition, attire, props, environment): "${form.nicho_projeto}"

${sobrietyNote}

SAFE AREA RULE: Maintain breathing room of at least 10% of the canvas width on both sides of the subject. The subject must NOT be clipped or touch any extreme edge.

NO TEXT INSTRUCTION (CRITICAL — STRICT NEGATIVE CONSTRAINT):
The output image must be COMPLETELY FREE of any text, letters, numbers, logos, watermarks, brand names, headlines, subtitles, captions, labels, typography, handwriting, signatures, or any typographic element whatsoever.
If the reference style suggests a layout that typically contains text, reproduce the VISUAL STYLE ONLY — lighting, color, composition, materials, mood — WITHOUT any text element.

${canvasRule}

PHOTOREALISTIC QUALITY DIRECTIVES (apply to every generation):

Skin & facial realism:
- Visible pores in T-zone and cheeks
- Natural skin texture with authentic grain
- Fine vellus hair visible in raking light
- Slight facial asymmetry, no perfect symmetry
- Organic and slightly imprecise catchlights
- No beauty filter, no digital retouching
- Natural skin tone variation (light blemishes, subtle redness)

Lens optics simulation:
- 85mm f/1.4 at subject distance 1.2m
- Focus plane: eyes sharp, ear tip soft
- Bokeh: circular highlights with slight cat-eye distortion at edges
- Focus breathing: foreground elements slightly compressed
- Chromatic aberration: subtle purple fringe at high-contrast edges
- No diffraction artifacts (clean f/1.4 rendering)

Film emulsion simulation:
- Kodak Portra 400 response: grain visible in shadows, creamy in highlights
- Grain structure: organic, not uniform — varies by luminance zone
- Slight halation around light sources (emulsion bloom)
- Color response: reds slightly desaturated, greens slightly shifted
- Shadow detail: crushed but not clipped (separation preserved)
- Matte finish: no digital sharpness in highlights

Environmental imperfections:
- Window glass: slight distortion and texture (not perfect flat pane)
- Walls: paint variation, subtle scuffs at contact points
- Floor: wear pattern consistent with foot traffic paths
- Objects: dust accumulation on horizontal surfaces
- Air: slight atmospheric haze in deep background (humidity scatter)
- Surface details: ring marks, micro-scratches on tables${form.prompt_adicional ? `\n\nADDITIONAL DIRECTIVES (user-specified — apply these on top of everything above):\n${form.prompt_adicional}` : ''}`;
}

// ─── Constantes ───────────────────────────────────────────────────────────────
const ESTILOS = [
  { id: 'ultra_realistic', label: 'Ultra Realista' },
  { id: 'classico', label: 'Clássico' },
  { id: 'elegante', label: 'Elegante' },
  { id: 'institucional', label: 'Institucional' },
  { id: 'tecnologico', label: 'Tecnológico' },
  { id: 'glassmorphism', label: 'Glassmorphism' },
  { id: 'minimalista', label: 'Minimalista' },
];

const DIMENSOES = [
  { id: '1:1', label: 'Feed', sub: '1:1' },
  { id: '4:5', label: 'Post', sub: '4:5' },
  { id: '9:16', label: 'Story', sub: '9:16' },
  { id: '16:9', label: 'Banner', sub: '16:9' },
];

const PLANOS = [
  { id: 'close', label: 'Close', desc: 'Rosto/Busto' },
  { id: 'medium', label: 'Médio', desc: 'Cintura acima' },
  { id: 'american', label: 'Americano', desc: 'Joelhos acima' },
];

const POSICOES = [
  { id: 'left', label: '← Esquerda', desc: 'Abre espaço direito' },
  { id: 'center', label: '• Centro', desc: 'Padrão centralizado' },
  { id: 'right', label: 'Direita →', desc: 'Abre espaço esquerdo' },
];

// ─── Componente Principal ─────────────────────────────────────────────────────
interface AgentWorkspaceProps {
  agentId: string;
  onBack: () => void;
}

export default function AgentWorkspace({ agentId, onBack }: AgentWorkspaceProps) {
  const agent = AGENTS.find(a => a.id === agentId);

  // Form state
  const [form, setForm] = useState<FormData>({
    nicho_projeto: '',
    subject_description: '',
    subject_position: 'center',
    scene_description: '',
    dimensions: '4:5',
    quality: '1K',
    estilo_visual: 'ultra_realistic',
    plano: 'medium',
    sobriedade_criatividade: 50,
    prompt_adicional: '',
  });

  // Files
  const [subjectFile, setSubjectFile] = useState<File | null>(null);
  const [subjectPreview, setSubjectPreview] = useState<string | null>(null);
  const subjectRef = useRef<HTMLInputElement>(null);

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);

  if (!agent) return null;
  const Icon = agent.icon;
  const accent = agent.accentColor;

  // Helpers
  const updateForm = (key: keyof FormData, value: any) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleSubjectUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSubjectFile(file);
    const reader = new FileReader();
    reader.onload = ev => setSubjectPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleGenerate = useCallback(async () => {
    if (!form.nicho_projeto.trim()) {
      setError('Preencha o campo Nicho/Projeto');
      return;
    }
    setError(null);
    setIsGenerating(true);
    setGeneratedPrompt('');
    setGeneratedImage(null);

    const prompt = buildOrionPrompt(form, subjectFile?.name);
    setGeneratedPrompt(prompt);

    // Se não tiver API key, apenas mostra o prompt
    if (!apiKey.trim()) {
      setStatus('Prompt gerado! Configure sua API key do Google AI Studio para gerar imagens.');
      setIsGenerating(false);
      return;
    }

    try {
      setStatus('Enviando para Gemini...');

      // Montar parts do request
      const parts: any[] = [{ text: prompt }];

      // Se tiver foto do sujeito, incluir como inlineData
      if (subjectFile && subjectPreview) {
        const base64 = subjectPreview.split(',')[1];
        const mimeType = subjectFile.type || 'image/jpeg';
        parts.unshift({
          inlineData: { mimeType, data: base64 }
        });
      }

      setStatus('Gerando imagem com Gemini 2.0 Flash...');

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts }],
            generationConfig: {
              responseModalities: ['IMAGE', 'TEXT'],
              temperature: 0.9,
            },
          }),
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`API Error ${response.status}: ${errText.substring(0, 200)}`);
      }

      const data = await response.json();
      const candidate = data.candidates?.[0];
      const imagePart = candidate?.content?.parts?.find((p: any) => p.inlineData?.mimeType?.startsWith('image/'));

      if (imagePart?.inlineData?.data) {
        const src = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
        setGeneratedImage(src);
        setStatus('Imagem gerada com sucesso!');
      } else {
        throw new Error('Nenhuma imagem na resposta. Verifique o modelo/API key.');
      }
    } catch (err: any) {
      setError(err.message || 'Erro desconhecido na geração.');
      setStatus('');
    } finally {
      setIsGenerating(false);
    }
  }, [form, subjectFile, subjectPreview, apiKey]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    const a = document.createElement('a');
    a.href = generatedImage;
    a.download = `orion-${Date.now()}.png`;
    a.click();
  };

  const handleClear = () => {
    setForm({ nicho_projeto: '', subject_description: '', subject_position: 'center', scene_description: '', dimensions: '4:5', quality: '1K', estilo_visual: 'ultra_realistic', plano: 'medium', sobriedade_criatividade: 50, prompt_adicional: '' });
    setSubjectFile(null); setSubjectPreview(null);
    setGeneratedPrompt(''); setGeneratedImage(null);
    setError(null); setStatus('');
  };

  const canGenerate = form.nicho_projeto.trim().length > 0;

  return (
    <div
      className="w-full min-h-screen flex flex-col text-white relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #08080e 0%, #0a0812 60%, #080810 100%)' }}
    >
      {/* Glow */}
      <div className="absolute top-0 left-0 w-[50%] h-[40%] rounded-full blur-[160px] pointer-events-none" style={{ background: `radial-gradient(ellipse, ${agent.glowColor}, transparent)` }} />

      {/* Header */}
      <header className="shrink-0 z-50 flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(8,8,14,0.92)', backdropFilter: 'blur(12px)' }}>
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition-all hover:bg-white/[0.06] hover:text-zinc-200">
            <ArrowLeft size={16} />
          </button>
          <div className="h-4 w-px bg-white/[0.08]" />
          <div className="p-2 rounded-lg" style={{ background: `${accent}20`, color: accent }}>
            <Icon size={18} />
          </div>
          <div>
            <span className="text-sm font-semibold text-white">{agent.name}</span>
            <span className="ml-2 text-[10px] font-semibold uppercase tracking-widest" style={{ color: accent }}>{agent.category}</span>
          </div>
          {agent.badge && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/20">{agent.badge}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowApiKey(v => !v)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04] transition-all" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
            <Zap size={12} /> {apiKey ? '🔑 API OK' : 'API Key'}
          </button>
          <button onClick={handleClear} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04] transition-all">
            <Trash2 size={12} /> Limpar
          </button>
        </div>
      </header>

      {/* API Key banner */}
      {showApiKey && (
        <div className="z-40 px-6 py-3 border-b flex items-center gap-3" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(124,58,237,0.08)' }}>
          <Zap size={14} style={{ color: accent }} />
          <input
            type="password"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            placeholder="Cole aqui sua Google AI Studio API Key (AIza...)"
            className="flex-1 bg-transparent text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none"
          />
          {apiKey && <span className="text-xs text-emerald-400">✓ Configurada</span>}
          <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-xs text-zinc-600 hover:text-zinc-400 underline">Obter key gratuita →</a>
        </div>
      )}

      {/* Layout principal */}
      <div className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-0 h-[calc(100vh-60px)]">

        {/* Sidebar — Formulário */}
        <div className="border-r overflow-y-auto flex flex-col gap-0" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>

          {/* Foto do Sujeito */}
          <section className="p-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
              📸 Foto do Sujeito / Produto <span className="text-red-400">*</span>
            </label>
            {subjectPreview ? (
              <div className="relative rounded-xl overflow-hidden border" style={{ borderColor: `${accent}30` }}>
                <img src={subjectPreview} alt="Sujeito" className="w-full h-40 object-cover" />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <button onClick={() => { setSubjectFile(null); setSubjectPreview(null); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/80 text-white text-xs">
                    <X size={12} /> Remover
                  </button>
                </div>
                <div className="px-3 py-2 text-xs text-zinc-400 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.3)' }}>
                  ✓ {subjectFile?.name}
                </div>
              </div>
            ) : (
              <button onClick={() => subjectRef.current?.click()} className="w-full flex flex-col items-center gap-2 py-8 rounded-xl border-2 border-dashed transition-all hover:border-opacity-60 group" style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = `${accent}50`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}>
                <ImageIcon size={24} className="text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                <span className="text-sm text-zinc-500 group-hover:text-zinc-300 transition-colors">Clique ou arraste a foto</span>
                <span className="text-[11px] text-zinc-700">JPG, PNG, WEBP · máx 5MB</span>
              </button>
            )}
            <input ref={subjectRef} type="file" accept="image/*" className="hidden" onChange={handleSubjectUpload} />
          </section>

          {/* Nicho/Projeto */}
          <section className="p-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              🎯 Nicho / Projeto <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.nicho_projeto}
              onChange={e => updateForm('nicho_projeto', e.target.value)}
              placeholder="ex: Dentista Premium, Campanha Verão 2026..."
              className="w-full rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none transition-all"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              onFocus={e => { e.currentTarget.style.borderColor = `${accent}60`; }}
              onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
            />
          </section>

          {/* Descrição do Sujeito */}
          <section className="p-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              👤 Descrição do Sujeito
            </label>
            <textarea
              value={form.subject_description}
              onChange={e => updateForm('subject_description', e.target.value)}
              placeholder="Descreva a aparência, roupas, pose... Ex: Mulher dentista, jaleco branco, sorrindo, 30 anos"
              rows={3}
              className="w-full rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 resize-none focus:outline-none transition-all"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              onFocus={e => { e.currentTarget.style.borderColor = `${accent}60`; }}
              onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
            />
          </section>

          {/* Cenário */}
          <section className="p-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              🌆 Cenário / Contexto
            </label>
            <textarea
              value={form.scene_description}
              onChange={e => updateForm('scene_description', e.target.value)}
              placeholder="Descreva o ambiente... Ex: Consultório odontológico moderno, iluminação natural, equipamentos ao fundo"
              rows={3}
              className="w-full rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 resize-none focus:outline-none transition-all"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              onFocus={e => { e.currentTarget.style.borderColor = `${accent}60`; }}
              onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
            />
          </section>

          {/* Posição do Sujeito */}
          <section className="p-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Posição do Sujeito</label>
            <div className="grid grid-cols-3 gap-2">
              {POSICOES.map(p => (
                <button key={p.id} onClick={() => updateForm('subject_position', p.id)}
                  className="flex flex-col items-center py-2.5 px-2 rounded-xl text-center transition-all"
                  style={{ background: form.subject_position === p.id ? `${accent}18` : 'rgba(255,255,255,0.03)', border: `1px solid ${form.subject_position === p.id ? accent + '55' : 'rgba(255,255,255,0.06)'}`, color: form.subject_position === p.id ? accent : '#71717a' }}>
                  <span className="text-xs font-semibold">{p.label}</span>
                  <span className="text-[9px] mt-0.5 opacity-70">{p.desc}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Dimensões + Qualidade */}
          <section className="p-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Dimensões</label>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {DIMENSOES.map(d => (
                <button key={d.id} onClick={() => updateForm('dimensions', d.id)}
                  className="flex flex-col items-center py-2.5 rounded-xl text-center transition-all"
                  style={{ background: form.dimensions === d.id ? `${accent}18` : 'rgba(255,255,255,0.03)', border: `1px solid ${form.dimensions === d.id ? accent + '55' : 'rgba(255,255,255,0.06)'}`, color: form.dimensions === d.id ? accent : '#71717a' }}>
                  <span className="text-xs font-semibold">{d.label}</span>
                  <span className="text-[10px] mt-0.5 opacity-70">{d.sub}</span>
                </button>
              ))}
            </div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Qualidade</label>
            <div className="grid grid-cols-3 gap-2">
              {(['1K', '2K', '4K'] as const).map(q => (
                <button key={q} onClick={() => updateForm('quality', q)}
                  className="py-2 rounded-xl text-xs font-semibold transition-all"
                  style={{ background: form.quality === q ? `${accent}18` : 'rgba(255,255,255,0.03)', border: `1px solid ${form.quality === q ? accent + '55' : 'rgba(255,255,255,0.06)'}`, color: form.quality === q ? accent : '#71717a' }}>
                  {q}
                </button>
              ))}
            </div>
          </section>

          {/* Plano + Estilo Visual */}
          <section className="p-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Plano de Câmera</label>
            <div className="grid grid-cols-3 gap-2 mb-5">
              {PLANOS.map(p => (
                <button key={p.id} onClick={() => updateForm('plano', p.id)}
                  className="flex flex-col items-center py-2.5 rounded-xl text-center transition-all"
                  style={{ background: form.plano === p.id ? `${accent}18` : 'rgba(255,255,255,0.03)', border: `1px solid ${form.plano === p.id ? accent + '55' : 'rgba(255,255,255,0.06)'}`, color: form.plano === p.id ? accent : '#71717a' }}>
                  <span className="text-xs font-semibold">{p.label}</span>
                  <span className="text-[9px] mt-0.5 opacity-70">{p.desc}</span>
                </button>
              ))}
            </div>

            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Estilo Visual</label>
            <div className="grid grid-cols-2 gap-2">
              {ESTILOS.map(e => (
                <button key={e.id} onClick={() => updateForm('estilo_visual', e.id)}
                  className="py-2 px-3 rounded-xl text-xs font-medium text-left transition-all"
                  style={{ background: form.estilo_visual === e.id ? `${accent}18` : 'rgba(255,255,255,0.03)', border: `1px solid ${form.estilo_visual === e.id ? accent + '55' : 'rgba(255,255,255,0.06)'}`, color: form.estilo_visual === e.id ? accent : '#71717a' }}>
                  {e.label}
                </button>
              ))}
            </div>
          </section>

          {/* Sobriedade */}
          <section className="p-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Estilo da Imagem</label>
              <span className="text-xs text-zinc-400">{form.sobriedade_criatividade}%</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-zinc-500 w-16">Criativo</span>
              <input type="range" min={0} max={100} value={form.sobriedade_criatividade}
                onChange={e => updateForm('sobriedade_criatividade', Number(e.target.value))}
                className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer"
                style={{ accentColor: accent }} />
              <span className="text-xs text-zinc-500 w-12 text-right">Sóbrio</span>
            </div>
            <div className="mt-2 text-[11px] text-zinc-600 text-center">
              {form.sobriedade_criatividade > 70 ? '🏢 Corporativo, clean, profissional' : form.sobriedade_criatividade < 30 ? '🎨 Criativo, vibrante, cinematográfico' : '⚡ Balanceado — cinematic com elegância'}
            </div>
          </section>

          {/* Prompt adicional */}
          <section className="p-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              ✨ Prompt Adicional <span className="text-zinc-600 font-normal">(opcional)</span>
            </label>
            <textarea
              value={form.prompt_adicional}
              onChange={e => updateForm('prompt_adicional', e.target.value)}
              placeholder="Adicione detalhes extras ao prompt automático..."
              rows={2}
              className="w-full rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 resize-none focus:outline-none transition-all"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              onFocus={e => { e.currentTarget.style.borderColor = `${accent}60`; }}
              onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
            />
          </section>

          {/* Botão Gerar */}
          <div className="p-5">
            {error && (
              <div className="flex items-center gap-2 mb-3 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                <AlertCircle size={12} /> {error}
              </div>
            )}
            <button onClick={handleGenerate} disabled={!canGenerate || isGenerating}
              className="w-full flex items-center justify-center gap-2.5 py-4 rounded-xl text-sm font-bold transition-all duration-300 hover:scale-[1.01] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
              style={{
                background: canGenerate && !isGenerating ? `linear-gradient(135deg, ${accent}, ${accent}cc)` : 'rgba(255,255,255,0.06)',
                color: canGenerate && !isGenerating ? 'white' : '#71717a',
                boxShadow: canGenerate && !isGenerating ? `0 8px 32px ${agent.glowColor}` : 'none',
              }}>
              {isGenerating
                ? <><Loader2 size={16} className="animate-spin" /> Gerando...</>
                : apiKey
                  ? <><Sparkles size={16} /> Gerar Imagem</>
                  : <><Sparkles size={16} /> Gerar Prompt</>}
            </button>
            {!apiKey && canGenerate && (
              <p className="text-center text-[11px] text-zinc-600 mt-2">Configure a API Key para gerar imagens reais</p>
            )}
          </div>
        </div>

        {/* Área de Resultado */}
        <div className="flex flex-col overflow-y-auto">

          {/* Imagem gerada */}
          {generatedImage ? (
            <div className="flex-1 flex flex-col items-center justify-start p-6 gap-4">
              <div className="flex items-center justify-between w-full max-w-2xl">
                <span className="text-sm font-semibold text-zinc-300">✅ Imagem Gerada</span>
                <div className="flex gap-2">
                  <button onClick={() => { setGeneratedImage(null); setGeneratedPrompt(''); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-zinc-500 hover:text-zinc-300 transition-all" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                    <RefreshCw size={12} /> Nova
                  </button>
                  <button onClick={handleDownload} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all" style={{ background: `${accent}20`, color: accent, border: `1px solid ${accent}40` }}>
                    <Download size={12} /> Baixar
                  </button>
                </div>
              </div>
              <img src={generatedImage} alt="Imagem gerada pelo Orion" className="max-w-2xl w-full rounded-2xl shadow-2xl" style={{ boxShadow: `0 0 80px ${agent.glowColor}` }} />
            </div>
          ) : (
            <div className="flex-1 flex flex-col gap-0">

              {/* Status de geração */}
              {isGenerating && (
                <div className="mx-6 mt-6 flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: `${accent}10`, border: `1px solid ${accent}30` }}>
                  <Loader2 size={14} className="animate-spin" style={{ color: accent }} />
                  <span className="text-sm text-zinc-300">{status}</span>
                </div>
              )}

              {/* Prompt gerado */}
              {generatedPrompt ? (
                <div className="flex flex-col gap-4 p-6 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">📋 Prompt Gerado</h3>
                    <button onClick={handleCopy} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                      style={{ background: copied ? 'rgba(5,150,105,0.15)' : 'rgba(255,255,255,0.05)', color: copied ? '#34d399' : '#a1a1aa', border: `1px solid ${copied ? 'rgba(5,150,105,0.3)' : 'rgba(255,255,255,0.08)'}` }}>
                      {copied ? <><Check size={12} /> Copiado!</> : <><Copy size={12} /> Copiar Prompt</>}
                    </button>
                  </div>
                  <div className="flex-1 rounded-xl p-5 text-[13px] text-zinc-300 leading-relaxed whitespace-pre-wrap overflow-auto font-mono"
                    style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${accent}25`, minHeight: '300px' }}>
                    {generatedPrompt}
                  </div>
                  {!apiKey && (
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
                      <Zap size={14} className="text-amber-400 shrink-0" />
                      <div>
                        <p className="text-xs text-amber-300 font-semibold">Configure a API Key para gerar imagens reais</p>
                        <p className="text-[11px] text-zinc-500 mt-0.5">Use o botão "API Key" no topo para configurar. O prompt acima pode ser usado no <a href="https://aistudio.google.com" target="_blank" rel="noopener noreferrer" className="text-zinc-400 underline">Google AI Studio</a> gratuitamente.</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                  <div className="p-5 rounded-3xl mb-5" style={{ background: `${accent}12`, color: accent }}>
                    <Icon size={36} />
                  </div>
                  <h2 className="text-xl font-bold text-zinc-200 mb-2">{agent.name}</h2>
                  <p className="text-zinc-500 text-sm max-w-sm mb-1">{agent.description}</p>
                  <p className="text-zinc-700 text-xs">Preencha o formulário e clique em "Gerar"</p>
                  <div className="mt-8 grid grid-cols-2 gap-3 text-xs text-zinc-600 max-w-sm">
                    {['System prompt real do Órion V2', 'Modelo: Gemini 2.0 Flash', 'Upload de foto do sujeito', 'Controles profissionais de câmera'].map(f => (
                      <div key={f} className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <span style={{ color: accent }}>✓</span> {f}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
