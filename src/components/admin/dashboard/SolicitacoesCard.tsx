import { useState, useEffect } from 'react';
import { FileText, AlertTriangle, Clock, CheckCircle, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Solicitacao {
    protocolo: string;
    status: string;
    progresso: number;
    atrasado: boolean;
    dataCriacao: string;
    solicitante?: { nome: string; departamento: string };
    projeto?: { titulo: string; tipo: string };
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Clock }> = {
    'novo': { label: 'Novo', color: '#2563EB', icon: Clock },
    'em-producao': { label: 'Em Produção', color: '#D97706', icon: Clock },
    'em-revisao': { label: 'Em Revisão', color: '#7C3AED', icon: Clock },
    'aprovado': { label: 'Aprovado', color: '#059669', icon: CheckCircle },
    'entregue': { label: 'Entregue', color: '#10B981', icon: CheckCircle },
};

export function SolicitacoesCard() {
    const navigate = useNavigate();
    const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);

    useEffect(() => {
        const data = JSON.parse(localStorage.getItem('solicitacoes_sbstudio') || '[]');
        setSolicitacoes(data.sort((a: any, b: any) =>
            new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime()
        ));
    }, []);

    const total = solicitacoes.length;
    const novos = solicitacoes.filter(s => !s.status || s.status === 'novo').length;
    const emProducao = solicitacoes.filter(s => s.status === 'em-producao').length;
    const atrasados = solicitacoes.filter(s => s.atrasado).length;
    const ultimas = solicitacoes.slice(0, 3);

    return (
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-gray-900">Solicitações Prefeitura</h3>
                        <p className="text-xs text-gray-500">{total} solicitações</p>
                    </div>
                </div>
                <button
                    onClick={() => navigate('/admin/solicitacoes-prefeitura')}
                    className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors"
                >
                    Ver todas <ChevronRight className="w-3 h-3" />
                </button>
            </div>

            {/* Contadores */}
            <div className="grid grid-cols-3 gap-2 mb-5">
                <div className="bg-blue-50 rounded-xl p-3 text-center">
                    <p className="text-2xl font-black text-blue-600">{novos}</p>
                    <p className="text-[10px] font-medium text-blue-600/70 uppercase tracking-wider">Novos</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-3 text-center">
                    <p className="text-2xl font-black text-amber-600">{emProducao}</p>
                    <p className="text-[10px] font-medium text-amber-600/70 uppercase tracking-wider">Produção</p>
                </div>
                <div className={`rounded-xl p-3 text-center ${atrasados > 0 ? 'bg-red-50' : 'bg-green-50'}`}>
                    <p className={`text-2xl font-black ${atrasados > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {atrasados > 0 ? atrasados : '✓'}
                    </p>
                    <p className={`text-[10px] font-medium uppercase tracking-wider ${atrasados > 0 ? 'text-red-600/70' : 'text-green-600/70'}`}>
                        {atrasados > 0 ? 'Atrasados' : 'Em dia'}
                    </p>
                </div>
            </div>

            {/* Lista das últimas */}
            <div className="flex-1 space-y-2">
                {ultimas.length === 0 ? (
                    <div className="text-center py-6 text-gray-400 text-sm">
                        Nenhuma solicitação ainda
                    </div>
                ) : (
                    ultimas.map((sol) => {
                        const cfg = STATUS_CONFIG[sol.status || 'novo'] || STATUS_CONFIG['novo'];
                        return (
                            <div
                                key={sol.protocolo}
                                className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                                onClick={() => navigate('/admin/solicitacoes-prefeitura')}
                            >
                                <div
                                    className="w-2 h-2 rounded-full flex-shrink-0"
                                    style={{ background: cfg.color }}
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-gray-800 truncate">
                                        {sol.projeto?.titulo || 'Sem título'}
                                    </p>
                                    <p className="text-[10px] text-gray-400 font-mono">{sol.protocolo}</p>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <span
                                        className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                                        style={{ background: `${cfg.color}18`, color: cfg.color }}
                                    >
                                        {cfg.label}
                                    </span>
                                    {sol.atrasado && (
                                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Barra de progresso geral */}
            {total > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1.5">
                        <span>Progresso geral</span>
                        <span className="font-mono font-bold">
                            {Math.round(solicitacoes.reduce((acc, s) => acc + (s.progresso || 0), 0) / total)}%
                        </span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                                width: `${Math.round(solicitacoes.reduce((acc, s) => acc + (s.progresso || 0), 0) / total)}%`,
                                background: 'linear-gradient(90deg, #F59E0B, #10B981)',
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
