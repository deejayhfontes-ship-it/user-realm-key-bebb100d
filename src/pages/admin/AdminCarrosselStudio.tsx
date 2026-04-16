import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, Sparkles, CheckCircle2,
  Loader2, RefreshCw, ChevronRight,
  LayoutTemplate, Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  buscarPautas, gerarAngulos, gerarCarrossel, checkHealth,
  type Pauta, type Angulo, type Slide, type CarrosselResult
} from '@/services/carrossel-api';
import { SlideGrid } from '@/components/carrossel/SlidePreview';
import { CarouselStudioV2View } from '@/components/carrossel/CarouselStudioV2View';
import type { CarouselV2, SlideConfig } from '@/types/carrossel-v2';
import { PREMIUM_FONTS } from '@/types/carrossel-constants';

type Formato = '1080x1440' | '1080x1920';
type Etapa = 0 | 1 | 2 | 3;

const ETAPAS = ['Tema', 'Pauta', 'Ângulo', 'Carrossel'];
const FORMATOS: { value: Formato; label: string; desc: string }[] = [
  { value: '1080x1440', label: 'Feed', desc: '1080 × 1440 px' },
  { value: '1080x1920', label: 'Story', desc: '1080 × 1920 px' },
];
const POTENCIAL_COLOR: Record<string, string> = {
  alto: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  medio: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  baixo: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export default function AdminCarrosselStudio() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [apiOk, setApiOk] = useState<boolean | null>(null);

  useEffect(() => {
    checkHealth().then(res => setApiOk(res.ok));
  }, []);

  const [etapa, setEtapa] = useState<Etapa>(0);
  const [loading, setLoading] = useState(false);
  const [tema, setTema] = useState('');
  const [formato, setFormato] = useState<Formato>('1080x1440');
  const [pautas, setPautas] = useState<Pauta[]>([]);
  const [pautaSelecionada, setPautaSelecionada] = useState<Pauta | null>(null);
  const [angulos, setAngulos] = useState<Angulo[]>([]);
  const [anguloSelecionado, setAnguloSelecionado] = useState<Angulo | null>(null);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [resultadoCompleto, setResultadoCompleto] = useState<CarrosselResult | null>(null);
  const [tituloCarrossel, setTituloCarrossel] = useState('');
  const [showStudio, setShowStudio] = useState(false);
  const [studioData, setStudioData] = useState<CarouselV2 | null>(null);

  async function handleBuscarPautas() {
    setLoading(true);
    try {
      const result = await buscarPautas({ tema, niche: 'geral' });
      setPautas(result);
      setEtapa(1);
    } catch (e) {
      toast({ title: 'Erro ao buscar pautas', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }

  async function handleSelecionarPauta(pauta: Pauta) {
    setPautaSelecionada(pauta);
    setLoading(true);
    try {
      const result = await gerarAngulos({ pauta });
      setAngulos(result);
      setEtapa(2);
    } catch (e) {
      toast({ title: 'Erro ao gerar ângulos', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }

  async function handleSelecionarAngulo(angulo: Angulo) {
    if (!pautaSelecionada) return;
    setAnguloSelecionado(angulo);
    setLoading(true);
    try {
      const result = await gerarCarrossel({ angulo, pauta: pautaSelecionada, formato });
      const generatedSlides = result.copy.slides;
      setSlides(generatedSlides);
      setResultadoCompleto(result);
      setTituloCarrossel(pautaSelecionada.titulo);

      const studioSlides: SlideConfig[] = generatedSlides.map((s, idx) => ({
        id: `slide-${idx}-${Date.now()}`,
        title: s.titulo,
        subtitle: s.corpo,
        textAlign: 'center',
        textScale: 100,
        titleFontSize: idx === 0 ? 108 : 82,
        subtitleFontSize: idx === 0 ? 36 : 32,
        titleFont: PREMIUM_FONTS[0].id,
        subtitleFont: PREMIUM_FONTS[7].id,
        overlayStyle: 'bottom-strong',
        overlayOpacity: 90,
        bgPattern: 'none',
        slideDark: true,
        bgColor: '#0a0a0a'
      }));

      setStudioData({
        title: pautaSelecionada.titulo,
        postStyle: 'minimalista',
        slideFormat: formato === '1080x1440' ? 'carousel' : 'story',
        slides: studioSlides
      });

      setEtapa(3);
    } catch (e) {
      toast({ title: 'Erro ao gerar carrossel', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }

  function handleReiniciar() {
    setEtapa(0); setTema(''); setPautas([]); setPautaSelecionada(null);
    setAngulos([]); setAnguloSelecionado(null); setSlides([]); setResultadoCompleto(null); setTituloCarrossel('');
  }

  if (showStudio && studioData) {
    return <CarouselStudioV2View initialData={studioData} onBack={() => setShowStudio(false)} />;
  }

  return (
    <div className="min-h-screen bg-muted/30 p-4 sm:p-6 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/generators')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              🎠 Carrossel Studio
            </h1>
            <p className="text-sm text-muted-foreground">Crie carrosseis profissionais com IA</p>
          </div>
          <Badge className={apiOk === true ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-muted'} variant="outline">
            {apiOk === null ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Activity className="w-3 h-3 mr-1" />}
            {apiOk === null ? 'Verificando...' : apiOk ? 'Backend Online' : 'Backend Offline'}
          </Badge>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-2">
          {ETAPAS.map((label, i) => (
            <div key={i} className="flex items-center gap-2 flex-1">
              <div className={`flex items-center gap-1.5 ${i <= etapa ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${i < etapa ? 'bg-primary border-primary text-primary-foreground' : i === etapa ? 'border-primary text-primary' : 'border-muted-foreground/30'}`}>
                  {i < etapa ? <CheckCircle2 className="w-3 h-3" /> : i + 1}
                </div>
                <span className="text-xs font-medium hidden sm:block">{label}</span>
              </div>
              {i < ETAPAS.length - 1 && <div className={`flex-1 h-0.5 ${i < etapa ? 'bg-primary' : 'bg-muted-foreground/20'}`} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={etapa} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}>

            {etapa === 0 && (
              <Card>
                <CardContent className="p-6 space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold mb-1">Qual é o tema?</h2>
                    <p className="text-sm text-muted-foreground mb-4">Digite um tema ou deixe em branco para a IA escolher.</p>
                    <textarea value={tema} onChange={(e) => setTema(e.target.value)} placeholder="Ex: alimentação saudável, marketing digital..." className="w-full min-h-[100px] rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><LayoutTemplate className="w-4 h-4 text-primary" /> Formato</h3>
                    <div className="flex gap-3">
                      {FORMATOS.map((f) => (
                        <button key={f.value} onClick={() => setFormato(f.value)} className={`flex-1 rounded-xl border-2 p-4 text-center transition-all ${formato === f.value ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}>
                          <div className="font-semibold">{f.label}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{f.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <Button className="w-full" onClick={handleBuscarPautas} disabled={loading}>
                    {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Buscando pautas...</> : <><Sparkles className="w-4 h-4 mr-2" /> Buscar Pautas</>}
                  </Button>
                </CardContent>
              </Card>
            )}

            {etapa === 1 && (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold">Escolha uma pauta</h2>
                {pautas.map((pauta) => (
                  <Card key={pauta.id} className="cursor-pointer hover:border-primary/60 hover:shadow-md transition-all group" onClick={() => handleSelecionarPauta(pauta)}>
                    <CardContent className="p-4 flex items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold group-hover:text-primary transition-colors">{pauta.titulo}</h3>
                          <Badge className={`text-xs border ${POTENCIAL_COLOR[pauta.potencial] || ''}`} variant="outline">{pauta.potencial}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{pauta.contexto}</p>
                      </div>
                      {loading && pautaSelecionada?.id === pauta.id ? <Loader2 className="w-5 h-5 animate-spin text-primary flex-shrink-0 mt-0.5" /> : <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-0.5" />}
                    </CardContent>
                  </Card>
                ))}
                <Button variant="outline" className="w-full" onClick={() => setEtapa(0)}><ArrowLeft className="w-4 h-4 mr-2" /> Voltar</Button>
              </div>
            )}

            {etapa === 2 && (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold">Escolha um ângulo</h2>
                <p className="text-sm text-muted-foreground">Para: <strong>{pautaSelecionada?.titulo}</strong></p>
                {angulos.map((angulo) => (
                  <Card key={angulo.id} className="cursor-pointer hover:border-primary/60 hover:shadow-md transition-all group" onClick={() => handleSelecionarAngulo(angulo)}>
                    <CardContent className="p-4 flex items-start gap-4">
                      <span className="text-2xl flex-shrink-0 mt-0.5">{angulo.emoji}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold group-hover:text-primary transition-colors">{angulo.tipo}</h3>
                        </div>
                        <p className="text-xs text-primary font-medium mb-1">🪝 {angulo.hook}</p>
                        <p className="text-sm text-muted-foreground">{angulo.descricao}</p>
                      </div>
                      {loading && anguloSelecionado?.id === angulo.id ? <Loader2 className="w-5 h-5 animate-spin text-primary flex-shrink-0 mt-0.5" /> : <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-0.5" />}
                    </CardContent>
                  </Card>
                ))}
                <Button variant="outline" className="w-full" onClick={() => setEtapa(1)}><ArrowLeft className="w-4 h-4 mr-2" /> Voltar</Button>
              </div>
            )}

            {etapa === 3 && (
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">🎉 Carrossel pronto!</h2>
                    <p className="text-sm text-muted-foreground">{tituloCarrossel}</p>
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30" variant="outline">{slides.length} slides</Badge>
                </div>
                <SlideGrid slides={slides} nicho="geral" formato={formato} />
                {resultadoCompleto?.copy.legenda && (
                  <Card>
                    <CardContent className="p-4 space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground">📝 LEGENDA</p>
                      <p className="text-sm">{resultadoCompleto.copy.legenda}</p>
                      {resultadoCompleto.copy.hashtags?.length > 0 && <p className="text-xs text-primary">{resultadoCompleto.copy.hashtags.join(' ')}</p>}
                    </CardContent>
                  </Card>
                )}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button className="flex-1 gap-2 border-emerald-500 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20" variant="outline" onClick={() => setShowStudio(true)}>
                    <Sparkles className="w-4 h-4" /> Abrir no Studio Premium
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={handleReiniciar}>
                    <RefreshCw className="w-4 h-4 mr-2" /> Novo Carrossel
                  </Button>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>

        {loading && etapa !== 0 && (
          <div className="flex items-center justify-center py-8 gap-3 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="text-sm">{etapa === 1 ? 'Pedro Pauta pensando...' : etapa === 2 ? 'Clara Carrossel elaborando...' : 'Diego Design criando...'}</span>
          </div>
        )}
      </div>
    </div>
  );
}
