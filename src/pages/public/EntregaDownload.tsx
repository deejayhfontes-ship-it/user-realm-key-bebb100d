import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Package, Download, FileText, ExternalLink, 
  AlertCircle, Ban, Clock, CheckCircle 
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useEntregaByToken, useRegisterAccess } from '@/hooks/useEntregas';

export default function EntregaDownload() {
  const { token } = useParams<{ token: string }>();
  const { data: entrega, isLoading, error } = useEntregaByToken(token);
  const registerAccess = useRegisterAccess();

  // Registrar acesso ao carregar
  useEffect(() => {
    if (entrega && entrega.status === 'enviado') {
      registerAccess.mutate({
        id: entrega.id,
        userAgent: navigator.userAgent
      });
    }
  }, [entrega?.id]);

  // Verificar status
  const isRevoked = entrega?.status === 'revogado';
  const isExpired = entrega?.expira_em && new Date(entrega.expira_em) < new Date();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-muted border-t-primary rounded-full" />
      </div>
    );
  }

  if (error || !entrega) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Entrega não encontrada</h1>
          <p className="text-muted-foreground mb-6">
            O link que você está tentando acessar não existe ou foi removido.
          </p>
          <Link to="/">
            <Button variant="outline">Voltar ao Início</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isRevoked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <Ban className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Acesso Revogado</h1>
          <p className="text-muted-foreground mb-6">
            O acesso a esta entrega foi revogado. Entre em contato conosco se precisar de um novo link.
          </p>
          <Link to="/">
            <Button variant="outline">Voltar ao Início</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <Clock className="w-16 h-16 text-warning mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Link Expirado</h1>
          <p className="text-muted-foreground mb-6">
            O prazo de acesso a esta entrega expirou em{' '}
            {format(new Date(entrega.expira_em!), 'dd/MM/yyyy', { locale: ptBR })}.
            Entre em contato conosco para solicitar um novo link.
          </p>
          <Link to="/">
            <Button variant="outline">Voltar ao Início</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Package className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <p className="font-semibold">Fontes Graphics</p>
                <p className="text-xs text-muted-foreground">Entrega de Projeto</p>
              </div>
            </div>
            <Badge variant="secondary" className="gap-1.5 bg-accent/20 text-accent-foreground">
              <CheckCircle className="w-3.5 h-3.5" />
              Projeto Finalizado
            </Badge>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Seu projeto está pronto! 🎉
          </h1>
          <p className="text-lg text-muted-foreground">
            Olá, <span className="font-semibold text-foreground">{entrega.cliente_nome}</span>!
            Os arquivos do projeto <span className="font-semibold text-foreground">{entrega.servico_nome}</span> estão disponíveis para download.
          </p>
        </div>

        {/* Info Card */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-primary/10 rounded-xl">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-mono font-bold text-lg">{entrega.protocolo}</p>
              <p className="text-sm text-muted-foreground">{entrega.servico_nome}</p>
            </div>
          </div>

          {/* Mensagem personalizada */}
          {entrega.mensagem && (
            <div className="bg-muted/50 rounded-xl p-4 mb-6">
              <p className="text-sm whitespace-pre-wrap">{entrega.mensagem}</p>
            </div>
          )}

          {/* Validade */}
          {entrega.expira_em && (
            <div className="flex items-center gap-2 text-sm text-warning mb-6">
              <Clock className="w-4 h-4" />
              <span>
                Este link é válido até {format(new Date(entrega.expira_em), 'dd/MM/yyyy', { locale: ptBR })}
              </span>
            </div>
          )}
        </div>

        {/* Arquivos */}
        {entrega.arquivos && entrega.arquivos.length > 0 && (
          <div className="bg-card border border-border rounded-2xl p-6 mb-8">
            <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Download className="w-5 h-5" />
              Arquivos para Download
            </h2>
            <div className="space-y-3">
              {entrega.arquivos.map((arquivo, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-between p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{arquivo.nome}</p>
                      <p className="text-sm text-muted-foreground">{arquivo.tamanho}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(arquivo.url, '_blank')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Baixar
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Link Externo */}
        {entrega.link_externo && (
          <div className="bg-card border border-border rounded-2xl p-6 mb-8">
            <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <ExternalLink className="w-5 h-5" />
              Link para Arquivos
            </h2>
            <Button
              className="w-full"
              onClick={() => window.open(entrega.link_externo!, '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Acessar Arquivos
            </Button>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Dúvidas? Entre em contato conosco.</p>
          <p className="mt-2">© {new Date().getFullYear()} Fontes Graphics</p>
        </div>
      </main>
    </div>
  );
}
