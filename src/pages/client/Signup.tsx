import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  Loader2, Lock, Mail, Palette, Eye, EyeOff, 
  Building2, Phone, Sparkles, CheckCircle2, User, FileText 
} from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

// CPF validation function
function validateCPF(cpf: string): boolean {
  const cleanCPF = cpf.replace(/\D/g, '');
  if (cleanCPF.length !== 11) return false;
  
  // Check for known invalid CPFs
  if (/^(\d)\1+$/.test(cleanCPF)) return false;
  
  // Validate first digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(9))) return false;
  
  // Validate second digit
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(10))) return false;
  
  return true;
}

// CNPJ validation function
function validateCNPJ(cnpj: string): boolean {
  const cleanCNPJ = cnpj.replace(/\D/g, '');
  if (cleanCNPJ.length !== 14) return false;
  
  // Check for known invalid CNPJs
  if (/^(\d)\1+$/.test(cleanCNPJ)) return false;
  
  // Validate first digit
  let size = cleanCNPJ.length - 2;
  let numbers = cleanCNPJ.substring(0, size);
  const digits = cleanCNPJ.substring(size);
  let sum = 0;
  let pos = size - 7;
  
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) return false;
  
  // Validate second digit
  size = size + 1;
  numbers = cleanCNPJ.substring(0, size);
  sum = 0;
  pos = size - 7;
  
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(1))) return false;
  
  return true;
}

// Format CPF: 000.000.000-00
function formatCPF(value: string): string {
  const clean = value.replace(/\D/g, '').slice(0, 11);
  return clean
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

// Format CNPJ: 00.000.000/0000-00
function formatCNPJ(value: string): string {
  const clean = value.replace(/\D/g, '').slice(0, 14);
  return clean
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
}

type DocumentType = 'cpf' | 'cnpj';

// Validation schema
const signupSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
  confirmPassword: z.string(),
  documentType: z.enum(['cpf', 'cnpj']),
  documentNumber: z.string().min(1, 'Documento é obrigatório'),
  whatsapp: z.string().optional(),
  acceptTerms: z.boolean().refine(val => val === true, 'Você deve aceitar os termos'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'As senhas não conferem',
  path: ['confirmPassword'],
}).refine(data => {
  if (data.documentType === 'cpf') {
    return validateCPF(data.documentNumber);
  }
  return validateCNPJ(data.documentNumber);
}, {
  message: 'Documento inválido',
  path: ['documentNumber'],
});

export default function ClientSignup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [documentType, setDocumentType] = useState<DocumentType>('cnpj');
  const [documentNumber, setDocumentNumber] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  const handleDocumentChange = (value: string) => {
    if (documentType === 'cpf') {
      setDocumentNumber(formatCPF(value));
    } else {
      setDocumentNumber(formatCNPJ(value));
    }
  };

  const handleDocumentTypeChange = (value: DocumentType) => {
    setDocumentType(value);
    setDocumentNumber(''); // Clear document when changing type
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate form
    const validation = signupSchema.safeParse({
      name,
      email,
      password,
      confirmPassword,
      documentType,
      documentNumber,
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
      // Create auth user - trigger handles client/user creation
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/client/dashboard`,
          data: {
            name: name,
            phone: whatsapp || null,
            document_type: documentType,
            document_number: documentNumber.replace(/\D/g, ''),
          },
        },
      });

      if (authError) {
        console.error('❌ Erro ao criar usuário:', authError);
        if (authError.message.includes('already registered')) {
          toast.error('Este email já está cadastrado. Faça login.');
          setErrors({ email: 'Este email já está cadastrado' });
        } else {
          toast.error(authError.message);
        }
        return;
      }

      // Supabase returns user or session on success (depends on email confirmation setting)
      const userId = authData.user?.id || authData.session?.user?.id;
      
      if (!userId) {
        // Check if it's an email confirmation pending scenario
        if (authData.user === null && authData.session === null) {
          toast.success('Verifique seu email para confirmar a conta!');
          navigate('/client/login');
          return;
        }
        toast.error('Erro ao criar conta. Tente novamente.');
        return;
      }

      console.log('✅ Conta criada com sucesso:', userId);
      toast.success('Conta criada com sucesso! Bem-vindo!');
      
      // User is auto-logged in after signup, redirect to dashboard
      navigate('/client/dashboard');

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
            {/* Account Type */}
            <div className="space-y-2">
              <Label className="text-foreground font-medium">
                Tipo de Conta *
              </Label>
              <RadioGroup 
                value={documentType} 
                onValueChange={(v) => handleDocumentTypeChange(v as DocumentType)}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cnpj" id="cnpj" />
                  <Label htmlFor="cnpj" className="cursor-pointer font-normal">
                    Pessoa Jurídica (CNPJ)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cpf" id="cpf" />
                  <Label htmlFor="cpf" className="cursor-pointer font-normal">
                    Pessoa Física (CPF)
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground font-medium">
                {documentType === 'cpf' ? 'Nome Completo *' : 'Nome Completo ou Razão Social *'}
              </Label>
              <div className="relative">
                {documentType === 'cpf' ? (
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                ) : (
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                )}
                <Input
                  id="name"
                  type="text"
                  placeholder={documentType === 'cpf' ? 'Seu nome completo' : 'Seu nome ou nome da empresa'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`pl-12 h-12 bg-muted/50 border-0 rounded-2xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30 ${errors.name ? 'ring-2 ring-destructive' : ''}`}
                  disabled={isLoading}
                />
              </div>
              {errors.name && <p className="text-destructive text-sm">{errors.name}</p>}
            </div>

            {/* Document Number */}
            <div className="space-y-2">
              <Label htmlFor="documentNumber" className="text-foreground font-medium">
                {documentType === 'cpf' ? 'CPF *' : 'CNPJ *'}
              </Label>
              <div className="relative">
                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="documentNumber"
                  type="text"
                  placeholder={documentType === 'cpf' ? '000.000.000-00' : '00.000.000/0000-00'}
                  value={documentNumber}
                  onChange={(e) => handleDocumentChange(e.target.value)}
                  className={`pl-12 h-12 bg-muted/50 border-0 rounded-2xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30 ${errors.documentNumber ? 'ring-2 ring-destructive' : ''}`}
                  disabled={isLoading}
                />
              </div>
              {errors.documentNumber && <p className="text-destructive text-sm">{errors.documentNumber}</p>}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground font-medium">
                Email {documentType === 'cnpj' ? 'Corporativo' : ''} *
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder={documentType === 'cpf' ? 'seu@email.com' : 'contato@suaempresa.com'}
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
                <a href="/termos" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  Termos de Uso
                </a>{' '}
                e{' '}
                <a href="/privacidade" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  Política de Privacidade
                </a>
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
            {documentType === 'cpf' 
              ? 'Crie artes incríveis' 
              : 'Junte-se a centenas de empresas'}
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
