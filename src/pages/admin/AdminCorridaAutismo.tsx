import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Trophy, Users, Download, Search, X, ChevronRight,
  Eye, Filter, ArrowLeft, FileText, RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

const MAX_VAGAS = 300;

interface Inscrito {
  id: string;
  numero_inscricao: string;
  nome_completo: string;
  data_nascimento: string;
  sexo: string;
  cpf: string;
  rg: string | null;
  telefone: string;
  email: string;
  cep: string | null;
  logradouro: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string;
  estado: string | null;
  tamanho_camiseta: string;
  equipe_assessoria: string | null;
  contato_emergencia: string;
  telefone_emergencia: string;
  possui_problema_saude: boolean;
  descricao_problema_saude: string | null;
  menor_de_idade: boolean;
  nome_responsavel: string | null;
  cpf_responsavel: string | null;
  aceitou_regulamento: boolean;
  declarou_apto: boolean;
  ciente_inscricao_intransferivel: boolean;
  ciente_alimento: boolean;
  data_hora_inscricao: string;
  status: string;
}

function formatCPF(cpf: string) {
  if (!cpf) return '';
  const c = cpf.replace(/\D/g,'');
  return c.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}
function formatPhone(p: string) {
  if (!p) return '';
  const c = p.replace(/\D/g,'');
  return c.length === 11
    ? c.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    : c.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
}
function formatDate(d: string) {
  if (!d) return '';
  try { return new Date(d).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' }); } catch { return d; }
}
function formatDateTime(d: string) {
  if (!d) return '';
  try { return new Date(d).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }); } catch { return d; }
}

export default function AdminCorridaAutismo() {
  const navigate = useNavigate();
  const [inscritos, setInscritos] = useState<Inscrito[]>([]);
  const [loading, setLoading] = useState(true);
  const [buscaNome, setBuscaNome] = useState('');
  const [buscaCPF, setBuscaCPF] = useState('');
  const [filtroCidade, setFiltroCidade] = useState('');
  const [filtroSaude, setFiltroSaude] = useState<'' | 'sim' | 'nao'>('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [detalhe, setDetalhe] = useState<Inscrito | null>(null);

  const buscarInscritos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('inscricoes_corrida_autismo')
        .select('*')
        .order('data_hora_inscricao', { ascending: false });
      if (error) throw error;
      setInscritos((data as Inscrito[]) ?? []);
    } catch (err) {
      toast.error('Erro ao carregar inscrições');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { buscarInscritos(); }, []);

  // Filtros
  const confirmados = inscritos.filter(i => i.status === 'confirmada').length;
  const cidades = [...new Set(inscritos.map(i => i.cidade))].filter(Boolean).sort();

  const filtrados = inscritos.filter(i => {
    if (buscaNome && !i.nome_completo.toLowerCase().includes(buscaNome.toLowerCase())) return false;
    if (buscaCPF && !i.cpf.replace(/\D/g,'').includes(buscaCPF.replace(/\D/g,''))) return false;
    if (filtroCidade && i.cidade !== filtroCidade) return false;
    if (filtroSaude === 'sim' && !i.possui_problema_saude) return false;
    if (filtroSaude === 'nao' && i.possui_problema_saude) return false;
    if (filtroStatus && i.status !== filtroStatus) return false;
    return true;
  });

  // ─── Exportações ──────────────────────────────────────────────────
  const exportCSV = () => {
    const cabecalho = ['Nº Inscrição','Nome','CPF','Nascimento','Telefone','E-mail','Cidade','Camiseta','Contato Emergência','Problema de Saúde','Descrição Saúde','Data Inscrição','Status'];
    const linhas = filtrados.map(i => [
      i.numero_inscricao, i.nome_completo, formatCPF(i.cpf),
      formatDate(i.data_nascimento), formatPhone(i.telefone), i.email,
      i.cidade, i.tamanho_camiseta, i.contato_emergencia,
      i.possui_problema_saude ? 'Sim' : 'Não',
      i.descricao_problema_saude || '',
      formatDateTime(i.data_hora_inscricao), i.status,
    ]);
    const conteudo = [cabecalho, ...linhas].map(r => r.join(';')).join('\n');
    const blob = new Blob(['\uFEFF' + conteudo], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `inscricoes_corrida_autismo_${new Date().toISOString().slice(0,10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  const exportExcel = () => {
    const dados = filtrados.map(i => ({
      'Nº Inscrição': i.numero_inscricao,
      'Nome Completo': i.nome_completo,
      'CPF': formatCPF(i.cpf),
      'Data Nascimento': formatDate(i.data_nascimento),
      'Sexo': i.sexo,
      'Telefone': formatPhone(i.telefone),
      'E-mail': i.email,
      'Cidade': i.cidade,
      'Estado': i.estado,
      'Camiseta': i.tamanho_camiseta,
      'Equipe/Assessoria': i.equipe_assessoria || '',
      'Contato Emergência': i.contato_emergencia,
      'Tel. Emergência': formatPhone(i.telefone_emergencia),
      'Prob. Saúde': i.possui_problema_saude ? 'Sim' : 'Não',
      'Desc. Saúde': i.descricao_problema_saude || '',
      'Menor de Idade': i.menor_de_idade ? 'Sim' : 'Não',
      'Responsável': i.nome_responsavel || '',
      'Data Inscrição': formatDateTime(i.data_hora_inscricao),
      'Status': i.status,
    }));
    const ws = XLSX.utils.json_to_sheet(dados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Inscrições');
    XLSX.writeFile(wb, `inscricoes_corrida_autismo_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  const exportPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const w = 297; const margin = 10;
    doc.setFillColor(1, 52, 116);
    doc.rect(0, 0, w, 18, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12); doc.setFont('helvetica', 'bold');
    doc.text('PREFEITURA MUNICIPAL DE HELIODORA — 1ª Corrida de Conscientização do Autismo', w / 2, 12, { align: 'center' });

    let y = 25;
    doc.setTextColor(30, 30, 30); doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total de inscrições filtradas: ${filtrados.length} | Gerado em: ${new Date().toLocaleString('pt-BR')}`, margin, y);
    y += 7;

    const cols = ['Nº', 'Nome', 'CPF', 'Telefone', 'Cidade', 'Camiseta', 'Saúde', 'Data Inscrição', 'Status'];
    const colW = [22, 60, 28, 30, 28, 18, 12, 38, 22];
    let x = margin;
    doc.setFillColor(30, 64, 175); doc.setTextColor(255, 255, 255);
    doc.rect(margin, y, w - margin * 2, 8, 'F');
    doc.setFont('helvetica', 'bold');
    cols.forEach((c, i) => { doc.text(c, x + 1, y + 5.5); x += colW[i]; });
    y += 8;

    filtrados.forEach((ins, idx) => {
      if (y > 190) {
        doc.addPage();
        y = 15;
      }
      doc.setTextColor(30, 30, 30);
      doc.setFont('helvetica', 'normal');
      if (idx % 2 === 0) {
        doc.setFillColor(239, 246, 255);
        doc.rect(margin, y, w - margin * 2, 7, 'F');
      }
      x = margin;
      const row = [
        ins.numero_inscricao,
        ins.nome_completo.slice(0, 35),
        formatCPF(ins.cpf),
        formatPhone(ins.telefone),
        ins.cidade.slice(0, 18),
        ins.tamanho_camiseta,
        ins.possui_problema_saude ? 'Sim' : 'Não',
        formatDateTime(ins.data_hora_inscricao).slice(0, 16),
        ins.status,
      ];
      row.forEach((v, i) => { doc.text(v, x + 1, y + 5); x += colW[i]; });
      y += 7;
    });

    doc.save(`lista_inscritos_corrida_autismo.pdf`);
  };

  const pct = Math.min(100, Math.round((confirmados / MAX_VAGAS) * 100));

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-gray-100 transition">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </button>
        <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl flex items-center justify-center">
          <Trophy className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Inscrições Corrida do Autismo</h1>
          <p className="text-sm text-gray-500">1ª Corrida de Conscientização do Autismo • 12/04/2026 • Heliodora - MG</p>
        </div>
        <button onClick={buscarInscritos} className="ml-auto p-2 rounded-xl hover:bg-gray-100 transition" title="Atualizar">
          <RefreshCw className={`w-5 h-5 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Cards resumo */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Inscritos', value: inscritos.length, cor: 'from-blue-500 to-cyan-500' },
          { label: 'Vagas Preenchidas', value: confirmados, cor: 'from-emerald-500 to-green-500' },
          { label: 'Vagas Restantes', value: Math.max(0, MAX_VAGAS - confirmados), cor: 'from-amber-500 to-orange-500' },
          { label: 'Preenchido', value: `${pct}%`, cor: 'from-purple-500 to-violet-500' },
        ].map(c => (
          <div key={c.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className={`text-2xl font-black bg-gradient-to-r ${c.cor} bg-clip-text text-transparent`}>{c.value}</div>
            <div className="text-xs text-gray-500 mt-1">{c.label}</div>
          </div>
        ))}
      </div>

      {/* Barra de progresso */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progresso das inscrições</span>
          <span className="font-bold">{confirmados} / {MAX_VAGAS}</span>
        </div>
        <div className="h-3.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, background: pct >= 90 ? '#ef4444' : pct >= 70 ? '#f59e0b' : '#22d3ee' }}
          />
        </div>
      </div>

      {/* Filtros + Exportações */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={buscaNome} onChange={e => setBuscaNome(e.target.value)} placeholder="Buscar por nome" className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200" />
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={buscaCPF} onChange={e => setBuscaCPF(e.target.value)} placeholder="Buscar por CPF" className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200" />
          </div>
          <select value={filtroCidade} onChange={e => setFiltroCidade(e.target.value)} className="py-2.5 px-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200">
            <option value="">Todas as cidades</option>
            {cidades.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filtroSaude} onChange={e => setFiltroSaude(e.target.value as '' | 'sim' | 'nao')} className="py-2.5 px-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200">
            <option value="">Problema de saúde: todos</option>
            <option value="sim">Sim — tem problema</option>
            <option value="nao">Não tem problema</option>
          </select>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={exportCSV} className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-medium transition">
            <Download className="w-4 h-4" /> CSV
          </button>
          <button onClick={exportExcel} className="flex items-center gap-1.5 px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white rounded-xl text-sm font-medium transition">
            <Download className="w-4 h-4" /> Excel
          </button>
          <button onClick={exportPDF} className="flex items-center gap-1.5 px-4 py-2 bg-red-700 hover:bg-red-600 text-white rounded-xl text-sm font-medium transition">
            <FileText className="w-4 h-4" /> PDF
          </button>
          {(buscaNome || buscaCPF || filtroCidade || filtroSaude) && (
            <button onClick={() => { setBuscaNome(''); setBuscaCPF(''); setFiltroCidade(''); setFiltroSaude(''); }} className="flex items-center gap-1.5 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl text-sm font-medium transition">
              <X className="w-4 h-4" /> Limpar filtros
            </button>
          )}
          <span className="ml-auto self-center text-sm text-gray-400">
            {filtrados.length} resultado{filtrados.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <RefreshCw className="w-6 h-6 animate-spin mr-2" /> Carregando...
          </div>
        ) : filtrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Users className="w-12 h-12 mb-3 opacity-30" />
            <p>Nenhuma inscrição encontrada.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['Nº Inscrição','Nome','CPF','Telefone','Cidade','Camiseta','Saúde','Data','Status',''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtrados.map((ins, i) => (
                  <tr key={ins.id} className={`hover:bg-blue-50/50 transition ${i % 2 === 0 ? '' : 'bg-gray-50/50'}`}>
                    <td className="px-4 py-3 font-mono text-blue-700 font-bold whitespace-nowrap">{ins.numero_inscricao}</td>
                    <td className="px-4 py-3 font-medium text-gray-900 max-w-[200px] truncate">{ins.nome_completo}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatCPF(ins.cpf)}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatPhone(ins.telefone)}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{ins.cidade}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">{ins.tamanho_camiseta}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${ins.possui_problema_saude ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                        {ins.possui_problema_saude ? 'Sim' : 'Não'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">{formatDateTime(ins.data_hora_inscricao).slice(0,16)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${ins.status === 'confirmada' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {ins.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => setDetalhe(ins)} className="p-1.5 rounded-lg hover:bg-blue-100 transition text-blue-600">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Detalhe */}
      {detalhe && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setDetalhe(null)}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-blue-800 to-cyan-700 px-6 py-5 text-white rounded-t-3xl flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">{detalhe.nome_completo}</h2>
                <p className="text-blue-200 text-sm font-mono">{detalhe.numero_inscricao}</p>
              </div>
              <button onClick={() => setDetalhe(null)} className="p-2 rounded-xl hover:bg-white/20 transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6 text-sm">
              {[
                { titulo: 'Dados Pessoais', items: [
                  ['Nascimento', formatDate(detalhe.data_nascimento)],
                  ['Sexo', detalhe.sexo],
                  ['CPF', formatCPF(detalhe.cpf)],
                  ['RG', detalhe.rg || '—'],
                  ['Telefone', formatPhone(detalhe.telefone)],
                  ['E-mail', detalhe.email],
                ]},
                { titulo: 'Endereço', items: [
                  ['CEP', detalhe.cep || '—'],
                  ['Logradouro', detalhe.logradouro || '—'],
                  ['Número', detalhe.numero || '—'],
                  ['Bairro', detalhe.bairro || '—'],
                  ['Cidade', detalhe.cidade],
                  ['Estado', detalhe.estado || '—'],
                ]},
                { titulo: 'Participação', items: [
                  ['Tamanho Camiseta', detalhe.tamanho_camiseta],
                  ['Equipe/Assessoria', detalhe.equipe_assessoria || '—'],
                  ['Contato Emergência', detalhe.contato_emergencia],
                  ['Tel. Emergência', formatPhone(detalhe.telefone_emergencia)],
                ]},
                { titulo: 'Saúde', items: [
                  ['Problema de saúde', detalhe.possui_problema_saude ? 'SIM' : 'Não'],
                  ['Descrição', detalhe.descricao_problema_saude || '—'],
                  ['Menor de idade', detalhe.menor_de_idade ? 'SIM' : 'Não'],
                  ['Responsável', detalhe.nome_responsavel || '—'],
                  ['CPF Responsável', detalhe.cpf_responsavel ? formatCPF(detalhe.cpf_responsavel) : '—'],
                ]},
              ].map(sec => (
                <div key={sec.titulo}>
                  <h3 className="font-bold text-gray-700 mb-3 pb-2 border-b border-gray-100">{sec.titulo}</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {sec.items.map(([label, val]) => (
                      <div key={label} className="bg-gray-50 rounded-xl p-3">
                        <p className="text-gray-400 text-xs">{label}</p>
                        <p className="font-medium text-gray-800 mt-0.5 break-all">{val}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between pt-2">
                <span className="text-gray-400 text-xs">Inscrição em: {formatDateTime(detalhe.data_hora_inscricao)}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${detalhe.status === 'confirmada' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                  {detalhe.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
