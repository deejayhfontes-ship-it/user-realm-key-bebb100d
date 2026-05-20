import React, { useState, useRef } from 'react';
import { GeneratorState } from '@/lib/designbuilder-prompts';
import { ChevronRight, ChevronDown, ImagePlus, X, Zap, Copy } from 'lucide-react';

const FORMATS = [
  { id: 'stories', label: 'Stories (9:16)', icon: '📱', w: 9, h: 16 },
  { id: 'feed_square', label: 'Feed Quadrado (1:1)', icon: '⬛', w: 1, h: 1 },
  { id: 'feed_portrait', label: 'Feed Retrato (4:5)', icon: '🖼️', w: 4, h: 5 },
  { id: 'horizontal_16_9', label: 'Horizontal (16:9)', icon: '🖥️', w: 16, h: 9 },
];

const VISUAL_STYLES = [
  { id: 'ultra_realistic', label: 'Ultra Realista' },
  { id: 'pro_portrait', label: 'Retrato Pro' },
  { id: 'advertising', label: 'Publicitário' },
  { id: 'glassmorphism', label: 'Glassmorphism' },
  { id: 'minimalist', label: 'Minimalista' },
  { id: 'tech', label: 'Tecnológico' },
  { id: 'cartoon', label: 'Cartoon' },
  { id: 'gamer', label: 'Gamer' },
  { id: 'elegant', label: 'Elegante' },
];

const CAMERA_SHOTS = [
  { id: 'close-up', label: 'Close-up', desc: 'Rosto' },
  { id: 'medium', label: 'Plano Médio', desc: 'Busto' },
  { id: 'american', label: 'Plano Americano', desc: 'Joelhos pra cima' },
];

// Classes reutilizáveis maiores
const inputCls = "w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3.5 text-base text-white placeholder-zinc-600 outline-none focus:border-violet-500/40 transition-colors";
const labelCls = "block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2";

function Section({ title, defaultOpen = false, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-white/[0.05]">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-center justify-between px-5 py-4 text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-zinc-200 transition-colors"
      >
        {title}
        {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>
      {open && <div className="px-5 pb-5">{children}</div>}
    </div>
  );
}

interface Props {
  state: GeneratorState;
  updateState: (key: keyof GeneratorState, value: any) => void;
  isGenerating: boolean;
  onGenerate: () => void;
}

export default function SidebarForm({ state, updateState, isGenerating, onGenerate }: Props) {
  const [format, setFormat] = useState('stories');
  const [subjectImages, setSubjectImages] = useState<{ file: File; preview: string }[]>([]);
  const [refImages, setRefImages] = useState<{ file: File; preview: string }[]>([]);
  const [additionalPrompt, setAdditionalPrompt] = useState('');
  const subjectRef = useRef<HTMLInputElement>(null);
  const refInputRef = useRef<HTMLInputElement>(null);

  const addSubjectImgs = (files: FileList | File[]) => {
    const imgs = Array.from(files).filter(f => f.type.startsWith('image/')).map(f => ({ file: f, preview: URL.createObjectURL(f) }));
    setSubjectImages(p => [...p, ...imgs].slice(0, 5));
  };
  const addRefImgs = (files: FileList | File[]) => {
    const imgs = Array.from(files).filter(f => f.type.startsWith('image/')).map(f => ({ file: f, preview: URL.createObjectURL(f) }));
    setRefImages(p => [...p, ...imgs].slice(0, 5));
  };

  return (
    <div className="flex h-full flex-col overflow-hidden bg-[#08060d]">
      <div className="flex-1 overflow-y-auto">

        {/* ── FORMATO ── */}
        <div className="px-5 pt-5 pb-3">
          <label className={labelCls}>Formato</label>
          <div className="flex flex-col gap-2">
            {FORMATS.map(f => {
              const active = format === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFormat(f.id)}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all border cursor-pointer ${
                    active
                      ? 'border-violet-400/30 bg-violet-500/[0.08] text-white'
                      : 'border-white/[0.05] bg-white/[0.02] text-zinc-400 hover:border-white/10 hover:text-zinc-200'
                  }`}
                  style={active ? { boxShadow: '0 0 14px rgba(168,85,247,0.2)' } : undefined}
                >
                  <span className="text-xl leading-none">{f.icon}</span>
                  <span className="text-sm font-semibold">{f.label}</span>
                  <div
                    className="ml-auto rounded border flex-shrink-0"
                    style={{
                      width: Math.round(34 * f.w / Math.max(f.w, f.h)),
                      height: Math.round(34 * f.h / Math.max(f.w, f.h)),
                      background: active ? 'rgba(168,85,247,0.15)' : 'rgba(255,255,255,0.04)',
                      borderColor: active ? 'rgba(168,85,247,0.4)' : 'rgba(255,255,255,0.08)',
                    }}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* ── NICHO / PROJETO ── */}
        <Section title="Nicho / Projeto" defaultOpen>
          <div className="space-y-4">
            <div>
              <label className={labelCls}>
                Nicho <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Ex: Campanha Verão 2026..."
                value={state.niche}
                onChange={e => updateState('niche', e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Cenário / Contexto</label>
              <textarea
                placeholder="Descreva o ambiente físico, clima ou contexto..."
                rows={3}
                value={state.sceneDescription}
                onChange={e => updateState('sceneDescription', e.target.value)}
                className={`${inputCls} resize-none`}
              />
            </div>
          </div>
        </Section>

        {/* ── SUJEITO ── */}
        <Section title="O Sujeito" defaultOpen>
          <div className="space-y-4">
            {/* Posição */}
            <div>
              <label className={labelCls}>Posição do Sujeito</label>
              <div className="grid grid-cols-3 gap-2">
                {(['left', 'center', 'right'] as const).map(pos => (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => updateState('subjectPosition', pos)}
                    className={`py-3 rounded-xl border text-sm font-semibold transition-all ${
                      state.subjectPosition === pos
                        ? 'bg-violet-600/20 border-violet-500/50 text-violet-300'
                        : 'bg-black/20 border-white/5 text-zinc-500 hover:border-white/20 hover:text-zinc-300'
                    }`}
                  >
                    {pos === 'left' ? 'Esquerda' : pos === 'center' ? 'Centro' : 'Direita'}
                  </button>
                ))}
              </div>
            </div>

            {/* Descrição */}
            <div>
              <label className={labelCls}>Descrição do Sujeito</label>
              <textarea
                placeholder="Ex: Mulher 30 anos, blazer branco..."
                rows={3}
                value={state.subjectDescription}
                onChange={e => updateState('subjectDescription', e.target.value)}
                className={`${inputCls} resize-none`}
              />
            </div>

            {/* Enquadramento */}
            <div>
              <label className={labelCls}>Enquadramento (Câmera)</label>
              <div className="flex flex-col gap-2">
                {CAMERA_SHOTS.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => updateState('cameraShot', c.id)}
                    className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm border transition-all ${
                      state.cameraShot === c.id
                        ? 'bg-violet-600/20 border-violet-500/40 text-violet-300'
                        : 'bg-black/20 border-white/5 text-zinc-400 hover:border-white/15 hover:text-zinc-300'
                    }`}
                  >
                    <span className="font-semibold">{c.label}</span>
                    <span className="text-xs text-zinc-600">{c.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Fotos do sujeito */}
            <div>
              <label className={labelCls}>
                Fotos do Sujeito{' '}
                <span className="text-zinc-600 normal-case font-normal">(opcional)</span>
              </label>
              <div
                onClick={() => subjectRef.current?.click()}
                className="group flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/[0.08] bg-white/[0.02] py-5 transition-all hover:border-violet-400/30 hover:bg-violet-500/[0.03]"
              >
                <ImagePlus className="h-7 w-7 text-zinc-600 group-hover:text-violet-400 transition-colors" />
                <span className="text-sm text-zinc-600">Clique ou arraste fotos</span>
                <span className="text-xs text-zinc-700">JPG, PNG, WEBP · Máx. 5 fotos</span>
              </div>
              <input ref={subjectRef} type="file" accept="image/*" multiple className="hidden"
                onChange={e => { e.target.files && addSubjectImgs(e.target.files); e.target.value = ''; }} />
              {subjectImages.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {subjectImages.map((img, i) => (
                    <div key={i} className="group relative h-16 w-16 shrink-0">
                      <img src={img.preview} alt="" className="h-full w-full rounded-xl object-cover border border-white/10" />
                      <button onClick={() => setSubjectImages(p => p.filter((_, idx) => idx !== i))}
                        className="absolute -top-1.5 -right-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-black/90 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Section>

        {/* ── IMAGENS DE REFERÊNCIA ── */}
        <Section title="Imagens de Referência">
          <div>
            <p className="mb-3 text-sm text-zinc-500 leading-relaxed">Envie referências para o IA extrair estilo, paleta e composição.</p>
            <div
              onClick={() => refInputRef.current?.click()}
              className="group flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/[0.08] bg-white/[0.02] py-5 transition-all hover:border-violet-400/30 hover:bg-violet-500/[0.03]"
            >
              <ImagePlus className="h-7 w-7 text-zinc-600 group-hover:text-violet-400 transition-colors" />
              <span className="text-sm text-zinc-600">Clique ou arraste referências</span>
            </div>
            <input ref={refInputRef} type="file" accept="image/*" multiple className="hidden"
              onChange={e => { e.target.files && addRefImgs(e.target.files); e.target.value = ''; }} />
            {refImages.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {refImages.map((img, i) => (
                  <div key={i} className="group relative h-16 w-16 shrink-0">
                    <img src={img.preview} alt="" className="h-full w-full rounded-xl object-cover border border-white/10" />
                    <button onClick={() => setRefImages(p => p.filter((_, idx) => idx !== i))}
                      className="absolute -top-1.5 -right-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-black/90 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Section>

        {/* ── ESTILO E COMPOSIÇÃO ── */}
        <Section title="Composição & Estilo" defaultOpen>
          <div className="space-y-5">
            {/* Sobriedade */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className={labelCls} style={{ margin: 0 }}>Sobriedade vs Criatividade</label>
                <span className="text-sm font-mono font-bold text-violet-400 bg-violet-500/10 px-2 py-1 rounded-lg">{state.sobriety}</span>
              </div>
              <input
                type="range" min="0" max="100"
                value={state.sobriety}
                onChange={e => updateState('sobriety', Number(e.target.value))}
                className="w-full h-2 rounded-full bg-white/10 appearance-none cursor-pointer accent-violet-500"
              />
              <div className="flex justify-between mt-2 text-xs font-bold text-zinc-600">
                <span>Criativo (0)</span><span>Sóbrio (100)</span>
              </div>
            </div>

            {/* Estilos */}
            <div>
              <label className={labelCls}>Estilo Visual</label>
              <div className="grid grid-cols-3 gap-2">
                {VISUAL_STYLES.map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => updateState('visualStyle', s.id)}
                    className={`py-2.5 px-2 text-xs font-semibold uppercase rounded-xl border transition-all ${
                      state.visualStyle === s.id
                        ? 'bg-violet-600/20 border-violet-500 text-violet-300'
                        : 'bg-black/40 border-white/5 text-zinc-500 hover:border-white/20 hover:text-zinc-300'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Elementos Flutuantes */}
            <div>
              <label className={labelCls}>Elementos Flutuantes</label>
              <input
                type="text"
                placeholder="Ex: Pétalas, notas de dólar..."
                value={state.floatingElements}
                onChange={e => updateState('floatingElements', e.target.value)}
                className={inputCls}
              />
            </div>
          </div>
        </Section>

        {/* ── PALETA DE CORES ── */}
        <Section title="Paleta de Cores">
          <div className="grid grid-cols-3 gap-4">
            {[
              { key: 'ambientColor', label: 'Ambiente' },
              { key: 'complementaryLight', label: 'Rim Light' },
              { key: 'highlightColor', label: 'Destaque' },
            ].map(({ key, label }) => (
              <div key={key} className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500">{label}</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={(state as any)[key]}
                    onChange={e => updateState(key as keyof GeneratorState, e.target.value)}
                    className="h-10 w-10 shrink-0 cursor-pointer rounded-lg border-0 bg-transparent p-0"
                  />
                  <input
                    type="text"
                    value={(state as any)[key]}
                    onChange={e => updateState(key as keyof GeneratorState, e.target.value)}
                    className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/40 px-2 text-xs font-mono uppercase text-white outline-none focus:border-violet-500/40"
                  />
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ── TEXTO ── */}
        <Section title="Configuração de Texto">
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl border border-white/5 bg-black/20 p-4">
              <div>
                <div className="text-sm font-semibold text-white">Preparar Negative Space</div>
                <div className="text-xs text-zinc-500 mt-1">Limpa uma área para inserir texto</div>
              </div>
              <button
                onClick={() => updateState('hasText', !state.hasText)}
                className={`relative h-7 w-12 rounded-full transition-colors duration-300 ${state.hasText ? 'bg-violet-600' : 'bg-white/10'}`}
              >
                <div className={`absolute top-1.5 left-1.5 h-4 w-4 rounded-full bg-white transition-transform duration-300 ${state.hasText ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
            {state.hasText && (
              <div className="grid grid-cols-3 gap-2">
                {(['align-left', 'align-center', 'align-right'] as const).map(pos => (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => updateState('textPosition', pos)}
                    className={`py-3 rounded-xl border text-xs font-semibold uppercase transition-all ${
                      state.textPosition === pos
                        ? 'bg-violet-600/20 border-violet-500/50 text-violet-300'
                        : 'bg-black/40 border-white/5 text-zinc-500'
                    }`}
                  >
                    {pos === 'align-left' ? 'Esq.' : pos === 'align-center' ? 'Centro' : 'Dir.'}
                  </button>
                ))}
              </div>
            )}
          </div>
        </Section>

        {/* ── PROMPT ADICIONAL ── */}
        <Section title="Prompt Adicional">
          <textarea
            value={additionalPrompt}
            onChange={e => setAdditionalPrompt(e.target.value)}
            placeholder="Adicione detalhes extras ao prompt automático..."
            rows={4}
            className={`${inputCls} resize-none`}
          />
        </Section>

        <div className="h-4" />
      </div>

      {/* ── BOTÕES FIXOS NO FUNDO ── */}
      <div className="shrink-0 border-t border-white/[0.06] px-5 py-5 space-y-3 bg-[#08060d]/95 backdrop-blur-xl">
        <button
          onClick={onGenerate}
          disabled={isGenerating || !state.niche}
          className="group relative w-full overflow-hidden rounded-2xl py-4 font-bold text-white transition-all disabled:cursor-not-allowed disabled:opacity-40 text-base"
          style={{
            background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
            boxShadow: state.niche && !isGenerating ? '0 0 28px rgba(168,85,247,0.4)' : undefined,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          {isGenerating ? (
            <span className="flex items-center justify-center gap-2 uppercase tracking-widest">
              <span className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Gerando...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2 uppercase tracking-widest">
              <Zap className="h-5 w-5" />
              Gerar Imagem
            </span>
          )}
        </button>

        <button className="w-full py-3 rounded-xl font-medium text-zinc-500 border border-white/5 text-sm hover:bg-white/5 hover:text-zinc-300 transition-all flex items-center justify-center gap-2">
          <Copy className="h-4 w-4" />
          Duplicar Configuração
        </button>

        {!state.niche && (
          <p className="text-center text-xs text-zinc-600">Preencha o Nicho para habilitar</p>
        )}
      </div>
    </div>
  );
}
