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

// Admin Pages
import Login from "@/pages/Login";
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminClients from "@/pages/admin/Clients";
import AdminGenerators from "@/pages/admin/Generators";
import AdminSettings from "@/pages/admin/Settings";
import AdminAIProviders from "@/pages/admin/AIProviders";
import NotFound from "@/pages/NotFound";

// Client Pages
import ClientLogin from "@/pages/client/Login";
import ClientPlans from "@/pages/client/Plans";
import ClientDashboard from "@/pages/client/Dashboard";
import ClientGenerators from "@/pages/client/Generators";
import ClientHistory from "@/pages/client/History";
import ClientSupport from "@/pages/client/Support";
import ClientBlocked from "@/pages/client/Blocked";
import ClientExpired from "@/pages/client/Expired";
import GeneratorPage from "@/pages/client/Generator";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/client/login" element={<ClientLogin />} />
            <Route path="/plans" element={<ClientPlans />} />
            
            {/* Redirect root to login or dashboard */}
            <Route path="/" element={<Navigate to="/login" replace />} />

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
              <Route path="generators" element={<ClientGenerators />} />
              <Route path="history" element={<ClientHistory />} />
              <Route path="support" element={<ClientSupport />} />
            </Route>

            {/* Generator page (standalone for full-screen experience) */}
            <Route
              path="/client/generator/:slug"
              element={
                <ClientRoute>
                  <GeneratorPage />
                </ClientRoute>
              }
            />

            {/* Client error pages (no auth needed to show error) */}
            <Route path="/client/blocked" element={<ClientBlocked />} />
            <Route path="/client/expired" element={<ClientExpired />} />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
