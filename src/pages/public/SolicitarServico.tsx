import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { usePublicServices } from '@/hooks/usePublicServices';
import { useCreatePedido } from '@/hooks/usePedidos';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { icons, ArrowLeft, Check, Upload, X, FileText, Clock, DollarSign, Send, MessageCircle, Loader2 } from 'lucide-react';
import type { Service } from '@/types/service';

const WHATSAPP_NUMBER = '5535991116310';
const EMAIL_CONTATO = 'contato@fontesgraphicsdesign.com.br';

export default function SolicitarServico() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { services, isLoading: isLoadingServices } = usePublicServices();
    const createPedido = useCreatePedido();
    const { user, profile } = useAuth();

    // Steps: 'select' | 'briefing' | 'success'
    const [step, setStep] = useState<'select' | 'briefing' | 'success'>('select');
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [protocolo, setProtocolo] = useState('');

    // Form
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [telefone, setTelefone] = useState('');
    const [empresa, setEmpresa] = useState('');
    const [descricao, setDescricao] = useState('');
    const [referencias, setReferencias] = useState('');
    const [arquivos, setArquivos] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);

    // Pre-fill from user profile
    useEffect(() => {
        if (user) {
            setEmail(user.email || '');
            setNome(user.user_metadata?.name || user.user_metadata?.full_name || '');
        }
    }, [user]);

    // Pre-select service from URL param
    useEffect(() => {
        const serviceSlug = searchParams.get('servico');
        if (serviceSlug && services.length > 0) {
            const svc = services.find(s => s.slug === serviceSlug);
            if (svc) {
                setSelectedService(svc);
                setStep('briefing');
            }
        }
    }, [searchParams, services]);

    const getIcon = (iconName: string) => {
        const IconComponent = icons[iconName as keyof typeof icons];
        return IconComponent ? <IconComponent className="w-7 h-7" /> : <FileText className="w-7 h-7" />;
    };

    const handleSelectService = (service: Service) => {
        if (!user) {
            toast.info('Faça login ou cadastre-se para solicitar um serviço');
            navigate(`/client/login?redirect=/solicitar-servico?servico=${service.slug}`);
            return;
        }
        setSelectedService(service);
        setStep('briefing');
    };

    const handleFileUpload = async (files: FileList) => {
        const maxSize = 10 * 1024 * 1024; // 10MB
        const newFiles = Array.from(files).filter(f => {
            if (f.size > maxSize) {
                toast.error(`${f.name} é muito grande (máx 10MB)`);
                return false;
            }
            return true;
        });
        setArquivos(prev => [...prev, ...newFiles]);
    };

    const uploadFiles = async (): Promise<string[]> => {
        if (arquivos.length === 0) return [];
        setUploading(true);
        const urls: string[] = [];

        for (const file of arquivos) {
            const ext = file.name.split('.').pop();
            const path = `pedidos/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

            const { error } = await supabase.storage
                .from('uploads')
                .upload(path, file);

            if (error) {
                console.error('Upload error:', error);
                continue;
            }

            const { data: publicUrl } = supabase.storage
                .from('uploads')
                .getPublicUrl(path);

            urls.push(publicUrl.publicUrl);
        }

        setUploading(false);
        return urls;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedService) return;
        if (!nome || !email || !descricao) {
            toast.error('Preencha todos os campos obrigatórios');
            return;
        }

        try {
            // Upload files if any
            const uploadedUrls = await uploadFiles();

            // Create pedido
            const result = await createPedido.mutateAsync({
                nome,
                email,
                telefone,
                empresa,
                descricao: `[${selectedService.title}] ${descricao}`,
                referencias,
                arquivo_urls: uploadedUrls,
                service_id: selectedService.id,
            });

            if (result?.protocolo) {
                setProtocolo(result.protocolo);
                setStep('success');

                // Send email notification for Logo type
                if (selectedService.slug === 'logo-vector') {
                    try {
                        const emailBody = [
                            `Novo pedido de Logo recebido!`,
                            ``,
                            `Protocolo: ${result.protocolo}`,
                            `Cliente: ${nome}`,
                            `Email: ${email}`,
                            `Telefone: ${telefone || 'Não informado'}`,
                            `Empresa: ${empresa || 'Não informada'}`,
                            ``,
                            `Briefing:`,
                            descricao,
                            ``,
                            `Referências:`,
                            referencias || 'Nenhuma',
                            ``,
                            uploadedUrls.length > 0
                                ? `Arquivos anexados: ${uploadedUrls.length}`
                                : 'Sem arquivos anexados',
                        ].join('\n');

                        // Try to send via mailto (opens email client)
                        const mailtoLink = `mailto:${EMAIL_CONTATO}?subject=Novo Pedido Logo - ${result.protocolo}&body=${encodeURIComponent(emailBody)}`;
                        window.open(mailtoLink, '_blank');
                    } catch (err) {
                        console.warn('Could not open email client:', err);
                    }
                }

                toast.success('Pedido criado com sucesso!');
            }
        } catch (err: unknown) {
            const error = err as Error;
            toast.error('Erro ao criar pedido: ' + error.message);
        }
    };

    const getWhatsAppLink = () => {
        if (!selectedService || !protocolo) return '#';
        const msg = encodeURIComponent(
            `Olá! Quero realizar o pagamento do pedido:\n\n` +
            `📋 Protocolo: ${protocolo}\n` +
            `🎨 Serviço: ${selectedService.title}\n` +
            `💰 Valor: ${selectedService.price_range}\n\n` +
            `Aguardo instruções para pagamento.`
        );
        return `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;
    };

    // ─── STEP 1: Select Service ───────────────────────────────────────────
    if (step === 'select') {
        return (
            <div className="min-h-screen bg-[#0a0a0a] text-white">
                {/* Header */}
                <header className="border-b border-zinc-800 bg-[#0a0a0a]/80 backdrop-blur-lg sticky top-0 z-50">
                    <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
                        <button onClick={() => navigate('/')} className="text-zinc-400 hover:text-white transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-lg font-semibold">Solicitar Serviço</h1>
                            <p className="text-xs text-zinc-500">Escolha o serviço desejado</p>
                        </div>
                    </div>
                </header>

                <main className="max-w-5xl mx-auto px-4 py-8 md:py-12">
                    {!user && (
                        <div className="mb-8 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 text-sm flex items-center gap-3">
                            <MessageCircle className="w-5 h-5 flex-shrink-0" />
                            <span>
                                Para solicitar um serviço, é necessário{' '}
                                <a href="/client/login" className="underline font-medium hover:text-yellow-200">fazer login</a>
                                {' '}ou{' '}
                                <a href="/registro" className="underline font-medium hover:text-yellow-200">criar uma conta</a>.
                            </span>
                        </div>
                    )}

                    <h2 className="text-2xl md:text-3xl font-bold mb-2">Nossos Serviços</h2>
                    <p className="text-zinc-400 mb-8">Selecione um serviço para iniciar sua solicitação</p>

                    {isLoadingServices ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2">
                            {services.map(service => (
                                <button
                                    key={service.id}
                                    onClick={() => handleSelectService(service)}
                                    className="text-left p-6 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-primary/50 transition-all group"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                                            {getIcon(service.icon || 'Palette')}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-lg font-semibold mb-1 group-hover:text-primary transition-colors">
                                                {service.title}
                                            </h3>
                                            <p className="text-sm text-zinc-400 mb-3">{service.short_description}</p>

                                            <div className="flex flex-wrap gap-3 text-xs">
                                                {service.price_range && (
                                                    <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400">
                                                        <DollarSign className="w-3 h-3" />
                                                        {service.price_range}
                                                    </span>
                                                )}
                                                {service.delivery_time && (
                                                    <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-500/10 text-blue-400">
                                                        <Clock className="w-3 h-3" />
                                                        {service.delivery_time}
                                                    </span>
                                                )}
                                            </div>

                                            {service.features.length > 0 && (
                                                <div className="mt-3 flex flex-wrap gap-1">
                                                    {service.features.map((f, i) => (
                                                        <span key={i} className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">
                                                            {f}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        );
    }

    // ─── STEP 2: Briefing Form ────────────────────────────────────────────
    if (step === 'briefing' && selectedService) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] text-white">
                <header className="border-b border-zinc-800 bg-[#0a0a0a]/80 backdrop-blur-lg sticky top-0 z-50">
                    <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
                        <button onClick={() => { setStep('select'); setSelectedService(null); }} className="text-zinc-400 hover:text-white transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-lg font-semibold">{selectedService.title}</h1>
                            <p className="text-xs text-zinc-500">{selectedService.price_range} • {selectedService.delivery_time}</p>
                        </div>
                    </div>
                </header>

                <main className="max-w-3xl mx-auto px-4 py-8">
                    {/* Service Summary */}
                    <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 mb-8">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                {getIcon(selectedService.icon || 'Palette')}
                            </div>
                            <div>
                                <h3 className="font-semibold">{selectedService.title}</h3>
                                <p className="text-xs text-zinc-400">{selectedService.full_description || selectedService.short_description}</p>
                            </div>
                        </div>
                        {selectedService.deliverables.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {selectedService.deliverables.map((d, i) => (
                                    <span key={i} className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                                        ✓ {d}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Briefing Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <h2 className="text-xl font-semibold mb-1">Briefing</h2>
                        <p className="text-sm text-zinc-400 mb-4">Preencha as informações para iniciar seu pedido</p>

                        {/* Nome */}
                        <div>
                            <label className="block text-sm font-medium mb-1.5 text-zinc-300">Nome completo *</label>
                            <input
                                type="text"
                                required
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 focus:border-primary focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                                placeholder="Seu nome"
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium mb-1.5 text-zinc-300">E-mail *</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 focus:border-primary focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                                placeholder="seu@email.com"
                            />
                        </div>

                        {/* Telefone + Empresa */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1.5 text-zinc-300">Telefone</label>
                                <input
                                    type="tel"
                                    value={telefone}
                                    onChange={(e) => setTelefone(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 focus:border-primary focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                                    placeholder="(00) 00000-0000"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5 text-zinc-300">Empresa</label>
                                <input
                                    type="text"
                                    value={empresa}
                                    onChange={(e) => setEmpresa(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 focus:border-primary focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                                    placeholder="Nome da empresa"
                                />
                            </div>
                        </div>

                        {/* Descrição / Briefing */}
                        <div>
                            <label className="block text-sm font-medium mb-1.5 text-zinc-300">
                                {selectedService.slug === 'logo-vector'
                                    ? 'Briefing criativo *'
                                    : 'Descreva o que precisa *'}
                            </label>
                            <textarea
                                required
                                rows={5}
                                value={descricao}
                                onChange={(e) => setDescricao(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 focus:border-primary focus:ring-1 focus:ring-primary/50 outline-none transition-all resize-none"
                                placeholder={
                                    selectedService.slug === 'logo-vector'
                                        ? 'Descreva sua marca, público-alvo, cores preferidas, estilo desejado...'
                                        : selectedService.slug === 'flyer-evento'
                                            ? 'Nome do evento, data, local, nomes dos DJs (até 5), estilo do evento...'
                                            : 'Descreva detalhadamente o que precisa...'
                                }
                            />
                        </div>

                        {/* Referências */}
                        <div>
                            <label className="block text-sm font-medium mb-1.5 text-zinc-300">Referências visuais</label>
                            <textarea
                                rows={3}
                                value={referencias}
                                onChange={(e) => setReferencias(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 focus:border-primary focus:ring-1 focus:ring-primary/50 outline-none transition-all resize-none"
                                placeholder="Cole links de inspiração ou descreva referências visuais..."
                            />
                        </div>

                        {/* File Upload */}
                        <div>
                            <label className="block text-sm font-medium mb-1.5 text-zinc-300">Arquivos de referência</label>
                            <div
                                className="border-2 border-dashed border-zinc-700 rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
                                onClick={() => document.getElementById('file-upload')?.click()}
                            >
                                <Upload className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
                                <p className="text-sm text-zinc-400">Clique ou arraste arquivos aqui</p>
                                <p className="text-xs text-zinc-600 mt-1">Máximo 10MB por arquivo</p>
                                <input
                                    id="file-upload"
                                    type="file"
                                    multiple
                                    className="hidden"
                                    onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                                />
                            </div>

                            {arquivos.length > 0 && (
                                <div className="mt-3 space-y-2">
                                    {arquivos.map((file, i) => (
                                        <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-900 text-sm">
                                            <FileText className="w-4 h-4 text-zinc-500" />
                                            <span className="flex-1 truncate">{file.name}</span>
                                            <span className="text-xs text-zinc-500">
                                                {(file.size / 1024 / 1024).toFixed(1)}MB
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => setArquivos(prev => prev.filter((_, idx) => idx !== i))}
                                                className="text-zinc-500 hover:text-red-400"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={createPedido.isPending || uploading}
                            className="w-full py-4 rounded-xl bg-primary text-black font-semibold text-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                        >
                            {createPedido.isPending || uploading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    {uploading ? 'Enviando arquivos...' : 'Criando pedido...'}
                                </>
                            ) : (
                                <>
                                    <Send className="w-5 h-5" />
                                    Enviar Solicitação
                                </>
                            )}
                        </button>
                    </form>
                </main>
            </div>
        );
    }

    // ─── STEP 3: Success ──────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center px-4">
            <div className="max-w-lg w-full text-center">
                {/* Success Icon */}
                <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                    <Check className="w-10 h-10 text-emerald-400" />
                </div>

                <h1 className="text-2xl md:text-3xl font-bold mb-2">Pedido Criado!</h1>
                <p className="text-zinc-400 mb-6">Seu pedido foi registrado com sucesso.</p>

                {/* Protocol Card */}
                <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 mb-6">
                    <p className="text-sm text-zinc-400 mb-1">Número do protocolo</p>
                    <p className="text-3xl font-mono font-bold text-primary tracking-wider">{protocolo}</p>
                    <div className="mt-4 flex items-center justify-center gap-4 text-sm text-zinc-400">
                        {selectedService && (
                            <>
                                <span className="flex items-center gap-1">
                                    <FileText className="w-4 h-4" />
                                    {selectedService.title}
                                </span>
                                <span className="flex items-center gap-1">
                                    <DollarSign className="w-4 h-4" />
                                    {selectedService.price_range}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {selectedService.delivery_time}
                                </span>
                            </>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                    <a
                        href={getWhatsAppLink()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-3.5 rounded-xl bg-[#25D366] text-white font-semibold flex items-center justify-center gap-2 hover:bg-[#1fb855] transition-colors"
                    >
                        <MessageCircle className="w-5 h-5" />
                        Pagar via WhatsApp
                    </a>

                    <button
                        onClick={() => navigate(`/pedido/${protocolo}`)}
                        className="w-full py-3.5 rounded-xl bg-zinc-800 text-white font-medium flex items-center justify-center gap-2 hover:bg-zinc-700 transition-colors"
                    >
                        <FileText className="w-5 h-5" />
                        Acompanhar Pedido
                    </button>

                    <button
                        onClick={() => navigate('/client/pedidos')}
                        className="w-full py-3.5 rounded-xl border border-zinc-700 text-zinc-300 font-medium flex items-center justify-center gap-2 hover:bg-zinc-900 transition-colors"
                    >
                        Meus Pedidos
                    </button>
                </div>

                <p className="text-xs text-zinc-600 mt-6">
                    Guarde seu protocolo. Você também pode acompanhar o pedido pela sua área do cliente.
                </p>
            </div>
        </div>
    );
}
