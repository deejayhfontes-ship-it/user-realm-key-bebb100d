import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminLayout } from "@/layouts/AdminLayout";

// Pages
import Login from "@/pages/Login";
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminClients from "@/pages/admin/Clients";
import AdminGenerators from "@/pages/admin/Generators";
import AdminSettings from "@/pages/admin/Settings";
import NotFound from "@/pages/NotFound";

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
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            {/* Client routes (placeholder) */}
            <Route
              path="/client"
              element={
                <ProtectedRoute>
                  <div className="min-h-screen flex items-center justify-center bg-background">
                    <p className="text-muted-foreground">Área do cliente em construção...</p>
                  </div>
                </ProtectedRoute>
              }
            />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
