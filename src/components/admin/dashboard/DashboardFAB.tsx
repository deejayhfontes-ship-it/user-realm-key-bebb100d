import { useState } from 'react';
import { Plus, FileText, CheckSquare, CreditCard, Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface FABOption {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  color: string;
}

const fabOptions: FABOption[] = [
  {
    label: 'Novo pedido',
    icon: FileText,
    href: '/admin/pedidos?novo=1',
    color: 'bg-blue-500 hover:bg-blue-600',
  },
  {
    label: 'Nova tarefa',
    icon: CheckSquare,
    href: '/admin/agenda?nova=1',
    color: 'bg-emerald-500 hover:bg-emerald-600',
  },
  {
    label: 'Nova cobrança',
    icon: CreditCard,
    href: '/admin/financeiro/cobrancas?nova=1',
    color: 'bg-amber-500 hover:bg-amber-600',
  },
  {
    label: 'Notificações',
    icon: Bell,
    href: '/admin/notificacoes',
    color: 'bg-violet-500 hover:bg-violet-600',
  },
];

export function DashboardFAB() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Options */}
      <div
        className={cn(
          "absolute bottom-16 right-0 flex flex-col-reverse gap-3 transition-all duration-300",
          isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        )}
      >
        {fabOptions.map((option, idx) => (
          <div
            key={option.label}
            className="flex items-center gap-3 transition-all duration-200"
            style={{
              transitionDelay: isOpen ? `${idx * 50}ms` : '0ms',
            }}
          >
            <span className="text-sm font-medium text-foreground bg-card px-3 py-1.5 rounded-lg shadow-sm border border-border whitespace-nowrap">
              {option.label}
            </span>
            <Button
              asChild
              size="icon"
              className={cn(
                "h-12 w-12 rounded-full shadow-lg text-white",
                option.color
              )}
            >
              <Link to={option.href}>
                <option.icon className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        ))}
      </div>

      {/* Main FAB */}
      <Button
        size="icon"
        className={cn(
          "h-14 w-14 rounded-full shadow-lg transition-all duration-300",
          "bg-primary hover:bg-primary/90 text-primary-foreground",
          isOpen && "rotate-45"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Plus className="w-6 h-6" />
        )}
      </Button>
    </div>
  );
}
