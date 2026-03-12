import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  ChevronDown, ChevronUp, Trophy, MapPin, Calendar, Clock,
  Shirt, AlertCircle, CheckCircle, User, Phone, Mail,
  Heart, Users, Download, ArrowLeft, Timer, Loader2
} from 'lucide-react';
import jsPDF from 'jspdf';

const MAX_VAGAS = 300;

// ─── Validação de CPF ────────────────────────────────────────────────
function validarCPF(cpf: string): boolean {
  const c = cpf.replace(/\D/g, '');
  if (c.length !== 11 || /^(\d)\1{10}$/.test(c)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(c[i]) * (10 - i);
  let r = (sum * 10) % 11;
  if (r === 10 || r === 11) r = 0;
  if (r !== parseInt(c[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(c[i]) * (11 - i);
  r = (sum * 10) % 11;
  if (r === 10 || r === 11) r = 0;
  return r === parseInt(c[10]);
}

function formatCPF(v: string) {
  return v.replace(/\D/g, '').slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}
function formatPhone(v: string) {
  return v.replace(/\D/g, '').slice(0, 11)
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2');
}
function formatCEP(v: string) {
  return v.replace(/\D/g, '').slice(0, 8).replace(/(\d{5})(\d)/, '$1-$2');
}
function calcularIdade(dataNasc: string): number {
  if (!dataNasc) return 99;
  const nasc = new Date(dataNasc);
  const hoje = new Date();
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
  return idade;
}

// ─── Tipos ────────────────────────────────────────────────────────────
interface FormData {
  nome_completo: string; data_nascimento: string; sexo: string;
  cpf: string; rg: string; telefone: string; email: string;
  cep: string; logradouro: string; numero: string; complemento: string;
  bairro: string; cidade: string; estado: string;
  tamanho_camiseta: string; equipe_assessoria: string;
  contato_emergencia: string; telefone_emergencia: string;
  possui_problema_saude: string; descricao_problema_saude: string;
  nome_responsavel: string; cpf_responsavel: string;
  aceitou_regulamento: boolean; declarou_apto: boolean;
  ciente_inscricao_intransferivel: boolean; ciente_alimento: boolean;
}

const initialForm: FormData = {
  nome_completo: '', data_nascimento: '', sexo: '', cpf: '', rg: '',
  telefone: '', email: '', cep: '', logradouro: '', numero: '',
  complemento: '', bairro: '', cidade: '', estado: '',
  tamanho_camiseta: '', equipe_assessoria: '',
  contato_emergencia: '', telefone_emergencia: '',
  possui_problema_saude: 'nao', descricao_problema_saude: '',
  nome_responsavel: '', cpf_responsavel: '',
  aceitou_regulamento: false, declarou_apto: false,
  ciente_inscricao_intransferivel: false, ciente_alimento: false,
};

// ─── Accordion ────────────────────────────────────────────────────────
function Accordion({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-blue-200 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-5 bg-blue-50 hover:bg-blue-100 transition font-semibold text-blue-900 text-left"
      >
        <span>{title}</span>
        {open ? <ChevronUp className="w-5 h-5 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 flex-shrink-0" />}
      </button>
      {open && <div className="p-5 bg-white text-gray-700 text-sm leading-relaxed space-y-3">{children}</div>}
    </div>
  );
}

// ─── Geração de PDF comprovante ───────────────────────────────────────
function gerarPDF(dados: { nome: string; numero: string; dataHora: string }) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const w = 210; const margin = 20;

  // Fundo
  doc.setFillColor(1, 52, 116);
  doc.rect(0, 0, w, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16); doc.setFont('helvetica', 'bold');
  doc.text('PREFEITURA MUNICIPAL DE HELIODORA - MG', w / 2, 15, { align: 'center' });
  doc.setFontSize(12); doc.setFont('helvetica', 'normal');
  doc.text('1ª Corrida de Conscientização do Autismo', w / 2, 25, { align: 'center' });
  doc.setFontSize(10);
  doc.text('COMPROVANTE DE INSCRIÇÃO', w / 2, 33, { align: 'center' });

  // Conteúdo
  doc.setTextColor(30, 30, 30);
  let y = 55;
  const row = (label: string, value: string) => {
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
    doc.text(label, margin, y);
    doc.setFont('helvetica', 'normal');
    doc.text(value, margin + 45, y);
    y += 8;
  };

  doc.setFillColor(239, 246, 255);
  doc.roundedRect(margin - 2, 48, w - margin * 2 + 4, 70, 3, 3, 'F');

  row('Número de Inscrição:', dados.numero);
  row('Nome:', dados.nome);
  row('Data/Hora da Inscrição:', dados.dataHora);
  row('Evento:', '1ª Corrida de Conscientização do Autismo');
  row('Data da Corrida:', '12/04/2026 — 07:00h');
  row('Local:', 'Praça de Esporte José Damasceno Ferreira');
  row('Distância:', '7 km');
  row('Cidade:', 'Heliodora - MG');

  y = 130;
  doc.setFillColor(255, 237, 213);
  doc.roundedRect(margin - 2, y, w - margin * 2 + 4, 28, 3, 3, 'F');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(10);
  doc.setTextColor(154, 52, 18);
  doc.text('⚠ Atenção:', margin + 2, y + 8);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
  doc.setTextColor(120, 40, 10);
  doc.text('Entregue 1 kg de alimento não perecível na retirada do kit.', margin + 2, y + 16);
  doc.text('Retirada do kit: 11/04/2026 e 12/04/2026 até 30 min antes da largada.', margin + 2, y + 23);

  y = 170;
  doc.setTextColor(30, 30, 30);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
  doc.text('Instruções Importantes', margin, y); y += 8;
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
  const instrucoes = [
    '• Apresente este comprovante na retirada do kit.',
    '• Use obrigatoriamente o número de peito durante a prova.',
    '• Inscrição pessoal e intransferível.',
    '• Recomenda-se avaliação médica antes da participação.',
    '• Para dúvidas: Diretoria de Esporte e Lazer — Heliodora/MG',
  ];
  instrucoes.forEach(linha => { doc.text(linha, margin, y); y += 7; });

  // Rodapé
  doc.setFillColor(1, 52, 116);
  doc.rect(0, 280, w, 17, 'F');
  doc.setTextColor(255, 255, 255); doc.setFontSize(8);
  doc.text(`Comprovante gerado em ${dados.dataHora} — Prefeitura Municipal de Heliodora/MG`, w / 2, 290, { align: 'center' });

  doc.save(`Inscricao_${dados.numero.replace(/-/g, '_')}.pdf`);
}

// ─── Componente principal ─────────────────────────────────────────────
export default function CorridaAutismo() {
  const [form, setForm] = useState<FormData>(initialForm);
  const [erros, setErros] = useState<Partial<Record<keyof FormData | 'geral', string>>>({});
  const [enviando, setEnviando] = useState(false);
  const [inscricaoFeita, setInscricaoFeita] = useState<{ numero: string; dataHora: string } | null>(null);
  const [totalInscritos, setTotalInscritos] = useState(0);
  const [regulamentoOpen, setRegulamentoOpen] = useState(false);

  const vagasRestantes = Math.max(0, MAX_VAGAS - totalInscritos);
  const esgotado = totalInscritos >= MAX_VAGAS;
  const menorIdade = form.data_nascimento ? calcularIdade(form.data_nascimento) < 18 : false;

  // Buscar contagem de inscritos
  useEffect(() => {
    const buscar = async () => {
      const { count } = await supabase
        .from('inscricoes_corrida_autismo')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'confirmada');
      setTotalInscritos(count ?? 0);
    };
    buscar();
    const interval = setInterval(buscar, 30000);
    return () => clearInterval(interval);
  }, []);

  // Busca CEP
  const buscarCEP = async (cep: string) => {
    const raw = cep.replace(/\D/g, '');
    if (raw.length !== 8) return;
    try {
      const res = await fetch(`https://viacep.com.br/ws/${raw}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setForm(f => ({
          ...f,
          logradouro: data.logradouro || f.logradouro,
          bairro: data.bairro || f.bairro,
          cidade: data.localidade || f.cidade,
          estado: data.uf || f.estado,
        }));
      }
    } catch (_) { /* silencioso */ }
  };

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    let val: string | boolean = type === 'checkbox' ? checked : value;

    if (name === 'cpf') val = formatCPF(value);
    if (name === 'telefone' || name === 'telefone_emergencia') val = formatPhone(value);
    if (name === 'cep') { val = formatCEP(value); buscarCEP(value); }
    if (name === 'cpf_responsavel') val = formatCPF(value);

    setForm(f => ({ ...f, [name]: val }));
    setErros(e2 => ({ ...e2, [name]: '' }));
  };

  const validar = (): boolean => {
    const e: typeof erros = {};
    if (!form.nome_completo.trim()) e.nome_completo = 'Nome obrigatório';
    if (!form.data_nascimento) e.data_nascimento = 'Data de nascimento obrigatória';
    if (!form.sexo) e.sexo = 'Selecione o sexo';
    if (!form.cpf || form.cpf.replace(/\D/g,'').length !== 11) e.cpf = 'CPF inválido';
    else if (!validarCPF(form.cpf)) e.cpf = 'CPF inválido (dígitos verificadores)';
    if (!form.telefone) e.telefone = 'Telefone obrigatório';
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'E-mail inválido';
    if (!form.cidade.trim()) e.cidade = 'Cidade obrigatória';
    if (!form.tamanho_camiseta) e.tamanho_camiseta = 'Selecione o tamanho';
    if (!form.contato_emergencia.trim()) e.contato_emergencia = 'Contato de emergência obrigatório';
    if (!form.telefone_emergencia) e.telefone_emergencia = 'Telefone de emergência obrigatório';
    if (form.possui_problema_saude === 'sim' && !form.descricao_problema_saude.trim())
      e.descricao_problema_saude = 'Descreva a condição de saúde';
    if (menorIdade) {
      if (!form.nome_responsavel.trim()) e.nome_responsavel = 'Nome do responsável obrigatório para menores';
      if (!form.cpf_responsavel || !validarCPF(form.cpf_responsavel)) e.cpf_responsavel = 'CPF do responsável inválido';
    }
    if (!form.declarou_apto) e.declarou_apto = 'Declaração obrigatória';
    if (!form.aceitou_regulamento) e.aceitou_regulamento = 'Aceite do regulamento obrigatório';
    if (!form.ciente_inscricao_intransferivel) e.ciente_inscricao_intransferivel = 'Aceite obrigatório';
    if (!form.ciente_alimento) e.ciente_alimento = 'Aceite obrigatório';

    setErros(e);
    return Object.keys(e).length === 0;
  };

  const enviar = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (esgotado) { toast.error('As inscrições estão encerradas. Limite de 300 vagas atingido.'); return; }
    if (!validar()) { toast.error('Corrija os campos destacados antes de enviar.'); return; }

    setEnviando(true);
    try {
      // Verificar vaga no momento do envio
      const { count } = await supabase
        .from('inscricoes_corrida_autismo')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'confirmada');
      if ((count ?? 0) >= MAX_VAGAS) {
        toast.error('As vagas foram esgotadas enquanto você preenchia o formulário!');
        setTotalInscritos(count ?? 0);
        setEnviando(false);
        return;
      }

      const payload = {
        nome_completo: form.nome_completo.trim(),
        data_nascimento: form.data_nascimento,
        sexo: form.sexo,
        cpf: form.cpf.replace(/\D/g, ''),
        rg: form.rg.trim() || null,
        telefone: form.telefone.replace(/\D/g, ''),
        email: form.email.trim().toLowerCase(),
        cep: form.cep.replace(/\D/g, '') || null,
        logradouro: form.logradouro.trim() || null,
        numero: form.numero.trim() || null,
        complemento: form.complemento.trim() || null,
        bairro: form.bairro.trim() || null,
        cidade: form.cidade.trim(),
        estado: form.estado.trim() || null,
        tamanho_camiseta: form.tamanho_camiseta,
        equipe_assessoria: form.equipe_assessoria.trim() || null,
        contato_emergencia: form.contato_emergencia.trim(),
        telefone_emergencia: form.telefone_emergencia.replace(/\D/g, ''),
        possui_problema_saude: form.possui_problema_saude === 'sim',
        descricao_problema_saude: form.possui_problema_saude === 'sim' ? form.descricao_problema_saude.trim() : null,
        menor_de_idade: menorIdade,
        nome_responsavel: menorIdade ? form.nome_responsavel.trim() : null,
        cpf_responsavel: menorIdade ? form.cpf_responsavel.replace(/\D/g, '') : null,
        aceitou_regulamento: form.aceitou_regulamento,
        declarou_apto: form.declarou_apto,
        ciente_inscricao_intransferivel: form.ciente_inscricao_intransferivel,
        ciente_alimento: form.ciente_alimento,
        status: 'confirmada',
      };

      const { data, error } = await supabase
        .from('inscricoes_corrida_autismo')
        .insert(payload)
        .select('numero_inscricao, data_hora_inscricao')
        .single();

      if (error) {
        if (error.code === '23505') {
          toast.error('Já existe uma inscrição vinculada a este CPF.');
          setErros(e => ({ ...e, cpf: 'CPF já cadastrado.' }));
        } else {
          toast.error('Erro ao salvar inscrição. Tente novamente.');
          console.error(error);
        }
        return;
      }

      const dataHora = new Date(data.data_hora_inscricao).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
      setInscricaoFeita({ numero: data.numero_inscricao, dataHora });
      setTotalInscritos(t => t + 1);
      toast.success('Inscrição realizada com sucesso!');
    } catch (err) {
      toast.error('Erro inesperado. Tente novamente.');
      console.error(err);
    } finally {
      setEnviando(false);
    }
  };

  // ─── Tela de Sucesso ────────────────────────────────────────────────
  if (inscricaoFeita) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-cyan-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden">
          <div className="bg-gradient-to-r from-blue-800 to-cyan-700 px-8 py-10 text-center text-white">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold mb-1">Inscrição Confirmada!</h1>
            <p className="text-blue-200 text-sm">1ª Corrida de Conscientização do Autismo</p>
          </div>
          <div className="px-8 py-6 space-y-4">
            <div className="bg-blue-50 rounded-2xl p-4 text-center">
              <p className="text-xs text-blue-500 uppercase tracking-widest font-bold mb-1">Número de Inscrição</p>
              <p className="text-3xl font-black text-blue-800 tracking-wider">{inscricaoFeita.numero}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                { label: 'Data da Corrida', value: '12/04/2026' },
                { label: 'Largada', value: '07:00h' },
                { label: 'Distância', value: '7 km' },
                { label: 'Inscrição realizada', value: inscricaoFeita.dataHora },
              ].map(i => (
                <div key={i.label} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-gray-400 text-xs">{i.label}</p>
                  <p className="font-semibold text-gray-800 text-xs mt-0.5">{i.value}</p>
                </div>
              ))}
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
              <p className="font-bold mb-1">⚠ Lembrete</p>
              <p>Entregue <strong>1 kg de alimento não perecível</strong> na retirada do kit.</p>
              <p className="mt-1">Retirada: <strong>11/04</strong> e <strong>12/04/2026 até 30 min antes da largada</strong>.</p>
            </div>
            <button
              onClick={() => gerarPDF({ nome: form.nome_completo, numero: inscricaoFeita.numero, dataHora: inscricaoFeita.dataHora })}
              className="w-full flex items-center justify-center gap-2 bg-blue-800 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition"
            >
              <Download className="w-4 h-4" /> Baixar Comprovante PDF
            </button>
            <a
              href="/corridadoautismo"
              onClick={e => { e.preventDefault(); setInscricaoFeita(null); setForm(initialForm); }}
              className="block text-center text-sm text-gray-400 hover:text-gray-600 transition"
            >
              Voltar à página
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ─── Página principal ───────────────────────────────────────────────
  const pct = Math.min(100, Math.round((totalInscritos / MAX_VAGAS) * 100));

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-blue-950 via-blue-900 to-cyan-800 text-white">
        <div className="max-w-5xl mx-auto px-4 py-16 text-center">
          {/* Ícone Puzzle (identidade autismo) */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 rounded-full px-5 py-2 text-sm font-medium mb-6">
            <span className="text-2xl">🧩</span>
            <span>Prefeitura Municipal de Heliodora — MG</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black mb-3 leading-tight tracking-tight">
            1ª Corrida de<br className="hidden sm:block" />
            <span className="text-cyan-300"> Conscientização do Autismo</span>
          </h1>
          <p className="text-blue-200 text-lg mb-8 max-w-2xl mx-auto">
            Participar é uma forma de apoio. Venha correr pela causa e fazer a diferença!
          </p>
          {/* Info destaque */}
          <div className="flex flex-wrap justify-center gap-4 mb-10">
            {[
              { Icon: Calendar, label: '12/04/2026' },
              { Icon: Timer, label: 'Largada 07:00h' },
              { Icon: MapPin, label: 'Heliodora - MG' },
              { Icon: Trophy, label: '7 km' },
            ].map(({ Icon, label }) => (
              <div key={label} className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-sm font-medium">
                <Icon className="w-4 h-4 text-cyan-300" />
                {label}
              </div>
            ))}
          </div>
          {/* Contador de vagas */}
          <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-6 max-w-md mx-auto">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-blue-200">Inscrições realizadas</span>
              <span className="font-bold text-white">{totalInscritos}/{MAX_VAGAS}</span>
            </div>
            <div className="h-3 bg-white/10 rounded-full overflow-hidden mb-2">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, background: pct >= 90 ? '#ef4444' : pct >= 70 ? '#f59e0b' : '#22d3ee' }}
              />
            </div>
            <p className={`text-sm font-semibold ${esgotado ? 'text-red-400' : 'text-cyan-300'}`}>
              {esgotado ? 'Inscrições encerradas — limite de 300 vagas atingido' : `${vagasRestantes} vagas restantes`}
            </p>
          </div>
        </div>
      </div>

      {/* ── INFORMAÇÕES DO EVENTO ────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Informações do Evento</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {[
            { Icon: Calendar, titulo: 'Data', desc: '12 de abril de 2026', cor: 'text-blue-600', bg: 'bg-blue-50' },
            { Icon: Clock, titulo: 'Largada', desc: '07:00h', cor: 'text-cyan-600', bg: 'bg-cyan-50' },
            { Icon: MapPin, titulo: 'Local', desc: 'Praça de Esporte José Damasceno Ferreira', cor: 'text-green-600', bg: 'bg-green-50' },
            { Icon: Trophy, titulo: 'Distância', desc: '7 km', cor: 'text-amber-600', bg: 'bg-amber-50' },
            { Icon: Shirt, titulo: 'Inscrição', desc: '1 kg de alimento não perecível', cor: 'text-purple-600', bg: 'bg-purple-50' },
            { Icon: Heart, titulo: 'Premiação', desc: 'Troféu: Top 5 M/F • Medalha: todos que concluírem', cor: 'text-rose-600', bg: 'bg-rose-50' },
          ].map(({ Icon, titulo, desc, cor, bg }) => (
            <div key={titulo} className={`${bg} rounded-2xl p-5 border border-white shadow-sm`}>
              <Icon className={`w-6 h-6 ${cor} mb-2`} />
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">{titulo}</p>
              <p className="text-gray-800 font-medium mt-1 text-sm">{desc}</p>
            </div>
          ))}
        </div>

        {/* ── INFORMAÇÕES ADICIONAIS ────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow border border-gray-100 p-6 mb-8">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500" /> Informações Adicionais
          </h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>📅 Inscrições até <strong>07/04/2026</strong> ou até atingir o limite de 300 participantes</li>
            <li>👕 Kit contém: <strong>camiseta, número de peito, chip e alfinetes</strong></li>
            <li>📦 Retirada do kit: <strong>11/04/2026</strong> e <strong>12/04/2026</strong> (até 30 min antes da largada)</li>
            <li>🏆 Troféu para os <strong>5 primeiros colocados</strong> masculino e feminino</li>
            <li>🥇 <strong>Medalha de participação</strong> para todos que concluírem a prova</li>
            <li>🍌 Ao final: <strong>frutas, água e café da manhã</strong> para todos os atletas</li>
          </ul>
        </div>

        {/* ── REGULAMENTO ──────────────────────────────────────── */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Regulamento da Corrida</h2>
          <div className="space-y-3">
            <Accordion title="1. Objetivo">
              <p>A 1ª Corrida de Conscientização do Autismo tem como objetivo promover a conscientização sobre o Transtorno do Espectro Autista (TEA), estimular a prática esportiva e integrar a comunidade em torno de uma causa de grande importância social.</p>
            </Accordion>
            <Accordion title="2. Inscrições">
              <p>• As inscrições são gratuitas e serão realizadas exclusivamente por meio desta plataforma.</p>
              <p>• O valor simbólico de inscrição consiste na entrega de <strong>1 kg de alimento não perecível</strong>.</p>
              <p>• Limite de <strong>300 inscrições</strong>. As vagas são limitadas e preenchidas por ordem de inscrição.</p>
              <p>• Inscrições encerram em <strong>07/04/2026</strong> ou quando as vagas se esgotarem.</p>
              <p>• A inscrição é pessoal e intransferível.</p>
              <p>• Participantes menores de 18 anos devem apresentar autorização por escrito com firma reconhecida do responsável legal, acompanhada de cópia do documento de identidade.</p>
            </Accordion>
            <Accordion title="3. Kit do Atleta">
              <p>• Cada inscrito receberá um kit contendo: <strong>camiseta oficial, número de peito, chip de cronometragem e alfinetes</strong>.</p>
              <p>• O kit será retirado nos dias <strong>11/04/2026</strong> e <strong>12/04/2026</strong> (até 30 min antes da largada).</p>
              <p>• A retirada do kit exige apresentação de documento com foto e entrega do <strong>1 kg de alimento</strong>.</p>
              <p>• O uso do número de peito é <strong>obrigatório</strong> durante toda a prova.</p>
            </Accordion>
            <Accordion title="4. Premiação">
              <p>• <strong>Troféu</strong>: 1º, 2º, 3º, 4º e 5º colocados nas categorias masculino e feminino.</p>
              <p>• <strong>Medalha de participação</strong>: todos que concluírem os 7 km.</p>
              <p>• Ao final: frutas, água e café da manhã para todos os participantes.</p>
            </Accordion>
            <Accordion title="5. Informações Gerais">
              <p>• Distância: <strong>7 km</strong>. Largada às <strong>07:00h</strong> do dia <strong>12/04/2026</strong>.</p>
              <p>• Local: <strong>Praça de Esporte José Damasceno Ferreira — Heliodora/MG</strong>.</p>
              <p>• A prova poderá ser realizada em qualquer condição climática.</p>
              <p>• A comissão organizadora pode usar imagens e filmagens oficiais da prova.</p>
            </Accordion>
            <Accordion title="6. Disposições Gerais ao Atleta">
              <p>• O atleta declara estar em boas condições físicas e mentais para participar.</p>
              <p>• Recomenda-se <strong>avaliação médica prévia</strong> antes da participação.</p>
              <p>• A organização não se responsabiliza por incidentes fora das condições previstas no regulamento.</p>
              <p>• Participantes devem respeitar as regras de trânsito e o percurso oficial demarcado.</p>
            </Accordion>
            <Accordion title="7. Contatos da Organização">
              <p>Diretoria de Esporte e Lazer — Prefeitura Municipal de Heliodora/MG</p>
              <p>Para dúvidas ou informações adicionais, entre em contato pelo setor responsável.</p>
            </Accordion>
          </div>
        </div>

        {/* ── FORMULÁRIO ──────────────────────────────────────────── */}
        {esgotado ? (
          <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-10 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-red-800 mb-2">Inscrições Encerradas</h2>
            <p className="text-red-600">As inscrições não estão mais disponíveis. O limite de <strong>300 vagas</strong> foi atingido.</p>
          </div>
        ) : (
          <form onSubmit={enviar} noValidate className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-800 to-cyan-700 px-8 py-6 text-white">
              <h2 className="text-2xl font-bold">Formulário de Inscrição</h2>
              <p className="text-blue-200 text-sm mt-1">Preencha todos os campos obrigatórios (*)</p>
            </div>

            <div className="p-6 sm:p-8 space-y-10">
              {/* ── SEÇÃO 1: DADOS PESSOAIS ── */}
              <section>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" /> Dados Pessoais
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="label">Nome Completo *</label>
                    <input name="nome_completo" value={form.nome_completo} onChange={handle} className={`input ${erros.nome_completo ? 'border-red-400' : ''}`} placeholder="Nome completo" />
                    {erros.nome_completo && <p className="err">{erros.nome_completo}</p>}
                  </div>
                  <div>
                    <label className="label">Data de Nascimento *</label>
                    <input type="date" name="data_nascimento" value={form.data_nascimento} onChange={handle} className={`input ${erros.data_nascimento ? 'border-red-400' : ''}`} />
                    {erros.data_nascimento && <p className="err">{erros.data_nascimento}</p>}
                  </div>
                  <div>
                    <label className="label">Sexo *</label>
                    <select name="sexo" value={form.sexo} onChange={handle} className={`input ${erros.sexo ? 'border-red-400' : ''}`}>
                      <option value="">Selecione</option>
                      <option value="masculino">Masculino</option>
                      <option value="feminino">Feminino</option>
                      <option value="outro">Outro / Prefiro não informar</option>
                    </select>
                    {erros.sexo && <p className="err">{erros.sexo}</p>}
                  </div>
                  <div>
                    <label className="label">CPF *</label>
                    <input name="cpf" value={form.cpf} onChange={handle} className={`input ${erros.cpf ? 'border-red-400' : ''}`} placeholder="000.000.000-00" />
                    {erros.cpf && <p className="err">{erros.cpf}</p>}
                  </div>
                  <div>
                    <label className="label">RG</label>
                    <input name="rg" value={form.rg} onChange={handle} className="input" placeholder="RG" />
                  </div>
                  <div>
                    <label className="label">Telefone / WhatsApp *</label>
                    <input name="telefone" value={form.telefone} onChange={handle} className={`input ${erros.telefone ? 'border-red-400' : ''}`} placeholder="(35) 99999-9999" />
                    {erros.telefone && <p className="err">{erros.telefone}</p>}
                  </div>
                  <div>
                    <label className="label">E-mail *</label>
                    <input type="email" name="email" value={form.email} onChange={handle} className={`input ${erros.email ? 'border-red-400' : ''}`} placeholder="email@exemplo.com" />
                    {erros.email && <p className="err">{erros.email}</p>}
                  </div>
                </div>

                {/* Alerta menor de idade */}
                {menorIdade && (
                  <div className="mt-4 bg-amber-50 border border-amber-300 rounded-xl p-4 text-sm text-amber-800">
                    <p className="font-bold mb-1">⚠ Participante menor de 18 anos</p>
                    <p>Participantes menores de 18 anos só poderão participar mediante <strong>autorização por escrito com firma reconhecida</strong> do pai ou responsável legal, acompanhada de cópia do documento de identidade, conforme regulamento.</p>
                  </div>
                )}
              </section>

              {/* ── SEÇÃO 2: ENDEREÇO ── */}
              <section>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" /> Endereço
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">CEP</label>
                    <input name="cep" value={form.cep} onChange={handle} className="input" placeholder="00000-000" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label">Logradouro / Rua</label>
                    <input name="logradouro" value={form.logradouro} onChange={handle} className="input" placeholder="Rua, Avenida..." />
                  </div>
                  <div>
                    <label className="label">Número</label>
                    <input name="numero" value={form.numero} onChange={handle} className="input" placeholder="Nº" />
                  </div>
                  <div>
                    <label className="label">Complemento</label>
                    <input name="complemento" value={form.complemento} onChange={handle} className="input" placeholder="Apto, Bloco..." />
                  </div>
                  <div>
                    <label className="label">Bairro</label>
                    <input name="bairro" value={form.bairro} onChange={handle} className="input" placeholder="Bairro" />
                  </div>
                  <div>
                    <label className="label">Cidade *</label>
                    <input name="cidade" value={form.cidade} onChange={handle} className={`input ${erros.cidade ? 'border-red-400' : ''}`} placeholder="Cidade" />
                    {erros.cidade && <p className="err">{erros.cidade}</p>}
                  </div>
                  <div>
                    <label className="label">Estado</label>
                    <input name="estado" value={form.estado} onChange={handle} className="input" placeholder="UF" maxLength={2} />
                  </div>
                </div>
              </section>

              {/* ── SEÇÃO 3: PARTICIPAÇÃO ── */}
              <section>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Shirt className="w-5 h-5 text-blue-600" /> Dados da Participação
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Tamanho da Camiseta *</label>
                    <select name="tamanho_camiseta" value={form.tamanho_camiseta} onChange={handle} className={`input ${erros.tamanho_camiseta ? 'border-red-400' : ''}`}>
                      <option value="">Selecione</option>
                      {['PP','P','M','G','GG','XGG'].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    {erros.tamanho_camiseta && <p className="err">{erros.tamanho_camiseta}</p>}
                  </div>
                  <div>
                    <label className="label">Equipe / Assessoria / Grupo (opcional)</label>
                    <input name="equipe_assessoria" value={form.equipe_assessoria} onChange={handle} className="input" placeholder="Nome do grupo / assessoria" />
                  </div>
                  <div>
                    <label className="label">Contato de Emergência *</label>
                    <input name="contato_emergencia" value={form.contato_emergencia} onChange={handle} className={`input ${erros.contato_emergencia ? 'border-red-400' : ''}`} placeholder="Nome completo" />
                    {erros.contato_emergencia && <p className="err">{erros.contato_emergencia}</p>}
                  </div>
                  <div>
                    <label className="label">Telefone do Contato de Emergência *</label>
                    <input name="telefone_emergencia" value={form.telefone_emergencia} onChange={handle} className={`input ${erros.telefone_emergencia ? 'border-red-400' : ''}`} placeholder="(00) 00000-0000" />
                    {erros.telefone_emergencia && <p className="err">{erros.telefone_emergencia}</p>}
                  </div>
                </div>
              </section>

              {/* ── SEÇÃO 4: SAÚDE ── */}
              <section>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-blue-600" /> Saúde e Responsabilidade
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="label">Possui algum problema de saúde, restrição médica ou condição que exija atenção? *</label>
                    <div className="flex gap-4 mt-2">
                      {[{ v: 'nao', l: 'Não' }, { v: 'sim', l: 'Sim' }].map(({ v, l }) => (
                        <label key={v} className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="possui_problema_saude" value={v} checked={form.possui_problema_saude === v} onChange={handle} className="accent-blue-600" />
                          <span className="text-sm text-gray-700">{l}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  {form.possui_problema_saude === 'sim' && (
                    <div>
                      <label className="label">Descreva a condição ou observação de saúde *</label>
                      <textarea name="descricao_problema_saude" value={form.descricao_problema_saude} onChange={handle} rows={3} className={`input resize-none ${erros.descricao_problema_saude ? 'border-red-400' : ''}`} placeholder="Descreva a condição..." />
                      {erros.descricao_problema_saude && <p className="err">{erros.descricao_problema_saude}</p>}
                    </div>
                  )}
                  <div className="space-y-3 pt-2">
                    {[
                      { name: 'declarou_apto', label: 'Declaro estar em condições físicas e mentais adequadas para participar da prova.' },
                      { name: 'aceitou_regulamento', label: 'Li e aceito o regulamento da corrida.' },
                      { name: 'ciente_inscricao_intransferivel', label: 'Estou ciente de que a inscrição é pessoal e intransferível.' },
                      { name: 'ciente_alimento', label: 'Estou ciente da necessidade de entregar 1 kg de alimento não perecível.' },
                    ].map(({ name, label }) => (
                      <label key={name} className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${(erros as Record<string,string>)[name] ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                        <input type="checkbox" name={name} checked={(form as Record<string,boolean>)[name]} onChange={handle} className="mt-0.5 accent-blue-600" />
                        <span className="text-sm text-gray-700">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </section>

              {/* ── SEÇÃO 5: MENOR DE IDADE ── */}
              {menorIdade && (
                <section>
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-amber-500" /> Responsável Legal (menor de idade)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Nome do Responsável Legal *</label>
                      <input name="nome_responsavel" value={form.nome_responsavel} onChange={handle} className={`input ${erros.nome_responsavel ? 'border-red-400' : ''}`} placeholder="Nome completo" />
                      {erros.nome_responsavel && <p className="err">{erros.nome_responsavel}</p>}
                    </div>
                    <div>
                      <label className="label">CPF do Responsável Legal *</label>
                      <input name="cpf_responsavel" value={form.cpf_responsavel} onChange={handle} className={`input ${erros.cpf_responsavel ? 'border-red-400' : ''}`} placeholder="000.000.000-00" />
                      {erros.cpf_responsavel && <p className="err">{erros.cpf_responsavel}</p>}
                    </div>
                  </div>
                </section>
              )}

              {/* ── BOTÃO ── */}
              <button
                type="submit"
                disabled={enviando}
                className="w-full bg-gradient-to-r from-blue-800 to-cyan-700 hover:from-blue-700 hover:to-cyan-600 text-white font-bold py-4 rounded-2xl text-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {enviando ? <><Loader2 className="w-5 h-5 animate-spin" /> Enviando inscrição...</> : 'Confirmar Inscrição'}
              </button>
              <p className="text-center text-xs text-gray-400">
                Ao enviar, você confirma que leu e aceita o regulamento e todas as declarações marcadas acima.
              </p>
            </div>
          </form>
        )}
      </div>

      {/* ── FOOTER ── */}
      <footer className="bg-blue-950 text-white mt-16 py-8 text-center text-sm">
        <p className="font-semibold">Prefeitura Municipal de Heliodora — MG</p>
        <p className="text-blue-300 mt-1">Diretoria de Esporte e Lazer • 1ª Corrida de Conscientização do Autismo</p>
        <p className="text-blue-400 mt-2 text-xs">🧩 Pelo respeito, pela inclusão, pelo amor.</p>
      </footer>

      {/* ── ESTILOS INLINE SCOPED ── */}
      <style>{`
        .label { display: block; font-size: 0.8125rem; font-weight: 600; color: #374151; margin-bottom: 0.375rem; }
        .input { width: 100%; padding: 0.625rem 0.875rem; border: 1.5px solid #e5e7eb; border-radius: 0.75rem; font-size: 0.9375rem; color: #111827; background: #f9fafb; transition: border-color 0.2s, box-shadow 0.2s; outline: none; }
        .input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.12); background: #fff; }
        textarea.input { min-height: 80px; }
        .err { font-size: 0.75rem; color: #ef4444; margin-top: 0.25rem; }
      `}</style>
    </div>
  );
}
