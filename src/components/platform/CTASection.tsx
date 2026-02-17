import { Link } from "react-router-dom";
import { NeonButton } from "./NeonButton";
import { ArrowRight } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-24 bg-gradient-to-b from-black to-[#0a0a0a] relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-lime-400/20 rounded-full blur-[128px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Pronto para <span className="text-lime-400">automatizar</span> suas artes?
          </h2>
          <p className="text-xl text-zinc-400 mb-8">
            Junte-se a dezenas de empresas que já economizam tempo e dinheiro com nossa plataforma.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Link to="/client/login">
              <NeonButton size="lg">
                Criar Conta Gratuita
                <ArrowRight className="h-5 w-5" />
              </NeonButton>
            </Link>
          </div>

          <p className="text-zinc-500 text-sm">
            ✓ Sem cartão de crédito &nbsp;&nbsp; ✓ Setup em 2 minutos &nbsp;&nbsp; ✓ Cancele quando quiser
          </p>
        </div>
      </div>
    </section>
  );
}
