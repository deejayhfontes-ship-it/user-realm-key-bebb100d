import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Megaphone, GraduationCap, Library, Download, Settings } from "lucide-react";
import TabCampanhas from "@/components/gerador/TabCampanhas";
import TabCursos from "@/components/gerador/TabCursos";
import TabGerenciarCursos from "@/components/gerador/TabGerenciarCursos";
import TabBiblioteca from "@/components/gerador/TabBiblioteca";
import TabExportacao from "@/components/gerador/TabExportacao";
import nuppeFasbLogo from "@/assets/nuppe-fasb-logo.png";

const tabs = [
  { id: "campanhas", label: "Campanhas", icon: Megaphone },
  { id: "cursos", label: "Cursos", icon: GraduationCap },
  { id: "gerenciar", label: "Gerenciar Cursos", icon: Settings },
  { id: "biblioteca", label: "Biblioteca", icon: Library },
  { id: "exportacao", label: "Exportação", icon: Download },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function Gerador() {
  const [activeTab, setActiveTab] = useState<TabId>("campanhas");

  return (
    <div className="min-h-screen bg-background bg-dot-pattern">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Voltar</span>
            </Link>
            <div className="w-px h-6 bg-border" />
            <div className="flex items-center gap-3">
              <img src={nuppeFasbLogo} alt="NUPPE FASB" className="h-6 object-contain" />
              <h1 className="font-display font-bold text-sm sm:text-base tracking-wider text-foreground uppercase">
                Gerador de Peças
              </h1>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="container mx-auto px-4 sm:px-6">
          <nav className="flex gap-1 -mb-px overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 font-display text-xs sm:text-sm font-semibold tracking-wider uppercase border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Content */}
      <motion.main
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="container mx-auto px-4 sm:px-6 py-6"
      >
        {activeTab === "campanhas" && <TabCampanhas />}
        {activeTab === "cursos" && <TabCursos />}
        {activeTab === "gerenciar" && <TabGerenciarCursos />}
        {activeTab === "biblioteca" && <TabBiblioteca />}
        {activeTab === "exportacao" && <TabExportacao />}
      </motion.main>
    </div>
  );
}
