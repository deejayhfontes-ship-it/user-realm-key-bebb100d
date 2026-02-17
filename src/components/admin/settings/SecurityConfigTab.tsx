import { Shield, Lock, Unlock, AlertTriangle, Info, Check } from 'lucide-react';
import { useDeveloperMode } from '@/hooks/useDeveloperMode';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function SecurityConfigTab() {
  const { isDeveloperMode, toggle, isToggling, isLoading } = useDeveloperMode();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Segurança</h2>
        <p className="text-muted-foreground">
          Configure proteções e permissões do sistema
        </p>
      </div>

      {/* Card Modo Desenvolvedor */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Modo Desenvolvedor</CardTitle>
              <CardDescription>
                Controle de acesso às ferramentas de desenvolvedor
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Toggle */}
          <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${isDeveloperMode ? 'bg-primary/20' : 'bg-destructive/20'}`}>
                {isDeveloperMode ? (
                  <Unlock className="h-4 w-4 text-primary" />
                ) : (
                  <Lock className="h-4 w-4 text-destructive" />
                )}
              </div>
              <div>
                <p className="font-medium">
                  Ferramentas de Desenvolvedor
                </p>
                <p className="text-sm text-muted-foreground">
                  {isDeveloperMode 
                    ? 'Habilitadas - F12, clique direito e console liberados' 
                    : 'Bloqueadas - F12, clique direito e console desabilitados'}
                </p>
              </div>
            </div>

            <Switch
              checked={isDeveloperMode}
              onCheckedChange={(checked) => toggle(checked)}
              disabled={isToggling}
            />
          </div>

          {/* Aviso quando desabilitado */}
          {!isDeveloperMode && (
            <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
              <Lock className="h-4 w-4" />
              <AlertTitle>Proteção Ativada</AlertTitle>
              <AlertDescription>
                O código-fonte está protegido contra visualização casual. 
                Clique direito, F12 e atalhos de desenvolvedor estão bloqueados.
              </AlertDescription>
            </Alert>
          )}

          {/* Aviso quando habilitado */}
          {isDeveloperMode && (
            <Alert variant="default" className="border-primary/50 bg-primary/10">
              <Unlock className="h-4 w-4" />
              <AlertTitle>Modo Desenvolvedor Ativo</AlertTitle>
              <AlertDescription>
                Todas as ferramentas de desenvolvedor estão liberadas. 
                Lembre-se de desabilitar quando terminar.
              </AlertDescription>
            </Alert>
          )}

          {/* Explicação detalhada */}
          <div className="space-y-3 pt-4 border-t">
            <h4 className="font-medium flex items-center gap-2">
              <Info className="h-4 w-4 text-muted-foreground" />
              O que é bloqueado quando desativado?
            </h4>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Check className="h-3 w-3 text-primary" />
                Clique direito (Inspecionar elemento)
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3 w-3 text-primary" />
                Tecla F12 (DevTools)
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3 w-3 text-primary" />
                Ctrl+Shift+I (Ferramentas de desenvolvedor)
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3 w-3 text-primary" />
                Ctrl+Shift+J (Console)
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3 w-3 text-primary" />
                Ctrl+U (Ver código-fonte)
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3 w-3 text-primary" />
                Ctrl+S (Salvar página)
              </li>
            </ul>

            <Alert variant="default" className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                <strong>Nota:</strong> Esta proteção dificulta o acesso casual ao código, 
                mas não impede completamente usuários técnicos experientes. 
                Para segurança real, sempre proteja dados sensíveis no backend.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

      {/* Card Futuras Configurações */}
      <Card className="opacity-60">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted">
              <Lock className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                Outras Configurações
                <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded">
                  Em breve
                </span>
              </CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Mais opções de segurança estarão disponíveis em breve.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
