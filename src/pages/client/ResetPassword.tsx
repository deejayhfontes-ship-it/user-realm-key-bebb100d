import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Lock, Palette, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we have a valid session from the reset link
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      // If user came from email link, they should have a session
      if (session) {
        setIsValidToken(true);
      } else {
        // Check for access_token in URL (Supabase redirects with this)
        const accessToken = searchParams.get('access_token');
        const type = searchParams.get('type');
        
        if (accessToken && type === 'recovery') {
          // Try to set the session
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: searchParams.get('refresh_token') || '',
          });
          
          if (!error) {
            setIsValidToken(true);
          } else {
            setIsValidToken(false);
          }
        } else {
          setIsValidToken(false);
        }
      }
    };

    checkSession();
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      toast.error('Senha deve ter pelo menos 8 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('As senhas não conferem');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        console.error('Erro ao atualizar senha:', error);
        toast.error('Erro ao atualizar senha. Tente novamente.');
        return;
      }

      toast.success('Senha atualizada com sucesso!');
      navigate('/client/login');

    } catch (err) {
      console.error('Erro inesperado:', err);
      toast.error('Erro ao atualizar senha');
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (isValidToken === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Invalid token
  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="w-full max-w-md text-center">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center">
              <Palette className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>

          {/* Error Icon */}
          <div className="w-20 h-20 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10 text-destructive" />
          </div>

          <h2 className="text-2xl font-semibold text-foreground mb-3">
            Link expirado ou inválido
          </h2>
          <p className="text-muted-foreground mb-8">
            Este link de recuperação não é mais válido. Por favor, solicite uma nova recuperação de senha.
          </p>

          <Link to="/recuperar-senha">
            <Button className="rounded-2xl bg-primary hover:brightness-105 text-primary-foreground">
              Solicitar nova recuperação
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center">
            <Palette className="w-6 h-6 text-primary-foreground" />
          </div>
          <div className="text-left">
            <h1 className="text-xl font-bold text-foreground tracking-tight">Fontes Graphics</h1>
            <p className="text-muted-foreground text-sm font-light">Nova Senha</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-card rounded-3xl p-8 shadow-lg">
          <h2 className="text-2xl font-semibold text-foreground mb-2 text-center">
            Defina sua nova senha
          </h2>
          <p className="text-muted-foreground text-center mb-6">
            Escolha uma senha forte com pelo menos 8 caracteres.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground font-medium">
                Nova Senha
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mínimo 8 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 pr-12 h-12 bg-muted/50 border-0 rounded-2xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-foreground font-medium">
                Confirmar Nova Senha
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Repita a nova senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-12 h-12 bg-muted/50 border-0 rounded-2xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30"
                  disabled={isLoading}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-primary hover:brightness-105 text-primary-foreground font-semibold rounded-2xl"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Atualizando...
                </>
              ) : (
                'Atualizar Senha'
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
