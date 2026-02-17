import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Loader2, Send, CheckCircle, HelpCircle, Lightbulb, AlertCircle, ThumbsUp, Bell, MessageSquare } from "lucide-react";
import { landingContent } from "@/data/landingContent";

// Tipos de contato disponíveis
const contactTypes = [
  { value: 'duvida', label: 'Dúvida', icon: HelpCircle },
  { value: 'sugestao', label: 'Sugestão', icon: Lightbulb },
  { value: 'reclamacao', label: 'Reclamação', icon: AlertCircle },
  { value: 'elogio', label: 'Elogio', icon: ThumbsUp },
  { value: 'newsletter', label: 'Quero receber novidades', icon: Bell },
  { value: 'outro', label: 'Outro', icon: MessageSquare },
];

export function ContactSection() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    contactType: "duvida",
    message: "",
  });

  const content = landingContent.contact;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.email || !formData.message) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha nome, email e mensagem.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Enviar para contact_messages (não briefings!)
      const { error } = await supabase.from("contact_messages").insert({
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        phone: formData.phone || null,
        subject: contactTypes.find(t => t.value === formData.contactType)?.label || 'Outro',
        message: formData.message,
        status: "new",
        user_id: (await supabase.auth.getSession()).data.session?.user.id || 
          // Para visitantes não logados, usar um ID fixo do admin
          "00000000-0000-0000-0000-000000000000",
      });

      if (error) throw error;

      // Se o tipo é newsletter, também adicionar à lista de assinantes (ignorar se já existe)
      if (formData.contactType === 'newsletter') {
        try {
          await supabase.from("newsletter_subscribers").insert({
            name: `${formData.firstName} ${formData.lastName}`.trim(),
            email: formData.email,
            is_active: true,
            user_id: (await supabase.auth.getSession()).data.session?.user.id || 
              "00000000-0000-0000-0000-000000000000",
          });
        } catch {
          // Ignorar erro de duplicata
        }
      }

      setSubmitted(true);

      toast({
        title: "Mensagem enviada! 🎉",
        description: content.form.successMessage,
      });

      // Reset form após 5 segundos
      setTimeout(() => {
        setSubmitted(false);
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          contactType: "duvida",
          message: "",
        });
      }, 5000);
    } catch {
      toast({
        title: "Erro ao enviar",
        description: "Ocorreu um erro. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Tela de sucesso
  if (submitted) {
    return (
      <section
        id="contact"
        className="relative section-padding overflow-hidden"
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.9), rgba(0,0,0,0.7)), url('https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1600&q=80')`,
          }}
        />
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="magnetto-glass p-12 text-center max-w-md">
              <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                Mensagem Enviada!
              </h3>
              <p className="text-zinc-400">
                Obrigado pelo contato. Responderemos em breve!
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="contact"
      className="relative py-16 md:py-20 lg:py-24 overflow-hidden"
    >
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.9), rgba(0,0,0,0.7)), url('https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1600&q=80')`,
        }}
      />

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left - Title */}
          <div>
            <h2 className="magnetto-title text-4xl md:text-5xl lg:text-6xl text-white leading-tight">
              {content.title}
            </h2>
            <p className="text-zinc-400 text-base md:text-lg mt-6 md:mt-8 max-w-md">
              {content.description}
            </p>
            
            {/* Nota sobre briefing */}
            <div className="mt-6 p-4 rounded-xl bg-primary/10 border border-primary/20">
              <p className="text-sm text-zinc-300">
                <strong className="text-primary">Quer um orçamento?</strong>{" "}
                <a href="/briefing" className="underline hover:text-primary transition-colors">
                  Acesse nosso formulário de briefing
                </a> para solicitar propostas detalhadas.
              </p>
            </div>
          </div>

          {/* Right - Form */}
          <div className="magnetto-glass p-6 md:p-8 lg:p-10">
            <div className="mb-8">
              <span className="font-pixel text-xs text-zinc-400 tracking-[0.2em]">
                {content.sectionLabel}
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 text-sm mb-2">
                    Primeiro nome *
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    placeholder="João"
                    className="w-full px-4 py-3 rounded-xl bg-zinc-800/50 border border-zinc-700 text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 text-sm mb-2">
                    Sobrenome
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    placeholder="Silva"
                    className="w-full px-4 py-3 rounded-xl bg-zinc-800/50 border border-zinc-700 text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              {/* Contact Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 text-sm mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="joao@email.com"
                    className="w-full px-4 py-3 rounded-xl bg-zinc-800/50 border border-zinc-700 text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 text-sm mb-2">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="(35) 99999-9999"
                    className="w-full px-4 py-3 rounded-xl bg-zinc-800/50 border border-zinc-700 text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              {/* Contact Type - ESTILIZADO */}
              <div>
                <label className="block text-zinc-400 text-sm mb-2">
                  Motivo do Contato
                </label>
                <select
                  value={formData.contactType}
                  onChange={(e) =>
                    setFormData({ ...formData, contactType: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white focus:outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%23c4ff0d' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                    backgroundPosition: 'right 0.75rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em',
                    paddingRight: '2.5rem'
                  }}
                >
                  <option value="duvida" className="bg-zinc-900 text-white">💬 Dúvida</option>
                  <option value="sugestao" className="bg-zinc-900 text-white">💡 Sugestão</option>
                  <option value="reclamacao" className="bg-zinc-900 text-white">⚠️ Reclamação</option>
                  <option value="elogio" className="bg-zinc-900 text-white">👍 Elogio</option>
                  <option value="newsletter" className="bg-zinc-900 text-white">📧 Quero receber novidades</option>
                  <option value="outro" className="bg-zinc-900 text-white">📝 Outro</option>
                </select>
              </div>

              {/* Message */}
              <div>
                <label className="block text-zinc-400 text-sm mb-2">
                  Mensagem *
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  placeholder={
                    formData.contactType === 'newsletter'
                      ? 'Deixe uma mensagem ou apenas envie para se cadastrar!'
                      : content.form.messagePlaceholder
                  }
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-800/50 border border-zinc-700 text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary transition-colors resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-full bg-white text-black font-pixel text-sm hover:bg-zinc-200 transition-colors flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    ENVIANDO...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    {content.form.submitButton}
                  </>
                )}
              </button>

              <p className="text-xs text-zinc-500 text-center">
                Ao enviar, você concorda com nossa{" "}
                <a href="/privacidade" className="underline hover:text-primary">
                  Política de Privacidade
                </a>
                .
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}