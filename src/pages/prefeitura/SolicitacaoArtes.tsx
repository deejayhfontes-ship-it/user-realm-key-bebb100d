<<<<<<< HEAD
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Crown } from 'lucide-react';
import FormularioSolicitacao from '@/components/prefeitura/FormularioSolicitacao';

export default function SolicitacaoArtes() {
    const navigate = useNavigate();

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
                            Solicitação de Artes
                        </h1>

                        <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center">
                            <Crown className="w-5 h-5 text-black" />
                        </div>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-4xl mx-auto px-6 py-12">
                <div className="mb-8">
                    <p className="text-xs uppercase tracking-wider mb-2" style={{ color: '#999' }}>Sistema de Solicitações Prefeitura</p>
                    <h2 className="text-3xl font-bold mb-2" style={{ color: '#141414' }}>
                        Nova Solicitação
                    </h2>
                    <p style={{ color: '#666' }}>
                        Preencha o formulário para solicitar criação de artes. O pedido será enviado para o Trello e acompanhado internamente.
                    </p>
                </div>

                <FormularioSolicitacao />
            </main>
        </div>
    );
}
=======
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Crown } from 'lucide-react';
import FormularioSolicitacao from '@/components/prefeitura/FormularioSolicitacao';

export default function SolicitacaoArtes() {
    const navigate = useNavigate();

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
                            Solicitação de Artes
                        </h1>

                        <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center">
                            <Crown className="w-5 h-5 text-black" />
                        </div>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-4xl mx-auto px-6 py-12">
                <div className="mb-8">
                    <p className="text-xs uppercase tracking-wider mb-2" style={{ color: '#999' }}>Sistema de Solicitações Prefeitura</p>
                    <h2 className="text-3xl font-bold mb-2" style={{ color: '#141414' }}>
                        Nova Solicitação
                    </h2>
                    <p style={{ color: '#666' }}>
                        Preencha o formulário para solicitar criação de artes. O pedido será enviado para o Trello e acompanhado internamente.
                    </p>
                </div>

                <FormularioSolicitacao />
            </main>
        </div>
    );
}
>>>>>>> 156f36cf0eee94361ff12bfb77e006213e68283d
