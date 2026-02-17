import { FileText, User, Building, Phone, Mail, Calendar, Link as LinkIcon, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Pedido } from "@/types/pedido";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PedidoBriefingTabProps {
  pedido: Pedido;
}

export function PedidoBriefingTab({ pedido }: PedidoBriefingTabProps) {
  return (
    <div className="space-y-6">
      {/* Contact Info */}
      <div className="space-y-4">
        <h3 className="font-semibold flex items-center gap-2">
          <User className="w-4 h-4" />
          Informações de Contato
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Nome</p>
            <p className="font-medium">{pedido.nome}</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Email</p>
            <a 
              href={`mailto:${pedido.email}`}
              className="font-medium text-primary hover:underline flex items-center gap-1"
            >
              <Mail className="w-3 h-3" />
              {pedido.email}
            </a>
          </div>

          {pedido.telefone && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Telefone</p>
              <a 
                href={`tel:${pedido.telefone}`}
                className="font-medium flex items-center gap-1"
              >
                <Phone className="w-3 h-3" />
                {pedido.telefone}
              </a>
            </div>
          )}

          {pedido.empresa && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Empresa</p>
              <p className="font-medium flex items-center gap-1">
                <Building className="w-3 h-3" />
                {pedido.empresa}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Service */}
      {pedido.services && (
        <div className="space-y-2">
          <h3 className="font-semibold flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Serviço Solicitado
          </h3>
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
            <p className="font-medium text-primary">{pedido.services.title}</p>
          </div>
        </div>
      )}

      {/* Description */}
      <div className="space-y-2">
        <h3 className="font-semibold">Descrição do Projeto</h3>
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-sm whitespace-pre-wrap">{pedido.descricao}</p>
        </div>
      </div>

      {/* Deadline */}
      {pedido.prazo_solicitado && (
        <div className="space-y-2">
          <h3 className="font-semibold flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Prazo Solicitado
          </h3>
          <p className="text-sm">{pedido.prazo_solicitado}</p>
        </div>
      )}

      {/* References */}
      {pedido.referencias && (
        <div className="space-y-2">
          <h3 className="font-semibold flex items-center gap-2">
            <LinkIcon className="w-4 h-4" />
            Referências
          </h3>
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm whitespace-pre-wrap">{pedido.referencias}</p>
          </div>
        </div>
      )}

      {/* Attached Files */}
      {pedido.arquivo_urls && pedido.arquivo_urls.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold flex items-center gap-2">
            <Download className="w-4 h-4" />
            Arquivos Anexados ({pedido.arquivo_urls.length})
          </h3>
          <div className="space-y-2">
            {pedido.arquivo_urls.map((url, idx) => (
              <a
                key={idx}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
              >
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm flex-1 truncate">
                  Arquivo {idx + 1}
                </span>
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Submission Date */}
      <div className="pt-4 border-t">
        <p className="text-xs text-muted-foreground">
          Enviado em {format(new Date(pedido.data_briefing), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
        </p>
      </div>
    </div>
  );
}
