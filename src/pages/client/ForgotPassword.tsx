import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, Palette, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error('Digite seu email');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/nova-senha`,
      });

      if (error) {
        console.error('Erro ao enviar email:', error);
        // Don't reveal if email exists or not for security
      }

      // Always show success message for security (don't reveal if email exists)
      setIsSuccess(true);

    } catch (err) {
      console.error('Erro inesperado:', err);
      toast.error('Erro ao processar solicitação');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="w-full max-w-md text-center">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center">
              <Palette className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>

          {/* Success Icon */}
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-primary" />
          </div>

          <h2 className="text-2xl font-semibold text-foreground mb-3">
            Verifique seu email
          </h2>
          <p className="text-muted-foreground mb-8">
            Se este email existir em nossa base, você receberá instruções para redefinir sua senha em instantes.
          </p>

          <Link to="/client/login">
            <Button variant="outline" className="rounded-2xl">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao login
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
            <p className="text-muted-foreground text-sm font-light">Recuperar Senha</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-card rounded-3xl p-8 shadow-lg">
          <h2 className="text-2xl font-semibold text-foreground mb-2 text-center">
            Esqueceu sua senha?
          </h2>
          <p className="text-muted-foreground text-center mb-6">
            Digite seu email e enviaremos instruções para redefinir sua senha.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
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
                  Enviando...
                </>
              ) : (
                'Enviar link de recuperação'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/client/login" className="text-primary hover:underline text-sm font-medium inline-flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Voltar ao login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
