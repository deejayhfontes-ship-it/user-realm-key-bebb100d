import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, GraduationCap, HeartPulse, HardHat,
    Tractor, Users, Trophy, Music, ClipboardList,
    ArrowUpRight, ChevronRight, X
} from 'lucide-react';

const SECRETARIAS = [
    {
        titulo: 'Educação',
        icone: GraduationCap,
        cor: 'from-sky-400 to-blue-500',
        corTexto: 'text-sky-400',
        corBorder: 'hover:border-sky-400/30',
        corShadow: 'hover:shadow-[0_0_40px_-15px_rgba(56,189,248,0.2)]',
        subcards: [],
    },
    {
        titulo: 'Saúde',
        icone: HeartPulse,
        cor: 'from-rose-400 to-pink-500',
        corTexto: 'text-rose-400',
        corBorder: 'hover:border-rose-400/30',
        corShadow: 'hover:shadow-[0_0_40px_-15px_rgba(251,113,133,0.2)]',
        subcards: [],
    },
    {
        titulo: 'Obras',
        icone: HardHat,
        cor: 'from-amber-400 to-orange-500',
        corTexto: 'text-amber-400',
        corBorder: 'hover:border-amber-400/30',
        corShadow: 'hover:shadow-[0_0_40px_-15px_rgba(251,191,36,0.2)]',
        subcards: [],
    },
    {
        titulo: 'Agricultura',
        icone: Tractor,
        cor: 'from-lime-400 to-green-500',
        corTexto: 'text-lime-400',
        corBorder: 'hover:border-lime-400/30',
        corShadow: 'hover:shadow-[0_0_40px_-15px_rgba(163,230,53,0.2)]',
        subcards: [],
    },
    {
        titulo: 'Assistência Social',
        icone: Users,
        cor: 'from-violet-400 to-purple-500',
        corTexto: 'text-violet-400',
        corBorder: 'hover:border-violet-400/30',
        corShadow: 'hover:shadow-[0_0_40px_-15px_rgba(167,139,250,0.2)]',
        subcards: [
            { titulo: 'CRAS Itinerante', cor: 'from-violet-400 to-fuchsia-500', rota: '/prefeitura/secretarias/assistencia-social/cras-itinerante' },
        ],
    },
    {
        titulo: 'Diretoria de Esporte e Lazer',
        icone: Trophy,
        cor: 'from-yellow-400 to-amber-500',
        corTexto: 'text-yellow-400',
        corBorder: 'hover:border-yellow-400/30',
        corShadow: 'hover:shadow-[0_0_40px_-15px_rgba(250,204,21,0.2)]',
        subcards: [
            {
                titulo: 'Inscrições Corrida do Autismo',
                cor: 'from-yellow-400 to-amber-500',
                rota: '/prefeitura/secretarias/diretoria-esporte/corrida-autismo',
                descricao: 'Gerenciar inscrições da 1ª Corrida de Conscientização do Autismo',
            },
        ],
    },

    {
        titulo: 'Secretaria de Cultura e Turismo',
        icone: Music,
        cor: 'from-fuchsia-400 to-pink-500',
        corTexto: 'text-fuchsia-400',
        corBorder: 'hover:border-fuchsia-400/30',
        corShadow: 'hover:shadow-[0_0_40px_-15px_rgba(232,121,249,0.2)]',
        subcards: [],
    },
    {
        titulo: 'ADM e Planejamento',
        icone: ClipboardList,
        cor: 'from-cyan-400 to-teal-500',
        corTexto: 'text-cyan-400',
        corBorder: 'hover:border-cyan-400/30',
        corShadow: 'hover:shadow-[0_0_40px_-15px_rgba(34,211,238,0.2)]',
        subcards: [
            {
                titulo: 'Gerador de Post – Biometria',
                cor: 'from-cyan-400 to-teal-500',
                rota: '/prefeitura/secretarias/adm-planejamento/gerador-biometria',
                descricao: 'Gerador de arte Instagram para campanha de Biometria',
            },
        ],
    },
];

type Secretaria = typeof SECRETARIAS[0];

export default function Secretarias() {
    const navigate = useNavigate();
    const [selected, setSelected] = useState<Secretaria | null>(null);

    return (
        <div className="min-h-screen bg-[#050505]">
            {/* Header */}
            <header className="sticky top-0 z-50 backdrop-blur-2xl bg-[#0a0a0a]/70 border-b border-white/[0.06]">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => selected ? setSelected(null) : navigate('/prefeitura/modelos-oficiais')}
                            className="flex items-center gap-2 px-4 py-2 text-zinc-400 hover:text-white rounded-xl hover:bg-white/[0.06] transition-all duration-300"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span className="font-medium">{selected ? 'Secretarias' : 'Voltar'}</span>
                        </button>

                        <div className="flex items-center gap-3">
                            {selected && (
                                <span className="text-zinc-500 text-sm hidden sm:block">
                                    Secretarias
                                </span>
                            )}
                            {selected && <ChevronRight className="w-4 h-4 text-zinc-600 hidden sm:block" />}
                            <h1 className="text-xl font-bold text-white">
                                {selected ? selected.titulo : 'Secretarias'}
                            </h1>
                        </div>

                        <div className={`w-10 h-10 bg-gradient-to-br ${selected ? selected.cor : 'from-violet-400 to-purple-500'} rounded-2xl flex items-center justify-center transition-all duration-300`}>
                            {selected
                                ? <selected.icone className="w-5 h-5 text-white" />
                                : <Users className="w-5 h-5 text-white" />
                            }
                        </div>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-5xl mx-auto px-6 py-12">
                {!selected ? (
                    <>
                        <div className="mb-10">
                            <h2 className="text-3xl font-bold text-white mb-2">Secretarias Municipais</h2>
                            <p className="text-zinc-400">
                                Selecione uma secretaria para acessar seus modelos e comunicados específicos.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {SECRETARIAS.map((sec) => {
                                const Icone = sec.icone;
                                return (
                                    <button
                                        key={sec.titulo}
                                        onClick={() => sec.subcards.length > 0 ? setSelected(sec) : null}
                                        className={`group relative bg-[#111111] border border-white/[0.08] rounded-2xl p-5 text-left transition-all duration-300 ${sec.corBorder} ${sec.corShadow} hover:-translate-y-0.5 cursor-pointer`}
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className={`w-11 h-11 bg-gradient-to-br ${sec.cor} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                                <Icone className="w-5 h-5 text-white" />
                                            </div>
                                            <div className="w-7 h-7 rounded-full bg-white/[0.04] group-hover:bg-white/10 flex items-center justify-center transition-all">
                                                {sec.subcards.length > 0
                                                    ? <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
                                                    : <ArrowUpRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-300 transition-colors" />
                                                }
                                            </div>
                                        </div>

                                        <h3 className={`text-sm font-bold text-white ${sec.corTexto.replace('text-', 'group-hover:text-')} transition-colors leading-tight`}>
                                            {sec.titulo}
                                        </h3>

                                        {sec.subcards.length > 0 && (
                                            <p className="text-[11px] text-zinc-600 mt-1">
                                                {sec.subcards.length} subcategoria{sec.subcards.length > 1 ? 's' : ''}
                                            </p>
                                        )}

                                        <div className={`absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r ${sec.cor} w-0 group-hover:w-full transition-all duration-500 rounded-b-2xl`} />
                                    </button>
                                );
                            })}
                        </div>
                    </>
                ) : (
                    <>
                        {/* Subcards da secretaria selecionada */}
                        <div className="mb-10">
                            <div className="flex items-center gap-3 mb-2">
                                <div className={`w-8 h-8 bg-gradient-to-br ${selected.cor} rounded-xl flex items-center justify-center`}>
                                    <selected.icone className="w-4 h-4 text-white" />
                                </div>
                                <h2 className="text-3xl font-bold text-white">{selected.titulo}</h2>
                            </div>
                            <p className="text-zinc-400">
                                Programas e divisões da {selected.titulo}.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {selected.subcards.map((sub) => (
                                <button
                                    key={sub.titulo}
                                    onClick={() => sub.rota ? navigate(sub.rota) : undefined}
                                    className={`group relative bg-[#111111] border border-white/[0.08] rounded-2xl p-6 text-left transition-all duration-300 hover:border-violet-400/30 hover:shadow-[0_0_40px_-15px_rgba(167,139,250,0.25)] hover:-translate-y-0.5 cursor-pointer`}
                                >
                                    <div className={`w-12 h-12 bg-gradient-to-br ${sub.cor} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                        <selected.icone className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white group-hover:text-violet-300 transition-colors">
                                        {sub.titulo}
                                    </h3>
                                    {sub.rota && (
                                        <p className="text-xs text-zinc-500 mt-1">Gerador de Arte Instagram</p>
                                    )}
                                    <div className={`absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r ${sub.cor} w-0 group-hover:w-full transition-all duration-500 rounded-b-2xl`} />
                                </button>
                            ))}

                            {selected.subcards.length === 0 && (
                                <div className="col-span-3 text-center py-16 text-zinc-600">
                                    <X className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                    <p>Nenhum subcategoria cadastrada ainda.</p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
