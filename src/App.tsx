import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ClientRoute } from "@/components/ClientRoute";
import { AdminLayout } from "@/layouts/AdminLayout";
import { ClientLayout } from "@/layouts/ClientLayout";
import { CodeProtectionProvider } from "@/components/CodeProtectionProvider";

// Admin Pages
import Login from "@/pages/Login";
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminClients from "@/pages/admin/Clients";
import AdminGenerators from "@/pages/admin/Generators";
import AdminSettings from "@/pages/admin/Settings";
import AdminAIProviders from "@/pages/admin/AIProviders";
import AdminPayments from "@/pages/admin/Payments";
import AdminBudgets from "@/pages/admin/Budgets";
import AdminPropostas from "@/pages/admin/Propostas";
import AdminInvoices from "@/pages/admin/Invoices";
import AdminBriefings from "@/pages/admin/Briefings";
import AdminPortfolio from "@/pages/admin/Portfolio";
import AdminNotasFiscais from "@/pages/admin/NotasFiscais";
import AdminServices from "@/pages/admin/Services";
import AdminAtendimento from "@/pages/admin/Atendimento";
import AdminPedidos from "@/pages/admin/Pedidos";
import AdminEntregas from "@/pages/admin/Entregas";
import AdminChat from "@/pages/admin/Chat";
import AdminAgenda from "@/pages/admin/Agenda";
import NotFound from "@/pages/NotFound";
import Platform from "@/pages/Platform";
import AdminGeneratorPreview from "@/pages/admin/AdminGeneratorPreview";
import PromptGenerator from "@/pages/PromptGenerator";
import ArcanoHub from "@/pages/admin/ArcanoHub";
import ArcanoCloner from "@/pages/admin/ArcanoCloner";
import ArcanoUpscaler from "@/pages/admin/arcano/ArcanoUpscaler";
import ArcanoPoseChanger from "@/pages/admin/arcano/ArcanoPoseChanger";
import ArcanoVesteAI from "@/pages/admin/arcano/ArcanoVesteAI";
import ArcanoGerarImagem from "@/pages/admin/arcano/ArcanoGerarImagem";
import BibliotecaPrompts from "@/pages/admin/arcano/BibliotecaPrompts";
import FerramentasIA from "@/pages/admin/arcano/FerramentasIA";

// Public Pages
import Terms from "@/pages/public/Terms";
import Privacy from "@/pages/public/Privacy";
import Home from "@/pages/Home";
import PublicBriefing from "@/pages/public/Briefing";
import PedidoAcompanhamento from "@/pages/public/PedidoAcompanhamento";
import EntregaDownload from "@/pages/public/EntregaDownload";
import Portfolio from "@/pages/public/Portfolio";
import Consultar from "@/pages/public/Consultar";
import PrefeituraVIP from "@/pages/prefeitura/PrefeituraVIP";
import PrefeituraMaisFacil from "@/pages/prefeitura/PrefeituraMaisFacil";
import GeradorAvisos from "@/pages/prefeitura/GeradorAvisos";
import SolicitacaoArtes from "@/pages/prefeitura/SolicitacaoArtes";
import BrandKit from "@/pages/prefeitura/BrandKit";
import ModelosOficiais from "@/pages/prefeitura/ModelosOficiais";
import EditalDecretos from "@/pages/prefeitura/EditalDecretos";
import ConsultarSolicitacao from "@/pages/prefeitura/ConsultarSolicitacao";
import PrefeituraArtePage from "@/pages/prefeitura/PrefeituraArtePage";
import Secretarias from "@/pages/prefeitura/Secretarias";
import PublicTracking from "@/pages/PublicTracking";
import AdminSolicitacoes from "@/pages/admin/AdminSolicitacoes";
import AdminProtocols from "@/pages/admin/AdminProtocols";
import AdminBiblioteca from "@/pages/admin/AdminBiblioteca";
import SolicitarServico from "@/pages/public/SolicitarServico";

// Client Pages
import ClientLogin from "@/pages/client/Login";
import ClientSignup from "@/pages/client/Signup";
import ClientSignupSuccess from "@/pages/client/SignupSuccess";
import ClientForgotPassword from "@/pages/client/ForgotPassword";
import ClientResetPassword from "@/pages/client/ResetPassword";
import ClientPlans from "@/pages/client/Plans";
import ClientDashboard from "@/pages/client/Dashboard";
import ClientGeradores from "@/pages/client/Geradores";
import ClientHistorico from "@/pages/client/Historico";
import ClientPerfil from "@/pages/client/Perfil";
import ClientBlocked from "@/pages/client/Blocked";
import ClientExpired from "@/pages/client/Expired";
import ClientCreditsExhausted from "@/pages/client/CreditsExhausted";
import ClientFaturas from "@/pages/client/Faturas";
import ClientOrcamentos from "@/pages/client/ClientOrcamentos";
import ClientPedidos from "@/pages/client/ClientPedidos";
import GeneratorPage from "@/pages/client/Generator";
import ClientMateriais from "@/pages/client/ClientMateriais";
import ClientMateriaisDetail from "@/pages/client/ClientMateriaisDetail";

// Faculdade Pages
import { FaculdadeRoute } from "@/components/FaculdadeRoute";
import FaculdadeHub from "@/pages/client/faculdade/FaculdadeHub";
import FASBHome from "@/pages/client/faculdade/FASBHome";
import UniversitarioHome from "@/pages/client/faculdade/UniversitarioHome";
import FaculdadeSolicitacoes from "@/pages/client/faculdade/FaculdadeSolicitacoes";
import CampanhasPage from "@/pages/client/faculdade/CampanhasPage";
import CampanhaDetail from "@/pages/client/faculdade/CampanhaDetail";
import AdminCampanhas from "@/pages/admin/AdminCampanhas";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CodeProtectionProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/client/login" element={<ClientLogin />} />
              <Route path="/registro" element={<ClientSignup />} />
              <Route path="/registro-sucesso" element={<ClientSignupSuccess />} />
              <Route path="/recuperar-senha" element={<ClientForgotPassword />} />
              <Route path="/nova-senha" element={<ClientResetPassword />} />
              <Route path="/plans" element={<ClientPlans />} />
              <Route path="/platform" element={<Platform />} />
              <Route path="/pacotes" element={<Navigate to="/platform" replace />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/briefing" element={<PublicBriefing />} />
              <Route path="/pedido/:protocolo" element={<PedidoAcompanhamento />} />
              <Route path="/entrega/:token" element={<EntregaDownload />} />
              <Route path="/consultar" element={<Consultar />} />
              <Route path="/termos" element={<Terms />} />
              <Route path="/privacidade" element={<Privacy />} />
              <Route path="/prefeitura" element={<PrefeituraVIP />} />
              <Route path="/prefeitura/gerador-conteudo" element={<PrefeituraMaisFacil />} />
              <Route path="/prefeitura/gerador-avisos" element={<GeradorAvisos />} />
              <Route path="/prefeitura/solicitacao-artes" element={<SolicitacaoArtes />} />
              <Route path="/prefeitura/brand-kit" element={<BrandKit />} />
              <Route path="/prefeitura/modelos-oficiais" element={<ModelosOficiais />} />
              <Route path="/prefeitura/edital-decretos" element={<EditalDecretos />} />
              <Route path="/prefeitura/secretarias" element={<Secretarias />} />
              <Route path="/prefeitura/consultar" element={<ConsultarSolicitacao />} />
              <Route path="/prefeitura/arte" element={<PrefeituraArtePage />} />
              <Route path="/acompanhar/:protocolo" element={<PublicTracking />} />
              <Route path="/solicitar-servico" element={<SolicitarServico />} />

              {/* Faculdade routes */}
              <Route path="/faculdade" element={<FaculdadeRoute><FaculdadeHub /></FaculdadeRoute>} />
              <Route path="/faculdade/fasb" element={<FaculdadeRoute><FASBHome /></FaculdadeRoute>} />
              <Route path="/faculdade/universitario" element={<FaculdadeRoute><UniversitarioHome /></FaculdadeRoute>} />
              <Route path="/faculdade/solicitacoes" element={<FaculdadeRoute><FaculdadeSolicitacoes /></FaculdadeRoute>} />
              <Route path="/faculdade/:unit/campanhas" element={<FaculdadeRoute><CampanhasPage /></FaculdadeRoute>} />
              <Route path="/faculdade/:unit/campanhas/:slug" element={<FaculdadeRoute><CampanhaDetail /></FaculdadeRoute>} />

              {/* Public Landing Page */}
              <Route path="/" element={<Home />} />

              {/* Admin routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="clients" element={<AdminClients />} />
                <Route path="generators" element={<AdminGenerators />} />
                <Route path="ai-providers" element={<AdminAIProviders />} />
                <Route path="payments" element={<AdminPayments />} />
                <Route path="pedidos" element={<AdminPedidos />} />
                <Route path="entregas" element={<AdminEntregas />} />
                <Route path="briefings" element={<AdminBriefings />} />
                <Route path="servicos" element={<AdminServices />} />
                <Route path="atendimento" element={<AdminAtendimento />} />
                <Route path="budgets" element={<AdminBudgets />} />
                <Route path="propostas" element={<AdminPropostas />} />
                <Route path="invoices" element={<AdminInvoices />} />
                <Route path="notas-fiscais" element={<AdminNotasFiscais />} />
                <Route path="portfolio" element={<AdminPortfolio />} />
                <Route path="chat" element={<AdminChat />} />
                <Route path="agenda" element={<AdminAgenda />} />
                <Route path="solicitacoes-prefeitura" element={<AdminSolicitacoes />} />
                <Route path="protocolos" element={<AdminProtocols />} />
                <Route path="biblioteca" element={<AdminBiblioteca />} />
                <Route path="prompt-generator" element={<PromptGenerator />} />
                <Route path="gerador/:slug" element={<AdminGeneratorPreview />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="arcano" element={<ArcanoHub />} />
                <Route path="arcano/cloner" element={<ArcanoCloner />} />
                <Route path="arcano/upscaler" element={<ArcanoUpscaler />} />
                <Route path="arcano/pose-changer" element={<ArcanoPoseChanger />} />
                <Route path="arcano/veste-ai" element={<ArcanoVesteAI />} />
                <Route path="arcano/gerar-imagem" element={<ArcanoGerarImagem />} />
                <Route path="arcano/biblioteca-prompts" element={<BibliotecaPrompts />} />
                <Route path="arcano/ferramentas-ia" element={<FerramentasIA />} />
                <Route path="campanhas" element={<AdminCampanhas />} />
              </Route>

              {/* Client routes */}
              <Route
                path="/client"
                element={
                  <ClientRoute>
                    <ClientLayout />
                  </ClientRoute>
                }
              >
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<ClientDashboard />} />
                <Route path="geradores" element={<ClientGeradores />} />
                <Route path="historico" element={<ClientHistorico />} />
                <Route path="orcamentos" element={<ClientOrcamentos />} />
                <Route path="pedidos" element={<ClientPedidos />} />
                <Route path="faturas" element={<ClientFaturas />} />
                <Route path="perfil" element={<ClientPerfil />} />
                <Route path="materiais" element={<ClientMateriais />} />
                <Route path="materiais/:slug" element={<ClientMateriaisDetail />} />
              </Route>

              {/* Generator page (standalone for full-screen experience) */}
              <Route
                path="/client/gerador/:slug"
                element={
                  <ClientRoute>
                    <GeneratorPage />
                  </ClientRoute>
                }
              />

              {/* Client error pages (no auth needed to show error) */}
              <Route path="/client/blocked" element={<ClientBlocked />} />
              <Route path="/client/expired" element={<ClientExpired />} />
              <Route path="/client/creditos-esgotados" element={<ClientCreditsExhausted />} />

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </CodeProtectionProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
