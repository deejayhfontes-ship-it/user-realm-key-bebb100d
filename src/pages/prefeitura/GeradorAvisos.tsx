import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Download, Upload, AlertTriangle, Trash2, Plus, X } from 'lucide-react';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';
import logo from '@/assets/logo-fontes-graphics.png';
import rodapeHeliodora from '@/assets/prefeitura/rodape-heliodora.png';

interface CanalContato {
  label: string;
  valor: string;
}

const GeradorAvisos = () => {
  const [titulo, setTitulo] = useState('Cemig\nInforma');
  const [texto, setTexto] = useState('Os nossos canais de atendimento digitais foram restabelecidos e já estão disponíveis.');
  const [canais, setCanais] = useState<CanalContato[]>([
    { label: 'Acesse:', valor: 'Portal cemig.com.br' },
    { label: '', valor: 'Aplicativo Cemig Atende' },
    { label: 'WhatsApp Cemig', valor: '31 3506 1160' },
    { label: 'SMS', valor: '29810' },
    { label: 'Telefone', valor: '116' },
  ]);
  const [logoCliente, setLogoCliente] = useState<string | null>(null);
  const [corPrimaria, setCorPrimaria] = useState('#1a9f53');
  const [corSecundaria, setCorSecundaria] = useState('#0d7a8c');
  const [corDestaque, setCorDestaque] = useState('#bef264');
  const [formato, setFormato] = useState<'feed' | 'story' | 'vertical'>('feed');
  const [consideracoes, setConsideracoes] = useState('');
  const [corCirculo, setCorCirculo] = useState('#ef4444');
  const [corIcone, setCorIcone] = useState('#bef264');
  const previewRef = useRef<HTMLDivElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Apenas imagens são permitidas');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setLogoCliente(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDownload = async () => {
    if (!previewRef.current) return;

    try {
      toast.info('Gerando imagem...');

      const canvas = await html2canvas(previewRef.current, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
      });

      const link = document.createElement('a');
      link.download = `aviso-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      toast.success('Imagem baixada!');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao gerar imagem');
    }
  };

  const addCanal = () => {
    setCanais([...canais, { label: '', valor: '' }]);
  };

  const removeCanal = (index: number) => {
    setCanais(canais.filter((_, i) => i !== index));
  };

  const updateCanal = (index: number, field: 'label' | 'valor', value: string) => {
    const updated = [...canais];
    updated[index][field] = value;
    setCanais(updated);
  };

  const dimensoes = formato === 'feed'
    ? { width: 1080, height: 1080 }
    : formato === 'vertical'
      ? { width: 1080, height: 1440 }
      : { width: 1080, height: 1920 };
  const escala = formato === 'feed' ? 0.38 : formato === 'vertical' ? 0.32 : 0.27;

  return (
    <div className="min-h-screen bg-dark text-foreground flex flex-col">
      {/* Header */}
      <header className="border-b border-primary/20 bg-dark/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/prefeitura"
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">Voltar</span>
            </Link>
            <div className="h-6 w-px bg-primary/30" />
            <img src={logo} alt="Fontes Graphics" className="h-8 w-auto brightness-0 invert" />
            <span className="text-sm font-medium text-primary">Gerador de Avisos</span>
          </div>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-7xl w-full grid lg:grid-cols-2 gap-8 items-center">
          {/* Formulário */}
          <div className="space-y-6">
            <div className="bg-card border border-primary/20 rounded-xl p-6 space-y-5">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-primary" />
                Configurar Aviso
              </h2>

              <div className="space-y-4">
                {/* Formato */}
                <div>
                  <Label className="text-foreground">Formato</Label>
                  <div className="flex gap-2 mt-2">
                    <Button
                      variant={formato === 'feed' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFormato('feed')}
                      className="flex-1"
                    >
                      Feed (1:1)
                    </Button>
                    <Button
                      variant={formato === 'vertical' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFormato('vertical')}
                      className="flex-1"
                    >
                      Vertical (3:4)
                    </Button>
                    <Button
                      variant={formato === 'story' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFormato('story')}
                      className="flex-1"
                    >
                      Story (9:16)
                    </Button>
                  </div>
                </div>

                {/* Título */}
                <div>
                  <Label htmlFor="titulo" className="text-foreground">Título (use Enter para quebrar linha)</Label>
                  <Textarea
                    id="titulo"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    placeholder="Ex: Cemig&#10;Informa"
                    rows={2}
                    className="mt-1 bg-card border-primary/30 resize-none"
                  />
                </div>

                {/* Texto principal */}
                <div>
                  <Label htmlFor="texto" className="text-foreground">Texto Principal</Label>
                  <Textarea
                    id="texto"
                    value={texto}
                    onChange={(e) => setTexto(e.target.value)}
                    placeholder="Digite o texto do aviso..."
                    rows={4}
                    className="mt-1 bg-card border-primary/30 resize-none"
                  />
                </div>

                {/* Considerações Finais */}
                <div>
                  <Label htmlFor="consideracoes" className="text-foreground">Considerações Finais</Label>
                  <Input
                    id="consideracoes"
                    value={consideracoes}
                    onChange={(e) => setConsideracoes(e.target.value)}
                    placeholder="Ex: Agradecemos antecipadamente a compreensão de todos!"
                    className="mt-1 bg-card border-primary/30"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-foreground">Canais de Contato</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={addCanal}
                      className="text-primary hover:text-primary/80 h-7"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Adicionar
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {canais.map((canal, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <Input
                          value={canal.label}
                          onChange={(e) => updateCanal(index, 'label', e.target.value)}
                          placeholder="Label (ex: WhatsApp)"
                          className="flex-1 bg-card border-primary/30 text-sm"
                        />
                        <Input
                          value={canal.valor}
                          onChange={(e) => updateCanal(index, 'valor', e.target.value)}
                          placeholder="Valor (ex: 31 9999-9999)"
                          className="flex-1 bg-card border-primary/30 text-sm"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeCanal(index)}
                          className="h-8 w-8 text-destructive hover:text-destructive/80"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Logo */}
                <div>
                  <Label className="text-foreground">Logo do Cliente</Label>
                  <div className="mt-2 flex items-center gap-3">
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => logoInputRef.current?.click()}
                      className="border-primary/30"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Carregar Logo
                    </Button>
                    {logoCliente && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setLogoCliente(null)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remover
                      </Button>
                    )}
                  </div>
                  {logoCliente && (
                    <div className="mt-3 p-3 bg-muted/20 rounded-lg inline-block">
                      <img src={logoCliente} alt="Logo" className="h-12 w-auto object-contain" />
                    </div>
                  )}
                </div>

                {/* Cores */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="corPrimaria" className="text-foreground text-sm">Cor Primária</Label>
                    <div className="mt-1 flex items-center gap-2">
                      <input
                        type="color"
                        id="corPrimaria"
                        value={corPrimaria}
                        onChange={(e) => setCorPrimaria(e.target.value)}
                        className="w-10 h-10 rounded cursor-pointer border-0"
                      />
                      <Input
                        value={corPrimaria}
                        onChange={(e) => setCorPrimaria(e.target.value)}
                        className="flex-1 bg-card border-primary/30 text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="corSecundaria" className="text-foreground text-sm">Cor Secundária</Label>
                    <div className="mt-1 flex items-center gap-2">
                      <input
                        type="color"
                        id="corSecundaria"
                        value={corSecundaria}
                        onChange={(e) => setCorSecundaria(e.target.value)}
                        className="w-10 h-10 rounded cursor-pointer border-0"
                      />
                      <Input
                        value={corSecundaria}
                        onChange={(e) => setCorSecundaria(e.target.value)}
                        className="flex-1 bg-card border-primary/30 text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="corDestaque" className="text-foreground text-sm">Cor Destaque</Label>
                    <div className="mt-1 flex items-center gap-2">
                      <input
                        type="color"
                        id="corDestaque"
                        value={corDestaque}
                        onChange={(e) => setCorDestaque(e.target.value)}
                        className="w-10 h-10 rounded cursor-pointer border-0"
                      />
                      <Input
                        value={corDestaque}
                        onChange={(e) => setCorDestaque(e.target.value)}
                        className="flex-1 bg-card border-primary/30 text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Cores do Ícone de Alerta */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="corCirculo" className="text-foreground text-sm">Cor do Círculo</Label>
                    <div className="mt-1 flex items-center gap-2">
                      <input
                        type="color"
                        id="corCirculo"
                        value={corCirculo}
                        onChange={(e) => setCorCirculo(e.target.value)}
                        className="w-10 h-10 rounded cursor-pointer border-0"
                      />
                      <Input
                        value={corCirculo}
                        onChange={(e) => setCorCirculo(e.target.value)}
                        className="flex-1 bg-card border-primary/30 text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="corIcone" className="text-foreground text-sm">Cor do Símbolo</Label>
                    <div className="mt-1 flex items-center gap-2">
                      <input
                        type="color"
                        id="corIcone"
                        value={corIcone}
                        onChange={(e) => setCorIcone(e.target.value)}
                        className="w-10 h-10 rounded cursor-pointer border-0"
                      />
                      <Input
                        value={corIcone}
                        onChange={(e) => setCorIcone(e.target.value)}
                        className="flex-1 bg-card border-primary/30 text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleDownload}
                className="w-full bg-primary hover:bg-primary/90"
              >
                <Download className="h-4 w-4 mr-2" />
                Baixar Imagem
              </Button>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Preview</h3>

            <div
              className="relative overflow-hidden rounded-xl border border-primary/20"
              style={{
                width: dimensoes.width * escala,
                height: dimensoes.height * escala,
              }}
            >
              <div
                ref={previewRef}
                style={{
                  width: dimensoes.width,
                  height: dimensoes.height,
                  transform: `scale(${escala})`,
                  transformOrigin: 'top left',
                  background: `linear-gradient(135deg, ${corPrimaria} 0%, ${corSecundaria} 100%)`,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Ondas decorativas no canto superior direito */}
                <svg
                  viewBox={`0 0 ${dimensoes.width} ${dimensoes.height}`}
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '100%',
                    height: '100%',
                  }}
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={corSecundaria} stopOpacity="0.6" />
                      <stop offset="100%" stopColor={corSecundaria} stopOpacity="0.3" />
                    </linearGradient>
                  </defs>
                  {/* Onda principal */}
                  <path
                    d={`M${dimensoes.width * 0.55},0 
                        Q${dimensoes.width * 0.75},${dimensoes.height * 0.15} 
                        ${dimensoes.width},${dimensoes.height * 0.35}
                        L${dimensoes.width},0 Z`}
                    fill="url(#waveGradient)"
                  />
                  {/* Onda secundária */}
                  <path
                    d={`M${dimensoes.width * 0.7},0 
                        Q${dimensoes.width * 0.85},${dimensoes.height * 0.2} 
                        ${dimensoes.width},${dimensoes.height * 0.5}
                        L${dimensoes.width},0 Z`}
                    fill={corSecundaria}
                    opacity="0.25"
                  />
                </svg>

                {/* Logo do cliente no canto superior direito */}
                {logoCliente && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '80px',
                      right: '160px',
                      zIndex: 15,
                    }}
                  >
                    <img
                      src={logoCliente}
                      alt="Logo Cliente"
                      style={{
                        height: '280px',
                        width: 'auto',
                        objectFit: 'contain',
                      }}
                    />
                  </div>
                )}

                <div
                  style={{
                    position: 'relative',
                    zIndex: 10,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  {/* Área principal centralizada verticalmente */}
                  <div
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: formato === 'story' ? 'flex-start' : 'center',
                      alignItems: 'flex-start',
                      padding: formato === 'feed' ? '70px' : formato === 'vertical' ? '70px' : '70px',
                      paddingTop: formato === 'feed' ? '35px' : formato === 'vertical' ? '35px' : '100px',
                      paddingBottom: formato === 'feed' ? '180px' : formato === 'vertical' ? '200px' : '240px',
                    }}
                  >
                    {/* Ícone de alerta triangular com círculo vermelho */}
                    <div style={{ marginBottom: '28px' }}>
                      <div
                        style={{
                          width: '100px',
                          height: '100px',
                          borderRadius: '50%',
                          border: `5px solid ${corCirculo}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <svg
                          viewBox="0 0 100 100"
                          style={{
                            width: '55px',
                            height: '55px',
                            marginTop: '-7px',
                          }}
                        >
                          {/* Triângulo outline arredondado */}
                          <path
                            d="M50,15 L88,80 Q90,84 86,86 L14,86 Q10,84 12,80 Z"
                            fill="none"
                            stroke={corIcone}
                            strokeWidth="6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          {/* Ponto de exclamação em linha */}
                          <circle cx="50" cy="70" r="4" fill="none" stroke={corIcone} strokeWidth="5" />
                          <line x1="50" y1="38" x2="50" y2="56" stroke={corIcone} strokeWidth="6" strokeLinecap="round" />
                        </svg>
                      </div>
                    </div>

                    {/* Título */}
                    <div
                      style={{
                        color: corDestaque,
                        fontSize: formato === 'feed' ? '72px' : '82px',
                        fontWeight: 800,
                        lineHeight: 1.05,
                        fontFamily: 'Poppins, sans-serif',
                        marginBottom: '28px',
                        letterSpacing: '-1px',
                        textAlign: 'left',
                      }}
                    >
                      {titulo.split('\n').map((line, i) => (
                        <div key={i}>{line}</div>
                      ))}
                    </div>

                    {/* Texto principal */}
                    <div
                      style={{
                        color: '#ffffff',
                        fontSize: formato === 'feed' ? '28px' : '32px',
                        fontWeight: 500,
                        lineHeight: 1.4,
                        fontFamily: 'DINNextLTPro, Arial, sans-serif',
                        marginBottom: '28px',
                        textAlign: 'left',
                      }}
                    >
                      {texto}
                    </div>

                    {/* Canais de Contato */}
                    {canais.length > 0 && (
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                          alignItems: 'flex-start',
                        }}
                      >
                        {canais.map((canal, index) => (
                          <div
                            key={index}
                            style={{
                              fontSize: formato === 'feed' ? '24px' : '28px',
                              fontFamily: 'DINNextLTPro, Arial, sans-serif',
                              lineHeight: 1.4,
                              textAlign: 'left',
                            }}
                          >
                            {canal.label && (
                              <span style={{ color: '#ffffff', fontWeight: 700 }}>
                                {canal.label}{' '}
                              </span>
                            )}
                            <span style={{ color: corDestaque, fontWeight: 400 }}>
                              {canal.valor}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Considerações Finais */}
                    {consideracoes && (
                      <div
                        style={{
                          color: '#ffffff',
                          fontSize: formato === 'feed' ? '24px' : '28px',
                          fontWeight: 500,
                          lineHeight: 1.4,
                          fontFamily: 'DINNextLTPro, Arial, sans-serif',
                          marginTop: '40px',
                          textAlign: 'left',
                        }}
                      >
                        {consideracoes}
                      </div>
                    )}
                  </div>

                  {/* Rodapé fixo na parte inferior */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                    }}
                  >
                    {/* Imagem do rodapé */}
                    <img
                      src={rodapeHeliodora}
                      alt="Rodapé Prefeitura de Heliodora"
                      style={{
                        width: '100%',
                        height: 'auto',
                        objectFit: 'cover',
                      }}
                      crossOrigin="anonymous"
                    />
                  </div>
                </div>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              Dimensões: {dimensoes.width}x{dimensoes.height}px
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeradorAvisos;
