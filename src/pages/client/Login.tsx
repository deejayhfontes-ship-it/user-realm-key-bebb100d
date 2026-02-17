import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Lock, Mail, Palette, Eye, EyeOff, Sparkles, Zap, Shield, Headphones } from 'lucide-react';
import { toast } from 'sonner';

export default function ClientLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    console.log('🚀 Tentando login cliente com:', email);

    try {
      const { error, role } = await signIn(email, password);

      if (error) {
        console.error('❌ Erro no login:', error.message);
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Email ou senha incorretos');
        } else {
          toast.error(error.message || 'Erro ao fazer login');
        }
        return;
      }

      console.log('✅ Login OK! Role:', role);
      
      const isPrefeitura = email.toLowerCase().includes('@prefeitura');
      
      if (role === 'admin') {
        toast.info('Redirecionando para área administrativa...');
        navigate('/admin/dashboard');
      } else if (isPrefeitura) {
        toast.success('Bem-vindo! Redirecionando para área VIP...');
        navigate('/prefeitura');
      } else {
        toast.success('Bem-vindo de volta!');
        navigate('/client/dashboard');
      }
    } catch (err) {
      console.error('❌ Erro inesperado:', err);
      toast.error('Erro inesperado ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    { icon: Zap, title: 'Geradores Rápidos', description: 'Crie artes em segundos' },
    { icon: Sparkles, title: 'Templates Premium', description: 'Designs profissionais' },
    { icon: Shield, title: 'Suporte Dedicado', description: 'Atendimento prioritário' },
  ];

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left side - Login Form */}
      <div className="w-full lg:w-1/2 p-6 md:p-12 flex flex-col justify-center">
        <div className="w-full max-w-md mx-auto lg:ml-auto lg:mr-16">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center">
              <Palette className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground tracking-tight">Fontes Graphics</h1>
              <p className="text-muted-foreground text-sm font-light">Área do Cliente</p>
            </div>
          </div>

          {/* Welcome text */}
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-semibold text-foreground tracking-tight">
              Bem-vindo de volta
            </h2>
            <p className="text-[#666666] mt-2 font-light leading-relaxed">
              Acesse sua conta para gerenciar seus projetos
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#333333] font-medium">
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
              <Label htmlFor="password" className="text-[#333333] font-medium">
                Senha
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 pr-12 h-13 bg-muted/50 border-0 rounded-2xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30"
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

            <div className="flex items-center justify-end mb-4">
              <Link to="/recuperar-senha" className="text-sm text-[#1a1a1a] hover:text-primary hover:underline">
                Esqueceu a senha?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full h-13 bg-primary hover:brightness-105 text-primary-foreground font-semibold rounded-2xl shadow-lg shadow-primary/25 transition-all"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar na Plataforma'
              )}
            </Button>
          </form>

          {/* Signup link */}
          <div className="text-center mt-6 mb-6">
            <p className="text-sm">
              <span className="text-[#1a1a1a]">Ainda não tem conta?</span>{' '}
              <Link to="/registro" className="text-[#1a1a1a] hover:text-primary hover:underline">
                Criar conta grátis
              </Link>
            </p>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#333333]" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-background px-4 text-sm text-[#1a1a1a]">ou</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <Link to="/plans">
              <Button
                variant="outline"
                className="w-full h-12 rounded-2xl border-[#333333] text-[#1a1a1a] hover:bg-primary/10 hover:border-primary"
              >
                <Sparkles className="w-4 h-4 mr-2 text-[#1a1a1a]" />
                Ver Planos e Preços
              </Button>
            </Link>
            
            <Button
              variant="ghost"
              className="w-full h-12 rounded-2xl text-[#1a1a1a] hover:text-primary"
              onClick={() => window.open('mailto:suporte@fontesgraphics.com', '_blank')}
            >
              <Headphones className="w-4 h-4 mr-2" />
              Suporte ao Cliente
            </Button>
          </div>

          {/* Admin link */}
          <p className="text-center text-[#1a1a1a] text-xs mt-8">
            É administrador?{' '}
            <Link to="/login" className="text-[#1a1a1a] hover:text-primary hover:underline">
              Acessar painel admin
            </Link>
          </p>
        </div>
      </div>

      {/* Right side - Marketing */}
      <div className="hidden lg:flex lg:w-1/2 bg-secondary p-12 flex-col justify-center relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute top-1/4 right-1/4 w-32 h-32 rounded-full bg-primary/15 blur-2xl" />
        
        <div className="relative z-10 max-w-lg ml-16">
          {/* Main headline */}
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/15 text-primary text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Recursos Premium
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-secondary-foreground tracking-tight leading-tight mb-4">
              Transforme suas ideias em arte
            </h2>
            <p className="text-xl text-[#cccccc] font-light leading-relaxed">
              Acesse geradores exclusivos e crie materiais profissionais em segundos.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-6">
            {features.map((feature) => (
              <div key={feature.title} className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-secondary-foreground">{feature.title}</h3>
                  <p className="text-[#b3b3b3] font-light leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="mt-12 flex gap-8">
            <div>
              <div className="text-3xl font-bold text-primary">500+</div>
              <div className="text-sm text-[#b3b3b3]">Clientes ativos</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">10k+</div>
              <div className="text-sm text-[#b3b3b3]">Artes geradas</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">98%</div>
              <div className="text-sm text-[#b3b3b3]">Satisfação</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
