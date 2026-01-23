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
      
      if (role === 'admin') {
        console.log('➡️ Redirecionando para /admin/dashboard');
        navigate('/admin/dashboard');
      } else {
        console.log('➡️ Redirecionando para /client');
        navigate('/client');
      }
    } catch (err) {
      console.error('❌ Erro inesperado:', err);
      toast.error('Erro inesperado ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/20 rounded-full blur-3xl" />
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md">
        <div className="glass-card p-8 shadow-2xl card-shadow">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/20 mb-4">
              <Palette className="w-8 h-8 text-accent" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Fontes Graphics</h1>
            <p className="text-sm text-muted-foreground mt-1">Platform</p>
            <p className="text-muted-foreground mt-3">Acesse sua conta</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-card border-border text-foreground placeholder:text-muted-foreground focus:border-accent focus:ring-accent/20"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">
                Senha
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-card border-border text-foreground placeholder:text-muted-foreground focus:border-accent focus:ring-accent/20"
                  disabled={isLoading}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>

          {/* Footer */}
          <p className="text-center text-muted-foreground text-sm mt-6">
            Esqueceu a senha? Entre em contato com o administrador.
          </p>
        </div>
      </div>
    </div>
  );
}
