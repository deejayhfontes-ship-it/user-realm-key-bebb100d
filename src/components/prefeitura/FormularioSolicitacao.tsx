import { useState, useEffect } from 'react';
import { Upload, Calendar, CheckCircle, AlertCircle, X, Loader2, GraduationCap, Heart, HardHat, Leaf, Users, Dumbbell, Palette, Building2, Copy, Search } from 'lucide-react';
import logoHeliodora from '@/assets/prefeitura/logo-heliodora-branco.svg';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { sendNovaSolicitacao } from '@/lib/webhooks';

const TRELLO_CONFIG = {
  apiKey: import.meta.env.VITE_TRELLO_API_KEY || '4915c0ad78a673a64a866580d36e2403',
  token: import.meta.env.VITE_TRELLO_TOKEN || '',
  listId: import.meta.env.VITE_TRELLO_LIST_ID || '68db3cf4411bd8c24da583ba'
};

const TIPOS_MATERIAL = [
  { value: 'post-instagram', label: 'Post Instagram', dias: 2 },
  { value: 'carrossel', label: 'Carrossel', dias: 3 },
  { value: 'post-aviso', label: 'Post Aviso', dias: 2 },
  { value: 'folder-flyer', label: 'Folder/Flyer', dias: 4 },
  { value: 'banner', label: 'Banner', dias: 3 },
  { value: 'outro', label: 'Outro', dias: 3 },
];

const REDES_SOCIAIS = [
  { id: 'instagram', label: 'Instagram' },
  { id: 'facebook', label: 'Facebook' },
  { id: 'tiktok', label: 'TikTok' },
  { id: 'youtube', label: 'YouTube' },
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'site-blog', label: 'Site/Blog' },
];

const DEPARTAMENTOS = [
  { value: 'educacao', label: 'Educação', icon: GraduationCap },
  { value: 'saude', label: 'Saúde', icon: Heart },
  { value: 'obras', label: 'Obras', icon: HardHat },
  { value: 'agricultura', label: 'Agricultura', icon: Leaf },
  { value: 'assistencia-social', label: 'Assistência Social', icon: Users },
  { value: 'esporte-lazer', label: 'Diretoria de Esporte e Lazer', icon: Dumbbell },
  { value: 'cultura-turismo', label: 'Diretoria de Cultura e Turismo', icon: Palette },
  { value: 'planejamento', label: 'Sec. de Adm. Planejamento e Assuntos Estratégicos', icon: Building2 },
];

interface ArquivoSelecionado {
  file: File;
  nome: string;
  tamanho: number;
}

interface FormularioSolicitacaoProps {
  isAdmin?: boolean;
  adminNome?: string;
}

const FormularioSolicitacao = ({ isAdmin = false, adminNome = '' }: FormularioSolicitacaoProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [protocoloGerado, setProtocoloGerado] = useState('');
  const [errosValidacao, setErrosValidacao] = useState<string[]>([]);

  // Form fields
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [departamento, setDepartamento] = useState('');
  const [tipoMaterial, setTipoMaterial] = useState('');
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [servicos, setServicos] = useState<string[]>([]);
  const [dimensoes, setDimensoes] = useState('');
  const [cores, setCores] = useState('');
  const [referencias, setReferencias] = useState('');
  const [prioridade, setPrioridade] = useState('media');
  const [observacoes, setObservacoes] = useState('');
  const [arquivos, setArquivos] = useState<ArquivoSelecionado[]>([]);
  const [prazoEstimado, setPrazoEstimado] = useState({ dias: 0, data: '' });
  const [redesSociais, setRedesSociais] = useState<string[]>([]);
  const [tipoOutroDescricao, setTipoOutroDescricao] = useState('');

  // Máscara de telefone
  const formatarTelefone = (value: string) => {
    const numeros = value.replace(/\D/g, '');
    if (numeros.length <= 2) return `(${numeros}`;
    if (numeros.length <= 7) return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7, 11)}`;
  };

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTelefone(formatarTelefone(e.target.value));
  };

  // Calcular data de entrega
  const calcularDataEntrega = (diasUteis: number): string => {
    let data = new Date();
    let diasAdicionados = 0;
    while (diasAdicionados < diasUteis) {
      data.setDate(data.getDate() + 1);
      if (data.getDay() !== 0 && data.getDay() !== 6) {
        diasAdicionados++;
      }
    }
    return data.toLocaleDateString('pt-BR');
  };

  // Atualizar prazo quando tipo de material mudar
  useEffect(() => {
    const tipo = TIPOS_MATERIAL.find(t => t.value === tipoMaterial);
    if (tipo) {
      setPrazoEstimado({
        dias: tipo.dias,
        data: calcularDataEntrega(tipo.dias)
      });
    }
  }, [tipoMaterial]);

  // Formatação de tamanho de arquivo
  const formatarTamanho = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Gerenciar arquivos
  const handleArquivosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const novosArquivos: ArquivoSelecionado[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validar tamanho (10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert(`Arquivo ${file.name} excede o limite de 10MB`);
        continue;
      }

      // Validar quantidade
      if (arquivos.length + novosArquivos.length >= 5) {
        alert('Máximo de 5 arquivos permitido');
        break;
      }

      novosArquivos.push({
        file,
        nome: file.name,
        tamanho: file.size
      });
    }

    setArquivos([...arquivos, ...novosArquivos]);
    e.target.value = '';
  };

  const removerArquivo = (nomeArquivo: string) => {
    setArquivos(arquivos.filter(a => a.nome !== nomeArquivo));
  };

  // Toggle serviço
  const toggleServico = (servico: string) => {
    setServicos(prev =>
      prev.includes(servico)
        ? prev.filter(s => s !== servico)
        : [...prev, servico]
    );
  };

  const toggleRedeSocial = (rede: string) => {
    setRedesSociais(prev =>
      prev.includes(rede)
        ? prev.filter(r => r !== rede)
        : [...prev, rede]
    );
  };

  // Gerar protocolo
  const gerarProtocolo = (): string => {
    const ano = new Date().getFullYear();
    const mes = String(new Date().getMonth() + 1).padStart(2, '0');
    const sequencial = Date.now().toString().slice(-6);
    return `SB-DG-${ano}${mes}-${sequencial}`;
  };

  // Criar card no Trello
  const criarCardTrello = async (dados: any) => {
    const descricaoCard = `**📋 SOLICITAÇÃO DE DESIGN**
**Protocolo:** ${dados.protocolo}

**👤 SOLICITANTE**
- **Nome:** ${dados.nome}
- **E-mail:** ${dados.email}
- **WhatsApp:** ${dados.telefone}
- **Departamento:** ${dados.departamento}

**🎨 DETALHES DO PROJETO**
- **Tipo:** ${dados.tipo}
- **Título:** ${dados.titulo}
- **Descrição:** ${dados.descricao}
- **Serviços:** ${dados.servicos}
- **Redes Sociais:** ${dados.redesSociais || 'Não especificado'}
${dados.tipoOutroDescricao ? `- **Descrição (Outro):** ${dados.tipoOutroDescricao}` : ''}

**📐 ESPECIFICAÇÕES**
- **Dimensões:** ${dados.dimensoes || 'Não especificado'}
- **Cores:** ${dados.cores || 'Não especificado'}
- **Referências:** ${dados.referencias || 'Não especificado'}

**⚡ PRIORIDADE:** ${dados.prioridade.toUpperCase()}
**📅 PRAZO DE ENTREGA:** ${dados.dataEntrega}

**💬 OBSERVAÇÕES**
${dados.observacoes || 'Sem observações'}

**📅 Data da Solicitação:** ${dados.dataEnvio}`;

    const dataEntregaISO = new Date(dados.dataEntrega.split('/').reverse().join('-'));

    const cardData = {
      name: `[${dados.prioridade.toUpperCase()}] ${dados.titulo} - ${dados.departamento}`,
      desc: descricaoCard,
      pos: 'top',
      idList: TRELLO_CONFIG.listId,
      due: dataEntregaISO.toISOString(),
      key: TRELLO_CONFIG.apiKey,
      token: TRELLO_CONFIG.token
    };

    const response = await fetch('https://api.trello.com/1/cards', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(cardData)
    });

    if (!response.ok) {
      throw new Error(`Erro ${response.status}`);
    }

    return await response.json();
  };

  // Anexar arquivos ao Trello
  const anexarArquivosTrello = async (cardId: string, arquivosParaAnexar: ArquivoSelecionado[]) => {
    for (const arquivo of arquivosParaAnexar) {
      const formData = new FormData();
      formData.append('file', arquivo.file);
      formData.append('key', TRELLO_CONFIG.apiKey);
      formData.append('token', TRELLO_CONFIG.token);

      await fetch(`https://api.trello.com/1/cards/${cardId}/attachments`, {
        method: 'POST',
        body: formData
      });
    }
  };

  // Salvar solicitação
  const salvarSolicitacao = (dados: any, trelloCardId: string | null = null) => {
    const solicitacao = {
      id: dados.protocolo,
      protocolo: dados.protocolo,
      status: 'novo',
      trelloCardId: trelloCardId,
      trelloPendente: !trelloCardId,
      dataCriacao: new Date().toISOString(),
      dataEntrega: dados.dataEntrega,
      ultimaAtualizacao: new Date().toISOString(),
      solicitante: {
        nome: dados.nome,
        email: dados.email,
        telefone: dados.telefone,
        departamento: dados.departamento
      },
      projeto: {
        tipo: dados.tipo,
        tipoOutroDescricao: dados.tipoOutroDescricao || '',
        titulo: dados.titulo,
        descricao: dados.descricao,
        servicos: dados.servicosArray,
        redesSociais: dados.redesSociaisArray || [],
        especificacoes: {
          dimensoes: dados.dimensoes,
          cores: dados.cores,
          referencias: dados.referencias
        }
      },
      prioridade: dados.prioridade,
      observacoes: dados.observacoes,
      arquivos: dados.arquivosInfo,
      criadoPor: isAdmin ? adminNome : null,
      historico: [
        {
          data: new Date().toISOString(),
          acao: 'Solicitação criada',
          usuario: isAdmin ? adminNome : 'Sistema'
        }
      ]
    };

    const existentes = JSON.parse(localStorage.getItem('solicitacoes_sbstudio') || '[]');
    existentes.push(solicitacao);
    localStorage.setItem('solicitacoes_sbstudio', JSON.stringify(existentes));

    return solicitacao;
  };

  // Submit do formulário
  const handleSubmit = async () => {
    // Validações com feedback visual
    const erros: string[] = [];
    if (!nome) erros.push('Nome');
    if (!email) erros.push('E-mail');
    if (!telefone) erros.push('Telefone');
    if (!departamento) erros.push('Departamento');
    if (!tipoMaterial) erros.push('Tipo de Material');
    if (tipoMaterial === 'outro' && !tipoOutroDescricao.trim()) erros.push('Descrição do tipo de material (Outro)');
    if (!titulo) erros.push('Título do Projeto');
    if (!descricao) erros.push('Descrição');
    if (servicos.length === 0) erros.push('Serviços (selecione pelo menos um)');

    if (erros.length > 0) {
      setErrosValidacao(erros);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setErrosValidacao([]);

    setIsLoading(true);

    const protocolo = gerarProtocolo();
    const tipoLabel = TIPOS_MATERIAL.find(t => t.value === tipoMaterial)?.label || tipoMaterial;
    const departamentoLabel = DEPARTAMENTOS.find(d => d.value === departamento)?.label || departamento;

    const dados = {
      protocolo,
      nome,
      email,
      telefone,
      departamento: departamentoLabel,
      tipo: tipoLabel,
      tipoOutroDescricao: tipoMaterial === 'outro' ? tipoOutroDescricao : '',
      titulo,
      descricao,
      servicos: servicos.join(', '),
      servicosArray: servicos,
      redesSociais: redesSociais.join(', '),
      redesSociaisArray: redesSociais,
      dimensoes,
      cores,
      referencias,
      prioridade,
      observacoes,
      dataEntrega: prazoEstimado.data,
      dataEnvio: new Date().toLocaleString('pt-BR'),
      arquivosInfo: arquivos.map(a => ({ nome: a.nome, tamanho: a.tamanho }))
    };

    try {
      // Salvar local primeiro
      salvarSolicitacao(dados);

      // Disparar webhook para notificar admin via WhatsApp (fire-and-forget)
      sendNovaSolicitacao({
        protocolo: dados.protocolo,
        cliente: dados.nome,
        titulo: dados.titulo,
        prazo: dados.dataEntrega || 'A definir',
        linkAdmin: `${window.location.origin}/admin/solicitacoes-prefeitura`,
      });

      // Tentar enviar para Trello
      const card = await criarCardTrello(dados);

      // Atualizar com ID do Trello
      const existentes = JSON.parse(localStorage.getItem('solicitacoes_sbstudio') || '[]');
      const index = existentes.findIndex((s: any) => s.protocolo === protocolo);
      if (index !== -1) {
        existentes[index].trelloCardId = card.id;
        existentes[index].trelloPendente = false;
        localStorage.setItem('solicitacoes_sbstudio', JSON.stringify(existentes));
      }

      // Anexar arquivos
      if (arquivos.length > 0) {
        await anexarArquivosTrello(card.id, arquivos);
      }

      setProtocoloGerado(protocolo);
      setShowModal(true);

    } catch (error) {
      console.error('Erro Trello:', error);
      // Mesmo com erro no Trello, mostra o modal de sucesso pois salvou local
      setProtocoloGerado(protocolo);
      setShowModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Limpar formulário
  const limparFormulario = () => {
    setNome('');
    setEmail('');
    setTelefone('');
    setDepartamento('');
    setTipoMaterial('');
    setTipoOutroDescricao('');
    setTitulo('');
    setDescricao('');
    setServicos([]);
    setRedesSociais([]);
    setDimensoes('');
    setCores('');
    setReferencias('');
    setPrioridade('media');
    setObservacoes('');
    setArquivos([]);
    setPrazoEstimado({ dias: 0, data: '' });
  };

  const copiarProtocolo = () => {
    navigator.clipboard.writeText(protocoloGerado);
    alert('Protocolo copiado!');
  };

  const fecharModal = () => {
    setShowModal(false);
    limparFormulario();
  };

  return (
    <div className="w-full">
      {/* Header — Barra escura premium no topo */}
      <div
        className="rounded-2xl p-6 md:p-8 relative overflow-hidden"
        style={{ background: '#1A1A1A' }}
      >
        {isAdmin && (
          <span className="relative z-10 inline-block text-xs px-3 py-1 rounded-full mb-3 border font-medium" style={{ background: 'rgba(199,255,16,0.15)', color: '#C7FF10', borderColor: 'rgba(199,255,16,0.3)' }}>
            Solicitação Manual (Admin)
          </span>
        )}
        <div className="relative z-10 flex items-center justify-center gap-4">
          <img src={logoHeliodora} alt="Prefeitura de Heliodora" className="h-20 md:h-28 opacity-95" />
          <div className="text-left">
            <h2 className="text-2xl md:text-3xl font-bold text-white">Prefeitura de Heliodora</h2>
            <p className="text-zinc-400 text-sm md:text-base">Sistema de Solicitação de Material Gráfico</p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[3px]" style={{ background: 'linear-gradient(to right, transparent, #C7FF10, transparent)' }} />
      </div>

      {/* Mensagem de Erros de Validação */}
      {errosValidacao.length > 0 && (
        <div className="rounded-2xl p-5 border" style={{ background: 'rgba(239,68,68,0.06)', borderColor: 'rgba(239,68,68,0.3)', boxShadow: '0 1px 3px rgba(239,68,68,0.08)' }}>
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-sm font-semibold text-red-600">Preencha os campos obrigatórios:</p>
          </div>
          <ul className="list-disc list-inside space-y-0.5">
            {errosValidacao.map((erro, i) => (
              <li key={i} className="text-sm text-red-500">{erro}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="pt-6 space-y-5">
        {/* SEÇÃO 1: DADOS DO SOLICITANTE */}
        <div className="rounded-2xl p-6 space-y-4 border" style={{ background: '#FFFFFF', borderColor: '#E5E5E5', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#C7FF10' }}>
              <span className="text-sm font-bold" style={{ color: '#1A1A1A' }}>1</span>
            </div>
            <h3 className="text-base font-semibold tracking-wide uppercase" style={{ color: '#1A1A1A' }}>
              Dados do Solicitante
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-medium uppercase tracking-wider" style={{ color: '#888' }}>Nome Completo *</Label>
              <Input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                className="mt-1.5 rounded-xl"
                style={{ background: '#F5F5F5', border: '1px solid #E5E5E5', color: '#1A1A1A' }}
              />
            </div>
            <div>
              <Label className="text-xs font-medium uppercase tracking-wider" style={{ color: '#888' }}>E-mail *</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1.5 rounded-xl"
                style={{ background: '#F5F5F5', border: '1px solid #E5E5E5', color: '#1A1A1A' }}
              />
            </div>
            <div>
              <Label className="text-xs font-medium uppercase tracking-wider" style={{ color: '#888' }}>Telefone WhatsApp *</Label>
              <Input
                value={telefone}
                onChange={handleTelefoneChange}
                placeholder="(00) 00000-0000"
                maxLength={15}
                required
                className="mt-1.5 rounded-xl"
                style={{ background: '#F5F5F5', border: '1px solid #E5E5E5', color: '#1A1A1A' }}
              />
            </div>
            <div>
              <Label className="text-xs font-medium uppercase tracking-wider" style={{ color: '#888' }}>Departamento/Setor *</Label>
              <Select value={departamento} onValueChange={setDepartamento}>
                <SelectTrigger className="mt-1.5 rounded-xl" style={{ background: '#F5F5F5', border: '1px solid #E5E5E5', color: '#1A1A1A' }}>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent className="rounded-xl" style={{ background: '#FFFFFF', border: '1px solid #E5E5E5' }}>
                  {DEPARTAMENTOS.map(dep => {
                    const IconComponent = dep.icon;
                    return (
                      <SelectItem key={dep.value} value={dep.value} className="focus:bg-[#F5F5F5]" style={{ color: '#333' }}>
                        <span className="flex items-center gap-2">
                          <IconComponent className="h-4 w-4" style={{ color: '#999' }} />
                          {dep.label}
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* SEÇÃO 2: DETALHES DA SOLICITAÇÃO */}
        <div className="rounded-2xl p-6 space-y-4 border" style={{ background: '#FFFFFF', borderColor: '#E5E5E5', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#C7FF10' }}>
              <span className="text-sm font-bold" style={{ color: '#1A1A1A' }}>2</span>
            </div>
            <h3 className="text-base font-semibold tracking-wide uppercase" style={{ color: '#1A1A1A' }}>
              Detalhes da Solicitação
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-medium uppercase tracking-wider" style={{ color: '#888' }}>Tipo de Material *</Label>
              <Select value={tipoMaterial} onValueChange={setTipoMaterial}>
                <SelectTrigger className="mt-1.5 rounded-xl" style={{ background: '#F5F5F5', border: '1px solid #E5E5E5', color: '#1A1A1A' }}>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent className="rounded-xl" style={{ background: '#FFFFFF', border: '1px solid #E5E5E5' }}>
                  {TIPOS_MATERIAL.map(tipo => (
                    <SelectItem key={tipo.value} value={tipo.value} className="focus:bg-[#F5F5F5]" style={{ color: '#333' }}>
                      {tipo.label} ({tipo.dias} {tipo.dias === 1 ? 'dia útil' : 'dias úteis'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {prazoEstimado.dias > 0 && (
              <div className="flex items-center">
                <div className="px-4 py-2.5 rounded-xl flex items-center gap-2 w-full border" style={{ background: 'rgba(199,255,16,0.1)', color: '#4a7a00', borderColor: 'rgba(199,255,16,0.4)' }}>
                  <Calendar className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm font-medium">
                    {prazoEstimado.dias} {prazoEstimado.dias === 1 ? 'dia útil' : 'dias úteis'}
                    — Entrega: {prazoEstimado.data}
                  </span>
                </div>
              </div>
            )}
          </div>

          {tipoMaterial === 'outro' && (
            <div>
              <Label className="text-xs font-medium uppercase tracking-wider" style={{ color: '#888' }}>Descreva o tipo de material *</Label>
              <Input
                value={tipoOutroDescricao}
                onChange={(e) => setTipoOutroDescricao(e.target.value)}
                placeholder="Ex: Cartão de visita, Cardápio, etc."
                required
                className="mt-1.5 rounded-xl"
                style={{ background: '#F5F5F5', border: '1px solid #E5E5E5', color: '#1A1A1A' }}
              />
            </div>
          )}

          <div>
            <Label className="text-xs font-medium uppercase tracking-wider" style={{ color: '#888' }}>Título do Projeto *</Label>
            <Input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
              className="mt-1.5 rounded-xl"
              style={{ background: '#F5F5F5', border: '1px solid #E5E5E5', color: '#1A1A1A' }}
            />
          </div>

          <div>
            <Label className="text-xs font-medium uppercase tracking-wider" style={{ color: '#888' }}>Descrição Detalhada *</Label>
            <Textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={5}
              required
              className="mt-1.5 rounded-xl resize-none"
              style={{ background: '#F5F5F5', border: '1px solid #E5E5E5', color: '#1A1A1A' }}
            />
          </div>

          <div>
            <Label className="text-xs font-medium uppercase tracking-wider mb-3 block" style={{ color: '#888' }}>Serviços Necessários *</Label>
            <div className="flex flex-wrap gap-3">
              {[
                { id: 'criacao', label: 'Criação do Zero' },
                { id: 'adaptacao', label: 'Adaptação de Material Existente' },
                { id: 'revisao', label: 'Revisão, Ajustes e Correções' },
              ].map(servico => (
                <button
                  key={servico.id}
                  type="button"
                  onClick={() => toggleServico(servico.id)}
                  className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border"
                  style={servicos.includes(servico.id)
                    ? { background: '#C7FF10', borderColor: '#C7FF10', color: '#1A1A1A' }
                    : { background: '#F5F5F5', borderColor: '#E5E5E5', color: '#666' }
                  }
                >
                  {servicos.includes(servico.id) && <span className="mr-1.5">✓</span>}
                  {servico.label}
                </button>
              ))}
            </div>
          </div>

          {/* Redes Sociais */}
          <div>
            <Label className="text-xs font-medium uppercase tracking-wider mb-3 block" style={{ color: '#888' }}>Redes Sociais (onde será publicado)</Label>
            <div className="flex flex-wrap gap-3">
              {REDES_SOCIAIS.map(rede => (
                <button
                  key={rede.id}
                  type="button"
                  onClick={() => toggleRedeSocial(rede.id)}
                  className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border"
                  style={redesSociais.includes(rede.id)
                    ? { background: '#C7FF10', borderColor: '#C7FF10', color: '#1A1A1A' }
                    : { background: '#F5F5F5', borderColor: '#E5E5E5', color: '#666' }
                  }
                >
                  {redesSociais.includes(rede.id) && <span className="mr-1.5">✓</span>}
                  {rede.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* SEÇÃO 3: ESPECIFICAÇÕES */}
        <div className="rounded-2xl p-6 space-y-4 border" style={{ background: '#FFFFFF', borderColor: '#E5E5E5', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#C7FF10' }}>
              <span className="text-sm font-bold" style={{ color: '#1A1A1A' }}>3</span>
            </div>
            <h3 className="text-base font-semibold tracking-wide uppercase" style={{ color: '#1A1A1A' }}>
              Especificações
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-medium uppercase tracking-wider" style={{ color: '#888' }}>Dimensões/Formato</Label>
              <Input
                value={dimensoes}
                onChange={(e) => setDimensoes(e.target.value)}
                placeholder="Ex: 1080x1080px"
                className="mt-1.5 rounded-xl"
                style={{ background: '#F5F5F5', border: '1px solid #E5E5E5', color: '#1A1A1A' }}
              />
            </div>
            <div>
              <Label className="text-xs font-medium uppercase tracking-wider" style={{ color: '#888' }}>Observações sobre Cores</Label>
              <Input
                value={cores}
                onChange={(e) => setCores(e.target.value)}
                placeholder="Ex: Verde e preto"
                className="mt-1.5 rounded-xl"
                style={{ background: '#F5F5F5', border: '1px solid #E5E5E5', color: '#1A1A1A' }}
              />
            </div>
          </div>

          <div>
            <Label className="text-xs font-medium uppercase tracking-wider" style={{ color: '#888' }}>Links de Referência</Label>
            <Textarea
              value={referencias}
              onChange={(e) => setReferencias(e.target.value)}
              rows={3}
              placeholder="Cole links de referências visuais..."
              className="mt-1.5 rounded-xl resize-none"
              style={{ background: '#F5F5F5', border: '1px solid #E5E5E5', color: '#1A1A1A' }}
            />
          </div>

          <div>
            <Label className="text-xs font-medium uppercase tracking-wider mb-2 block" style={{ color: '#888' }}>Upload de Arquivos</Label>
            <div className="border-2 border-dashed rounded-2xl p-6 transition-colors duration-300" style={{ borderColor: '#D5D5D5', background: '#FAFAFA' }}>
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: '#C7FF10' }}>
                  <Upload className="h-5 w-5" style={{ color: '#1A1A1A' }} />
                </div>
                <label className="cursor-pointer text-center">
                  <span className="text-sm font-medium transition-colors" style={{ color: '#555' }}>Clique para selecionar arquivos</span>
                  <input
                    type="file"
                    multiple
                    onChange={handleArquivosChange}
                    accept="image/*,.pdf,.doc,.docx,.zip"
                    className="hidden"
                  />
                </label>
                <p className="text-xs" style={{ color: '#999' }}>
                  Aceita: imagens, PDF, DOC, DOCX, ZIP | Máx: 5 arquivos, 10MB cada
                </p>
              </div>

              {arquivos.length > 0 && (
                <div className="mt-4 space-y-2">
                  {arquivos.map(arq => (
                    <div key={arq.nome} className="flex items-center justify-between px-4 py-2.5 rounded-xl border" style={{ background: '#F0F0F0', borderColor: '#E5E5E5' }}>
                      <span className="text-sm truncate" style={{ color: '#333' }}>{arq.nome}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs" style={{ color: '#999' }}>{formatarTamanho(arq.tamanho)}</span>
                        <button
                          type="button"
                          onClick={() => removerArquivo(arq.nome)}
                          className="text-red-400 hover:text-red-500 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SEÇÃO 4: OBSERVAÇÕES */}
        <div className="rounded-2xl p-6 space-y-4 border" style={{ background: '#FFFFFF', borderColor: '#E5E5E5', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#C7FF10' }}>
              <span className="text-sm font-bold" style={{ color: '#1A1A1A' }}>4</span>
            </div>
            <h3 className="text-base font-semibold tracking-wide uppercase" style={{ color: '#1A1A1A' }}>
              Observações
            </h3>
          </div>

          <Textarea
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            rows={4}
            placeholder="Observações adicionais..."
            className="rounded-xl resize-none"
            style={{ background: '#F5F5F5', border: '1px solid #E5E5E5', color: '#1A1A1A' }}
          />
        </div>

        {/* INFO BOX */}
        <div className="p-4 rounded-xl flex items-start gap-3 border" style={{ background: '#FAFAFA', borderColor: '#E5E5E5' }}>
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: '#999' }} />
          <p className="text-sm" style={{ color: '#666' }}>
            Após o envio, o pedido será enviado por sistema.
            O prazo será calculado com base no tipo de material.
          </p>
        </div>

        {/* BOTÕES */}
        <div className="flex flex-col sm:flex-row gap-4 pt-2 pb-4">
          <Button
            type="button"
            variant="secondary"
            onClick={limparFormulario}
            className="rounded-xl transition-all font-medium border"
            style={{ background: '#FFFFFF', color: '#666', borderColor: '#E5E5E5' }}
          >
            Limpar Formulário
          </Button>
          <Button
            type="button"
            disabled={isLoading}
            onClick={handleSubmit}
            className="font-semibold flex-1 rounded-xl transition-all duration-300"
            style={{ background: '#1A1A1A', color: '#FFFFFF' }}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Enviando...
              </>
            ) : (
              'Enviar Solicitação'
            )}
          </Button>
        </div>
      </form>

      {/* Modal de Confirmação */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="rounded-2xl p-8 max-w-md w-full text-center border" style={{ background: '#FFFFFF', borderColor: '#E5E5E5', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#C7FF10' }}>
              <CheckCircle className="h-8 w-8" style={{ color: '#1A1A1A' }} />
            </div>
            <h3 className="text-2xl font-bold mb-2" style={{ color: '#1A1A1A' }}>
              Solicitação Enviada!
            </h3>
            <p className="text-sm mb-4" style={{ color: '#666' }}>
              Guarde seu protocolo para acompanhar o andamento:
            </p>
            <div className="flex items-center gap-2 justify-center mb-4">
              <div className="px-5 py-3 rounded-xl text-lg font-bold tracking-widest" style={{ background: '#F5F5F5', border: '2px solid #C7FF10', color: '#1A1A1A' }}>
                {protocoloGerado}
              </div>
              <button
                type="button"
                onClick={copiarProtocolo}
                className="p-3 rounded-xl transition-all hover:scale-105 border"
                style={{ background: '#F5F5F5', borderColor: '#E5E5E5' }}
                title="Copiar protocolo"
              >
                <Copy className="h-5 w-5" style={{ color: '#1A1A1A' }} />
              </button>
            </div>
            <p className="mb-2" style={{ color: '#666' }}>
              Seu pedido foi enviado e nossa equipe já foi notificada.
            </p>
            <p className="text-sm mb-4" style={{ color: '#999' }}>
              Consulte o andamento em <strong style={{ color: '#1A1A1A' }}>/prefeitura/consultar</strong>
            </p>
            <Button
              onClick={fecharModal}
              className="font-semibold w-full rounded-xl"
              style={{ background: '#1A1A1A', color: '#FFFFFF' }}
            >
              Entendido
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormularioSolicitacao;
