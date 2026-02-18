import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { AlertCircle, Search, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function Consultar() {
  const navigate = useNavigate();
  const [protocolo, setProtocolo] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!protocolo.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: queryError } = await supabase
        .from("pedidos")
        .select("protocolo")
        .eq("protocolo", protocolo.trim().toUpperCase())
        .maybeSingle();

      if (queryError) throw queryError;

      if (data) {
        navigate(`/acompanhar/${data.protocolo}`);
      } else {
        setError("Pedido não encontrado. Verifique o número e tente novamente.");
      }
    } catch (err) {
      console.error("Erro ao consultar pedido:", err);
      setError("Erro ao consultar pedido. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProtocolo(e.target.value.toUpperCase());
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white">
      <Navbar />

      {/* Hero Section */}
      <section
        className="min-h-[250px] md:h-[300px] flex flex-col items-center justify-center pt-20 px-4"
        style={{ background: "linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)" }}
      >
        <h1 className="text-3xl sm:text-4xl md:text-[48px] font-bold text-white text-center mb-3">
          Consultar Pedido
        </h1>
        <p className="text-base md:text-lg text-white/70 text-center max-w-md">
          Acompanhe o status do seu pedido em tempo real
        </p>
      </section>

      {/* Form Container */}
      <section className="py-8 md:py-12 px-4 md:px-6">
        <div
          className="max-w-[600px] mx-auto p-6 sm:p-8 md:p-12 rounded-[24px]"
          style={{
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)"
          }}
        >
          <form onSubmit={handleSubmit}>
            {/* Input Label */}
            <label
              htmlFor="protocolo"
              className="block text-sm text-white/80 mb-2"
            >
              Número do pedido
            </label>

            {/* Input Field */}
            <input
              id="protocolo"
              type="text"
              value={protocolo}
              onChange={handleInputChange}
              placeholder="PED-2025-00123"
              className="w-full px-4 py-4 text-lg text-white uppercase bg-white/10 border border-white/20 rounded-xl placeholder:text-white/40 focus:outline-none focus:border-[#c4ff0d] transition-colors"
            />

            {/* Helper Text */}
            <p className="text-xs text-white/60 mt-2">
              Digite o número do pedido que você recebeu por email
            </p>

            {/* Error Alert */}
            {error && (
              <div
                className="flex items-center gap-3 p-4 mt-6 rounded-xl"
                style={{
                  background: "rgba(255,0,0,0.1)",
                  border: "1px solid rgba(255,0,0,0.3)"
                }}
              >
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!protocolo.trim() || isLoading}
              className="w-full mt-6 py-3.5 px-6 rounded-xl font-semibold text-base bg-[#c4ff0d] text-[#1a1a1a] hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Consultando...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Consultar
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <Link
            to="/client/login"
            className="block text-center mt-6 text-sm text-[#c4ff0d] hover:underline"
          >
            Não sabe o número? Faça login para ver seus pedidos
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
