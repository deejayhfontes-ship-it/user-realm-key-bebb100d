import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Loader2, Send } from "lucide-react";
import { landingContent } from "@/data/landingContent";
import { CustomSelect, projectTypeOptions } from "./CustomSelect";

export function ContactSection() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    projectType: "",
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
      const { error } = await supabase.from("briefings").insert({
        nome: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        telefone: formData.phone || null,
        tipo_projeto: formData.projectType || null,
        descricao: formData.message,
        status: "novo",
        prioridade: "normal",
      });

      if (error) throw error;

      toast({
        title: "Briefing enviado! 🎉",
        description: content.form.successMessage,
      });

      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        projectType: "",
        message: "",
      });
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

  return (
    <section
      id="contact"
      className="relative section-padding overflow-hidden"
    >
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.9), rgba(0,0,0,0.7)), url('https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1600&q=80')`,
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left - Title */}
          <div>
            <h2 className="magnetto-title text-5xl md:text-7xl lg:text-8xl text-white leading-[0.9]">
              {content.title}
            </h2>
            <p className="text-zinc-400 text-lg mt-8 max-w-md">
              {content.description}
            </p>
          </div>

          {/* Right - Form */}
          <div className="magnetto-glass p-8 md:p-10">
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

              {/* Project Type */}
              <div>
                <label className="block text-zinc-400 text-sm mb-2">
                  Tipo de Projeto
                </label>
                <CustomSelect
                  value={formData.projectType}
                  onChange={(value) =>
                    setFormData({ ...formData, projectType: value })
                  }
                  options={projectTypeOptions}
                  placeholder="Selecione..."
                />
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
                  placeholder={content.form.messagePlaceholder}
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
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
