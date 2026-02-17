import { CreditCard, Mail, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface NoCreditsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  adminEmail?: string;
}

export function NoCreditsModal({ open, onOpenChange, adminEmail = 'suporte@fontes.app' }: NoCreditsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <CreditCard className="w-8 h-8 text-red-500" />
          </div>
          <DialogTitle className="text-xl">Créditos Esgotados</DialogTitle>
          <DialogDescription className="text-center pt-2">
            Você não possui créditos disponíveis para gerar novas artes.
            <br />
            Entre em contato com o administrador para adquirir mais créditos.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-3 mt-4">
          <Button asChild>
            <a href={`mailto:${adminEmail}?subject=Solicitar mais créditos&body=Olá, gostaria de adquirir mais créditos para continuar usando os geradores.`}>
              <Mail className="w-4 h-4 mr-2" />
              Contatar Administrador
            </a>
          </Button>
          
          <Button variant="outline" asChild>
            <Link to="/client/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Dashboard
            </Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
