import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Lock, Mail, Palette } from 'lucide-react';
import { toast } from 'sonner';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Preencha todos os campos');
      return;
    }

    setIsLoading(true);
    console.log('🚀 Tentando login com:', email);

    try {
      const { error, role } = await signIn(email, password);

      if (error) {
        console.error('❌ Erro no login:', error.message);
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Email ou senha incorretos. Verifique se o usuário existe no Supabase Auth.');
        } else {
          toast.error(error.message || 'Email ou senha incorretos');
        }
        return;
      }

      console.log('✅ Login OK! Role:', role);
      toast.success('Login realizado com sucesso!');
      
      // Check if user is a prefeitura VIP user
      const isPrefeitura = email.toLowerCase().includes('@prefeitura');
      
      if (role === 'admin') {
        console.log('➡️ Redirecionando para /admin/dashboard');
        navigate('/admin/dashboard');
      } else if (isPrefeitura) {
        console.log('➡️ Redirecionando para /prefeitura');
        navigate('/prefeitura');
      } else {
        console.log('➡️ Redirecionando para /client/dashboard');
        navigate('/client/dashboard');
      }
    } catch (err) {
      console.error('❌ Erro inesperado:', err);
      toast.error('Erro inesperado ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 md:p-6">
      {/* Large container with two columns */}
      <div className="w-full max-w-5xl flex flex-col lg:flex-row rounded-[2rem] md:rounded-[2.5rem] overflow-hidden soft-card-elevated">
        
        {/* Left side - Branding / Decorative */}
        <div className="hidden lg:flex lg:w-1/2 bg-secondary p-12 flex-col justify-between relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-primary/10 blur-3xl" />
          
          {/* Logo area */}
          <div className="relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-6">
              <Palette className="w-7 h-7 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-secondary-foreground tracking-tight">
              Fontes Graphics
            </h1>
            <p className="text-secondary-foreground/50 text-sm mt-1 font-light">Platform</p>
          </div>

          {/* Feature highlights */}
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-secondary-foreground">Geradores Rápidos</p>
                <p className="text-sm text-secondary-foreground/50 font-light">Crie artes em segundos</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-secondary-foreground">Templates Premium</p>
                <p className="text-sm text-secondary-foreground/50 font-light">Designs profissionais</p>
              </div>
            </div>
          </div>

          {/* Decorative lime bar */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="h-1.5 flex-1 rounded-full bg-primary/20">
              <div className="h-full w-2/3 rounded-full bg-primary" />
            </div>
            <span className="text-xs text-secondary-foreground/40 font-light">v2.0</span>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="w-full lg:w-1/2 p-6 sm:p-8 md:p-12 flex flex-col justify-center bg-card">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary mb-4">
              <Palette className="w-7 h-7 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Fontes Graphics</h1>
            <p className="text-muted-foreground text-sm font-light">Platform</p>
          </div>

          {/* Welcome text */}
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-semibold text-foreground tracking-tight">
              Acesse sua conta
            </h2>
            <p className="text-muted-foreground mt-2 font-light">
              Entre com suas credenciais para continuar
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground font-medium">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12 h-13 bg-muted/50 border-0 rounded-2xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground font-medium">
                Senha
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 h-13 bg-muted/50 border-0 rounded-2xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30"
                  disabled={isLoading}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-13 bg-primary hover:brightness-105 text-primary-foreground font-semibold rounded-2xl shadow-lg shadow-primary/25 transition-all mt-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>

          {/* Footer */}
          <p className="text-center text-muted-foreground text-sm mt-8 font-light">
            Esqueceu a senha? Entre em contato com o administrador.
          </p>
        </div>
      </div>
    </div>
  );
}
