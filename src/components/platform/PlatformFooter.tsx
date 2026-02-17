import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

export function PlatformFooter() {
  return (
    <footer className="py-12 bg-[#0a0a0a] border-t border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-lime-400 rounded-xl flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-black" />
            </div>
            <div>
              <span className="text-white font-semibold">Fontes Graphics</span>
              <span className="text-lime-400 font-semibold"> Platform</span>
            </div>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm text-zinc-400">
            <a 
              href="https://fontesgraphicsdesign.com.br" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              Site Principal
            </a>
            <Link to="/termos" className="hover:text-white transition-colors">
              Termos de Uso
            </Link>
            <Link to="/privacidade" className="hover:text-white transition-colors">
              Privacidade
            </Link>
          </div>

          {/* Copyright */}
          <p className="text-zinc-500 text-sm">
            © {new Date().getFullYear()} Fontes Graphics. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
