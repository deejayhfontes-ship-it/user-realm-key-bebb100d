import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Loader2, Lock, Mail, Palette, Eye, EyeOff, 
  Building2, Phone, Sparkles, CheckCircle2 
} from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

// Validation schema
const signupSchema = z.object({
  companyName: z.string().min(2, 'Nome da empresa deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
  confirmPassword: z.string(),
  whatsapp: z.string().optional(),
  acceptTerms: z.boolean().refine(val => val === true, 'Você deve aceitar os termos'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'As senhas não conferem',
  path: ['confirmPassword'],
});

export default function ClientSignup() {
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate form
    const validation = signupSchema.safeParse({
      companyName,
      email,
      password,
      confirmPassword,
      whatsapp,
      acceptTerms,
    });

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach(err => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    console.log('🚀 Iniciando cadastro:', email);

    try {
      // Step 1: Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/client/login`,
          data: {
            company_name: companyName,
            phone: whatsapp,
          },
        },
      });

      if (authError) {
        console.error('❌ Erro ao criar usuário auth:', authError);
        if (authError.message.includes('already registered')) {
          toast.error('Este email já está cadastrado. Faça login.');
          setErrors({ email: 'Este email já está cadastrado' });
        } else {
          toast.error(authError.message);
        }
        return;
      }

      if (!authData.user) {
        toast.error('Erro ao criar conta. Tente novamente.');
        return;
      }

      console.log('✅ Usuário auth criado:', authData.user.id);

      // Step 2: Create client record
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .insert({
          name: companyName,
          email,
          phone: whatsapp || null,
          type: 'package',
          status: 'pending', // Pending approval/credits
          package_credits: 0,
          package_credits_used: 0,
        })
        .select()
        .single();

      if (clientError) {
        console.error('❌ Erro ao criar cliente:', clientError);
        // Rollback: delete auth user
        await supabase.auth.admin?.deleteUser?.(authData.user.id);
        toast.error('Erro ao criar conta. Tente novamente.');
        return;
      }

      console.log('✅ Cliente criado:', clientData.id);

      // Step 3: Create user record linking to client
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          client_id: clientData.id,
          email,
          password_hash: 'managed_by_supabase_auth',
          role: 'client',
          login_count: 0,
        });

      if (userError) {
        console.error('❌ Erro ao criar usuário:', userError);
        // Rollback: delete client and auth user
        await supabase.from('clients').delete().eq('id', clientData.id);
        toast.error('Erro ao criar conta. Tente novamente.');
        return;
      }

      console.log('✅ Usuário criado com sucesso!');
      toast.success('Conta criada com sucesso!');
      navigate('/registro-sucesso');

    } catch (err) {
      console.error('❌ Erro inesperado:', err);
      toast.error('Erro inesperado ao criar conta');
    } finally {
      setIsLoading(false);
    }
  };

  const benefits = [
    'Acesso a geradores exclusivos',
    'Templates profissionais',
    'Suporte dedicado',
    'Créditos para criar artes',
  ];

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left side - Form */}
      <div className="w-full lg:w-1/2 p-6 md:p-12 flex flex-col justify-center">
        <div className="w-full max-w-md mx-auto lg:ml-auto lg:mr-16">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center">
              <Palette className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground tracking-tight">Fontes Graphics</h1>
              <p className="text-muted-foreground text-sm font-light">Área do Cliente</p>
            </div>
          </div>

          {/* Welcome text */}
          <div className="mb-6">
            <h2 className="text-2xl md:text-3xl font-semibold text-foreground tracking-tight">
              Crie sua conta
            </h2>
            <p className="text-muted-foreground mt-2 font-light">
              Comece a criar artes profissionais em segundos
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Company Name */}
            <div className="space-y-2">
              <Label htmlFor="companyName" className="text-foreground font-medium">
                Nome da Empresa *
              </Label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="companyName"
                  type="text"
                  placeholder="Sua Empresa Ltda"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className={`pl-12 h-12 bg-muted/50 border-0 rounded-2xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30 ${errors.companyName ? 'ring-2 ring-destructive' : ''}`}
                  disabled={isLoading}
                />
              </div>
              {errors.companyName && <p className="text-destructive text-sm">{errors.companyName}</p>}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground font-medium">
                Email Corporativo *
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="contato@suaempresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`pl-12 h-12 bg-muted/50 border-0 rounded-2xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30 ${errors.email ? 'ring-2 ring-destructive' : ''}`}
                  disabled={isLoading}
                />
              </div>
              {errors.email && <p className="text-destructive text-sm">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground font-medium">
                Senha *
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mínimo 8 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`pl-12 pr-12 h-12 bg-muted/50 border-0 rounded-2xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30 ${errors.password ? 'ring-2 ring-destructive' : ''}`}
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
              {errors.password && <p className="text-destructive text-sm">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-foreground font-medium">
                Confirmar Senha *
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Repita a senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`pl-12 h-12 bg-muted/50 border-0 rounded-2xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30 ${errors.confirmPassword ? 'ring-2 ring-destructive' : ''}`}
                  disabled={isLoading}
                />
              </div>
              {errors.confirmPassword && <p className="text-destructive text-sm">{errors.confirmPassword}</p>}
            </div>

            {/* WhatsApp */}
            <div className="space-y-2">
              <Label htmlFor="whatsapp" className="text-foreground font-medium">
                WhatsApp
              </Label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="whatsapp"
                  type="tel"
                  placeholder="(11) 99999-9999"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="pl-12 h-12 bg-muted/50 border-0 rounded-2xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-3 pt-2">
              <Checkbox
                id="terms"
                checked={acceptTerms}
                onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                className="mt-1"
                disabled={isLoading}
              />
              <Label htmlFor="terms" className="text-sm text-muted-foreground font-normal cursor-pointer">
                Li e aceito os{' '}
                <Link to="/termos" className="text-primary hover:underline">
                  Termos de Uso
                </Link>{' '}
                e{' '}
                <Link to="/privacidade" className="text-primary hover:underline">
                  Política de Privacidade
                </Link>
              </Label>
            </div>
            {errors.acceptTerms && <p className="text-destructive text-sm">{errors.acceptTerms}</p>}

            <Button
              type="submit"
              className="w-full h-12 bg-primary hover:brightness-105 text-primary-foreground font-semibold rounded-2xl shadow-lg shadow-primary/25 transition-all mt-4"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Criando conta...
                </>
              ) : (
                'Criar Conta'
              )}
            </Button>
          </form>

          {/* Login link */}
          <p className="text-center text-muted-foreground text-sm mt-6">
            Já tem uma conta?{' '}
            <Link to="/client/login" className="text-primary hover:underline font-medium">
              Fazer login
            </Link>
          </p>
        </div>
      </div>

      {/* Right side - Marketing */}
      <div className="hidden lg:flex lg:w-1/2 bg-secondary p-12 flex-col justify-center relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
        
        <div className="relative z-10 max-w-lg ml-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/15 text-primary text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Comece Gratuitamente
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-secondary-foreground tracking-tight leading-tight mb-4">
            Junte-se a centenas de empresas
          </h2>
          <p className="text-xl text-secondary-foreground/60 font-light mb-8">
            Crie uma conta e comece a gerar artes profissionais hoje mesmo.
          </p>

          {/* Benefits */}
          <div className="space-y-4">
            {benefits.map((benefit) => (
              <div key={benefit} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                </div>
                <span className="text-secondary-foreground/80">{benefit}</span>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="mt-12 flex gap-8">
            <div>
              <div className="text-3xl font-bold text-primary">2min</div>
              <div className="text-sm text-secondary-foreground/50">para começar</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">100%</div>
              <div className="text-sm text-secondary-foreground/50">online</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
