import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2, AlertCircle, Clock, CheckCircle, ArrowLeft, Copy, AlertTriangle, BarChart3 } from 'lucide-react';
import logoHeliodora from '@/assets/prefeitura/logo-heliodora-branco.svg';

const STATUS_LABELS: Record<string, { label: string; color: string; bgColor: string; icon: any }> = {
    'novo': { label: 'Novo', color: '#2563EB', bgColor: 'rgba(37,99,235,0.1)', icon: Clock },
    'em-producao': { label: 'Em Produção', color: '#D97706', bgColor: 'rgba(217,119,6,0.1)', icon: BarChart3 },
    'em-revisao': { label: 'Em Revisão', color: '#7C3AED', bgColor: 'rgba(124,58,237,0.1)', icon: Search },
    'aprovado': { label: 'Aprovado', color: '#059669', bgColor: 'rgba(5,150,105,0.1)', icon: CheckCircle },
    'entregue': { label: 'Entregue', color: '#10B981', bgColor: 'rgba(16,185,129,0.1)', icon: CheckCircle },
};

export default function ConsultarSolicitacao() {
    const navigate = useNavigate();
    const [protocolo, setProtocolo] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [solicitacao, setSolicitacao] = useState<any | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!protocolo.trim()) return;

        setIsLoading(true);
        setError(null);
        setSolicitacao(null);

        try {
            const existentes = JSON.parse(localStorage.getItem('solicitacoes_sbstudio') || '[]');
            const encontrada = existentes.find((s: any) =>
                s.protocolo?.toUpperCase() === protocolo.trim().toUpperCase()
            );

            if (encontrada) {
                setSolicitacao(encontrada);
            } else {
                setError('Solicitação não encontrada. Verifique o número do protocolo e tente novamente.');
            }
        } catch (err) {
            setError('Erro ao consultar. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    const copiarProtocolo = () => {
        navigator.clipboard.writeText(solicitacao?.protocolo || '');
        alert('Protocolo copiado!');
    };

    const getStatusInfo = (status: string) => {
        return STATUS_LABELS[status] || STATUS_LABELS['novo'];
    };

    const progresso = solicitacao?.progresso || 0;
    const statusInfo = solicitacao ? getStatusInfo(solicitacao.status || 'novo') : null;
    const StatusIcon = statusInfo?.icon || Clock;

    return (
        <div className="min-h-screen" style={{ background: '#FBF8EF' }}>
            {/* Header */}
            <header className="sticky top-0 z-50 backdrop-blur-2xl border-b" style={{ background: 'rgba(251,248,239,0.85)', borderColor: 'rgba(20,20,20,0.08)' }}>
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => navigate('/prefeitura')}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300"
                            style={{ color: '#141414' }}
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span className="font-medium">Voltar</span>
                        </button>
                        <h1 className="text-xl font-bold" style={{ color: '#141414' }}>
                            Consultar Solicitação
                        </h1>
                        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#C7FF10' }}>
                            <Search className="w-5 h-5" style={{ color: '#1A1A1A' }} />
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-6 py-12">
                {/* Formulário de Busca */}
                <div className="rounded-2xl p-6 md:p-8 border mb-8" style={{ background: '#FFFFFF', borderColor: '#E5E5E5', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold mb-2" style={{ color: '#1A1A1A' }}>Acompanhe sua Solicitação</h2>
                        <p className="text-sm" style={{ color: '#666' }}>Digite o número do protocolo que você recebeu ao enviar sua solicitação</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={protocolo}
                                onChange={(e) => { setProtocolo(e.target.value.toUpperCase()); setError(null); }}
                                placeholder="SB-DG-202602-XXXXXX"
                                className="flex-1 px-4 py-3 rounded-xl text-base font-medium uppercase tracking-wider"
                                style={{ background: '#F5F5F5', border: '1px solid #E5E5E5', color: '#1A1A1A' }}
                            />
                            <button
                                type="submit"
                                disabled={!protocolo.trim() || isLoading}
                                className="px-6 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center gap-2"
                                style={{ background: '#1A1A1A', color: '#FFFFFF' }}
                            >
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                                {isLoading ? 'Buscando...' : 'Consultar'}
                            </button>
                        </div>

                        {error && (
                            <div className="flex items-center gap-3 p-4 rounded-xl border" style={{ background: 'rgba(239,68,68,0.05)', borderColor: 'rgba(239,68,68,0.2)' }}>
                                <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}
                    </form>
                </div>

                {/* Resultados */}
                {solicitacao && (
                    <div className="space-y-5 animate-in fade-in duration-500">
                        {/* Status Card */}
                        <div className="rounded-2xl p-6 border" style={{ background: '#FFFFFF', borderColor: '#E5E5E5', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#C7FF10' }}>
                                        <span className="text-sm font-bold" style={{ color: '#1A1A1A' }}>📋</span>
                                    </div>
                                    <h3 className="text-base font-semibold uppercase tracking-wide" style={{ color: '#1A1A1A' }}>Status da Solicitação</h3>
                                </div>
                                <button onClick={copiarProtocolo} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-all hover:scale-105" style={{ borderColor: '#E5E5E5', color: '#666' }}>
                                    <Copy className="w-3.5 h-3.5" />
                                    Copiar Protocolo
                                </button>
                            </div>

                            <div className="flex items-center gap-4 mb-4">
                                <div className="px-4 py-2 rounded-xl text-sm font-bold tracking-widest" style={{ background: '#F5F5F5', border: '2px solid #C7FF10', color: '#1A1A1A' }}>
                                    {solicitacao.protocolo}
                                </div>
                                <div className="px-3 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1.5" style={{ background: statusInfo?.bgColor, color: statusInfo?.color }}>
                                    <StatusIcon className="w-4 h-4" />
                                    {statusInfo?.label}
                                </div>
                            </div>

                            {/* Barra de Progresso */}
                            <div className="mb-2">
                                <div className="flex justify-between mb-1">
                                    <span className="text-xs font-medium" style={{ color: '#888' }}>PROGRESSO</span>
                                    <span className="text-xs font-bold" style={{ color: '#1A1A1A' }}>{progresso}%</span>
                                </div>
                                <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: '#F0F0F0' }}>
                                    <div
                                        className="h-full rounded-full transition-all duration-700"
                                        style={{
                                            width: `${progresso}%`,
                                            background: progresso === 100 ? '#10B981' : 'linear-gradient(90deg, #C7FF10, #a8d90e)'
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Alerta de Atraso */}
                            {solicitacao.atrasado && (
                                <div className="mt-4 p-4 rounded-xl border flex items-start gap-3" style={{ background: 'rgba(245,158,11,0.06)', borderColor: 'rgba(245,158,11,0.3)' }}>
                                    <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#D97706' }} />
                                    <div>
                                        <p className="text-sm font-semibold" style={{ color: '#92400E' }}>Solicitação com Atraso</p>
                                        {solicitacao.justificativaAtraso && (
                                            <p className="text-sm mt-1" style={{ color: '#78350F' }}>
                                                <strong>Justificativa:</strong> {solicitacao.justificativaAtraso}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Detalhes */}
                        <div className="rounded-2xl p-6 border" style={{ background: '#FFFFFF', borderColor: '#E5E5E5', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#C7FF10' }}>
                                    <span className="text-sm font-bold" style={{ color: '#1A1A1A' }}>📄</span>
                                </div>
                                <h3 className="text-base font-semibold uppercase tracking-wide" style={{ color: '#1A1A1A' }}>Detalhes</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-3 rounded-xl" style={{ background: '#FAFAFA' }}>
                                    <p className="text-xs uppercase font-medium mb-1" style={{ color: '#888' }}>Solicitante</p>
                                    <p className="text-sm font-medium" style={{ color: '#1A1A1A' }}>{solicitacao.solicitante?.nome}</p>
                                </div>
                                <div className="p-3 rounded-xl" style={{ background: '#FAFAFA' }}>
                                    <p className="text-xs uppercase font-medium mb-1" style={{ color: '#888' }}>Departamento</p>
                                    <p className="text-sm font-medium" style={{ color: '#1A1A1A' }}>{solicitacao.solicitante?.departamento}</p>
                                </div>
                                <div className="p-3 rounded-xl" style={{ background: '#FAFAFA' }}>
                                    <p className="text-xs uppercase font-medium mb-1" style={{ color: '#888' }}>Tipo de Material</p>
                                    <p className="text-sm font-medium" style={{ color: '#1A1A1A' }}>{solicitacao.projeto?.tipo}</p>
                                </div>
                                <div className="p-3 rounded-xl" style={{ background: '#FAFAFA' }}>
                                    <p className="text-xs uppercase font-medium mb-1" style={{ color: '#888' }}>Título</p>
                                    <p className="text-sm font-medium" style={{ color: '#1A1A1A' }}>{solicitacao.projeto?.titulo}</p>
                                </div>
                                <div className="p-3 rounded-xl" style={{ background: '#FAFAFA' }}>
                                    <p className="text-xs uppercase font-medium mb-1" style={{ color: '#888' }}>Prazo de Entrega</p>
                                    <p className="text-sm font-medium" style={{ color: '#1A1A1A' }}>{solicitacao.dataEntrega || 'A definir'}</p>
                                </div>
                                <div className="p-3 rounded-xl" style={{ background: '#FAFAFA' }}>
                                    <p className="text-xs uppercase font-medium mb-1" style={{ color: '#888' }}>Prioridade</p>
                                    <p className="text-sm font-medium capitalize" style={{ color: '#1A1A1A' }}>{solicitacao.prioridade}</p>
                                </div>
                            </div>
                        </div>

                        {/* Histórico */}
                        {solicitacao.historico && solicitacao.historico.length > 0 && (
                            <div className="rounded-2xl p-6 border" style={{ background: '#FFFFFF', borderColor: '#E5E5E5', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#C7FF10' }}>
                                        <span className="text-sm font-bold" style={{ color: '#1A1A1A' }}>📝</span>
                                    </div>
                                    <h3 className="text-base font-semibold uppercase tracking-wide" style={{ color: '#1A1A1A' }}>Histórico de Atualizações</h3>
                                </div>

                                <div className="space-y-3">
                                    {[...solicitacao.historico].reverse().map((item: any, index: number) => (
                                        <div key={index} className="flex gap-3 items-start">
                                            <div className="w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: index === 0 ? '#C7FF10' : '#D5D5D5' }} />
                                            <div className="flex-1">
                                                <p className="text-sm font-medium" style={{ color: '#1A1A1A' }}>{item.acao}</p>
                                                {item.observacao && (
                                                    <p className="text-xs mt-0.5" style={{ color: '#666' }}>{item.observacao}</p>
                                                )}
                                                <p className="text-xs mt-0.5" style={{ color: '#999' }}>
                                                    {new Date(item.data).toLocaleString('pt-BR')}
                                                    {item.usuario && ` • ${item.usuario}`}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
