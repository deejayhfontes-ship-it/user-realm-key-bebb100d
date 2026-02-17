import { Link } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ClientData } from '@/hooks/useClientData';

interface DashboardHeaderProps {
  client: ClientData | null;
  activeOrdersCount: number;
}

export function DashboardHeader({ client, activeOrdersCount }: DashboardHeaderProps) {
  const firstName = client?.name?.split(' ')[0] || 'Usuário';
  const initials = client?.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'U';

  const getStatusBadge = () => {
    if (client?.type === 'package' && (client.package_credits || 0) >= 50) {
      return { text: 'Cliente Premium', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' };
    }
    return null;
  };

  const statusBadge = getStatusBadge();

  return (
    <div className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] rounded-3xl p-8 md:p-10 mb-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Left side */}
        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
            Olá, {firstName}! 
            <span className="animate-[wave_2s_ease-in-out_infinite] inline-block origin-[70%_70%]">👋</span>
          </h1>
          <p className="text-base text-white/60 mt-2">
            {activeOrdersCount > 0 
              ? `Você tem ${activeOrdersCount} projeto${activeOrdersCount > 1 ? 's' : ''} em andamento`
              : 'Pronto para começar um novo projeto?'
            }
          </p>
          
          {statusBadge && (
            <Badge className={`mt-4 ${statusBadge.color} border px-4 py-1.5 text-sm font-medium`}>
              {statusBadge.text}
            </Badge>
          )}
        </div>

        {/* Right side - Avatar */}
        <div className="flex flex-col items-center gap-2">
          {client?.logo_url ? (
            <img 
              src={client.logo_url} 
              alt={client.name} 
              className="w-20 h-20 rounded-full object-cover border-2 border-primary/30"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-2xl font-bold text-primary-foreground">
              {initials}
            </div>
          )}
          <Link 
            to="/client/perfil" 
            className="text-sm text-white/50 hover:text-white flex items-center gap-1 transition-colors"
          >
            <Settings className="w-3.5 h-3.5" />
            Editar perfil
          </Link>
        </div>
      </div>
    </div>
  );
}
