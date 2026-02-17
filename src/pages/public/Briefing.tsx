import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { usePublicServices } from "@/hooks/usePublicServices";
import { useCreatePedido } from "@/hooks/usePedidos";
import { BriefingStepIndicator } from "@/components/briefing/BriefingStepIndicator";
import { BriefingStep1 } from "@/components/briefing/BriefingStep1";
import { BriefingStep2 } from "@/components/briefing/BriefingStep2";
import { BriefingStep3 } from "@/components/briefing/BriefingStep3";
import { BriefingStep4 } from "@/components/briefing/BriefingStep4";
import { BriefingSuccess } from "@/components/briefing/BriefingSuccess";
import { toast } from "sonner";

export interface BriefingFormData {
  // Step 1
  serviceId: string;
  serviceName: string;
  // Step 2
  nome: string;
  email: string;
  telefone: string;
  empresa: string;
  descricao: string;
  prazo: string;
  // Step 3
  referencias: string;
  arquivoUrls: string[];
}

const initialFormData: BriefingFormData = {
  serviceId: "",
  serviceName: "",
  nome: "",
  email: "",
  telefone: "",
  empresa: "",
  descricao: "",
  prazo: "",
  referencias: "",
  arquivoUrls: [],
};

export default function PublicBriefing() {
  const navigate = useNavigate();
  const { services, isLoading: loadingServices } = usePublicServices();
  const createPedido = useCreatePedido();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<BriefingFormData>(initialFormData);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [protocolo, setProtocolo] = useState<string | null>(null);

  const updateFormData = (updates: Partial<BriefingFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const canGoNext = useMemo(() => {
    switch (currentStep) {
      case 1:
        return !!formData.serviceId;
      case 2:
        return !!(formData.nome && formData.email && formData.descricao);
      case 3:
        return true; // References are optional
      case 4:
        return true;
      default:
        return false;
    }
  }, [currentStep, formData]);

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    createPedido.mutate(
      {
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone || undefined,
        empresa: formData.empresa || undefined,
        descricao: formData.descricao,
        prazo_solicitado: formData.prazo || undefined,
        referencias: formData.referencias || undefined,
        arquivo_urls: formData.arquivoUrls,
        service_id: formData.serviceId || undefined,
      },
      {
        onSuccess: (pedido) => {
          setProtocolo(pedido.protocolo);
          setIsSubmitted(true);
        },
        onError: () => {
          toast.error("Erro ao enviar briefing. Tente novamente.");
        },
      }
    );
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] text-white">
        <Navbar />
        <BriefingSuccess protocolo={protocolo} />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white">
      <Navbar />
      
      {/* Hero Section */}
      <section 
        className="min-h-[200px] md:h-[250px] flex flex-col items-center justify-center pt-20 px-4"
        style={{ background: "linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)" }}
      >
        <h1 className="text-2xl sm:text-3xl md:text-[40px] font-bold text-white text-center mb-3">
          Novo Orçamento
        </h1>
        <p className="text-base md:text-lg text-white/70 text-center mb-6 max-w-md">
          Conte-nos sobre seu projeto em detalhes
        </p>
        <button
          onClick={() => navigate("/consultar")}
          className="inline-flex items-center gap-2 px-5 md:px-6 py-2.5 rounded-full border border-[#c4ff0d]/50 text-[#c4ff0d] hover:bg-[#c4ff0d]/10 transition-all duration-300 text-sm font-medium"
        >
          <Search className="w-4 h-4" />
          Consultar Pedido
        </button>
      </section>

      {/* Form Container */}
      <section className="py-8 md:py-12 px-4 md:px-6" style={{ minHeight: "calc(100vh - 250px)" }}>
        <div 
          className="max-w-[800px] mx-auto p-6 sm:p-8 md:p-12 rounded-[24px]"
          style={{ 
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)"
          }}
        >
          {/* Progress Indicator */}
          <BriefingStepIndicator currentStep={currentStep} />

          {/* Step Content */}
          {currentStep === 1 && (
            <BriefingStep1
              services={services}
              loading={loadingServices}
              selectedServiceId={formData.serviceId}
              onSelect={(id, name) => updateFormData({ serviceId: id, serviceName: name })}
              onNext={handleNext}
              canNext={canGoNext}
            />
          )}

          {currentStep === 2 && (
            <BriefingStep2
              formData={formData}
              onChange={updateFormData}
              onNext={handleNext}
              onPrev={handlePrev}
              canNext={canGoNext}
            />
          )}

          {currentStep === 3 && (
            <BriefingStep3
              formData={formData}
              onChange={updateFormData}
              onNext={handleNext}
              onPrev={handlePrev}
            />
          )}

          {currentStep === 4 && (
            <BriefingStep4
              formData={formData}
              services={services}
              onSubmit={handleSubmit}
              onPrev={handlePrev}
              isSubmitting={createPedido.isPending}
            />
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
