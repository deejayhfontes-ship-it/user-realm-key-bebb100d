import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Palette, ArrowLeft, Sparkles, Zap, Crown, Building2 } from 'lucide-react';

const plans = [
  {
    id: 'basic',
    name: 'Básico',
    icon: Zap,
    price: 'R$ 97',
    period: '/mês',
    description: 'Ideal para pequenos negócios e freelancers',
    credits: 50,
    features: [
      '50 créditos mensais',
      '2 geradores inclusos',
      'Suporte por email',
      'Acesso ao histórico',
    ],
    cta: 'Começar Agora',
    popular: false,
  },
  {
    id: 'pro',
    name: 'Profissional',
    icon: Sparkles,
    price: 'R$ 197',
    period: '/mês',
    description: 'Para equipes e agências em crescimento',
    credits: 150,
    features: [
      '150 créditos mensais',
      'Todos os geradores',
      'Suporte prioritário',
      'Acesso ao histórico',
      'Templates exclusivos',
      'API de integração',
    ],
    cta: 'Escolher Pro',
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    icon: Crown,
    price: 'R$ 497',
    period: '/mês',
    description: 'Solução completa para grandes empresas',
    credits: 500,
    features: [
      '500 créditos mensais',
      'Todos os geradores',
      'Suporte 24/7',
      'Gerente de conta dedicado',
      'Templates personalizados',
      'API de integração',
      'White-label disponível',
      'SLA garantido',
    ],
    cta: 'Falar com Vendas',
    popular: false,
  },
];

export default function ClientPlans() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/client/login">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Palette className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">Fontes Graphics</span>
            </div>
          </div>
          <Link to="/client/login">
            <Button variant="outline" className="rounded-full">
              Fazer Login
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 md:py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="secondary" className="mb-6 px-4 py-2 rounded-full">
            <Sparkles className="w-4 h-4 mr-2" />
            Planos Flexíveis
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight mb-6">
            Escolha o plano ideal para você
          </h1>
          <p className="text-xl text-muted-foreground font-light max-w-2xl mx-auto">
            Comece gratuitamente e escale conforme sua necessidade. 
            Todos os planos incluem acesso aos nossos geradores premium.
          </p>
        </div>
      </section>

      {/* Plans Grid */}
      <section className="pb-24 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <Card 
              key={plan.id}
              className={`relative rounded-3xl border-2 transition-all hover:shadow-xl ${
                plan.popular 
                  ? 'border-primary bg-card shadow-lg shadow-primary/10' 
                  : 'border-border bg-card/50'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-4 py-1 rounded-full shadow-lg">
                    Mais Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="pt-8 pb-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    plan.popular ? 'bg-primary/20' : 'bg-muted'
                  }`}>
                    <plan.icon className={`w-6 h-6 ${plan.popular ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <CardDescription className="text-sm">{plan.credits} créditos/mês</CardDescription>
                  </div>
                </div>
                
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
              </CardHeader>

              <CardContent className="pb-6">
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        plan.popular ? 'bg-primary/20' : 'bg-muted'
                      }`}>
                        <Check className={`w-3 h-3 ${plan.popular ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                      <span className="text-sm text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="pb-8">
                <Button
                  className={`w-full h-12 rounded-2xl font-semibold ${
                    plan.popular 
                      ? 'bg-primary hover:brightness-105 text-primary-foreground shadow-lg shadow-primary/25' 
                      : 'bg-secondary hover:bg-secondary/80 text-secondary-foreground'
                  }`}
                  onClick={() => window.open('mailto:comercial@fontesgraphics.com?subject=Interesse no plano ' + plan.name, '_blank')}
                >
                  {plan.cta}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* Enterprise CTA */}
      <section className="pb-24 px-6">
        <div className="max-w-4xl mx-auto">
          <Card className="rounded-3xl bg-secondary border-0 p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-20 h-20 rounded-3xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-10 h-10 text-primary" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-bold text-secondary-foreground mb-2">
                  Precisa de algo personalizado?
                </h3>
                <p className="text-secondary-foreground/60 font-light">
                  Entre em contato para discutir soluções sob medida para sua empresa, 
                  incluindo integrações, white-label e suporte dedicado.
                </p>
              </div>
              <Button
                size="lg"
                className="bg-primary hover:brightness-105 text-primary-foreground rounded-2xl px-8 shadow-lg shadow-primary/25 flex-shrink-0"
                onClick={() => window.open('mailto:comercial@fontesgraphics.com?subject=Orçamento Personalizado', '_blank')}
              >
                Solicitar Orçamento
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Palette className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-sm text-muted-foreground">
              © 2026 Fontes Graphics. Todos os direitos reservados.
            </span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/client/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Login
            </Link>
            <a href="mailto:suporte@fontesgraphics.com" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Suporte
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
