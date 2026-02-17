<<<<<<< HEAD
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
import PromptGenerator from "@/pages/PromptGenerator";

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
import ConsultarSolicitacao from "@/pages/prefeitura/ConsultarSolicitacao";
import PublicTracking from "@/pages/PublicTracking";
import AdminSolicitacoes from "@/pages/admin/AdminSolicitacoes";
import AdminProtocols from "@/pages/admin/AdminProtocols";

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
              <Route path="/prefeitura/consultar" element={<ConsultarSolicitacao />} />
              <Route path="/acompanhar/:protocolo" element={<PublicTracking />} />

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
                <Route path="prompt-generator" element={<PromptGenerator />} />
                <Route path="settings" element={<AdminSettings />} />
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
=======
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
import ConsultarSolicitacao from "@/pages/prefeitura/ConsultarSolicitacao";
import PublicTracking from "@/pages/PublicTracking";
import AdminSolicitacoes from "@/pages/admin/AdminSolicitacoes";
import AdminProtocols from "@/pages/admin/AdminProtocols";

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
              <Route path="/prefeitura/consultar" element={<ConsultarSolicitacao />} />
              <Route path="/acompanhar/:protocolo" element={<PublicTracking />} />

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
                <Route path="settings" element={<AdminSettings />} />
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
>>>>>>> 156f36cf0eee94361ff12bfb77e006213e68283d
