import { useNavigate } from 'react-router-dom';
import { Ban, Mail, Phone, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';

export default function ClientBlocked() {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <Card className="soft-card-elevated border-0 max-w-md w-full">
        <CardContent className="p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-destructive/15 flex items-center justify-center mx-auto mb-6">
            <Ban className="h-10 w-10 text-destructive" />
          </div>
          
          <h1 className="text-2xl font-semibold text-foreground mb-3">
            Conta Bloqueada
          </h1>
          
          <p className="text-muted-foreground mb-6">
            Sua conta foi temporariamente bloqueada. 
            Entre em contato com o suporte para mais informações.
          </p>

          <div className="space-y-3 mb-6">
            <Button 
              variant="outline" 
              className="w-full rounded-full"
              onClick={() => window.location.href = 'mailto:suporte@fontesgraphics.com.br'}
            >
              <Mail className="h-4 w-4 mr-2" />
              suporte@fontesgraphics.com.br
            </Button>
            
            <Button 
              className="w-full rounded-full bg-green-600 hover:bg-green-700"
              onClick={() => window.open('https://wa.me/5511999999999', '_blank')}
            >
              <Phone className="h-4 w-4 mr-2" />
              Falar via WhatsApp
            </Button>
          </div>

          <Button 
            variant="ghost" 
            className="text-muted-foreground"
            onClick={handleLogout}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
