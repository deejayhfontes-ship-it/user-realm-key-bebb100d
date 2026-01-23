import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'success' | 'warning';
}

const iconStyles = {
  default: 'bg-accent/10 text-accent',
  primary: 'bg-accent/10 text-accent',
  success: 'bg-emerald-500/10 text-emerald-400',
  warning: 'bg-amber-500/10 text-amber-400',
};

export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  variant = 'default' 
}: StatCardProps) {
  return (
    <div className="glass-card p-6 transition-all hover:scale-[1.01]">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground font-normal tracking-wide">{title}</p>
          <p className="text-3xl font-semibold text-foreground tracking-tight">{value}</p>
          {trend && (
            <p className={cn(
              "text-sm font-medium",
              trend.isPositive ? "text-emerald-400" : "text-destructive"
            )}>
              {trend.isPositive ? '+' : ''}{trend.value}% vs ontem
            </p>
          )}
        </div>
        <div className={cn(
          "w-11 h-11 rounded-xl flex items-center justify-center",
          iconStyles[variant]
        )}>
          <Icon className="w-5 h-5 opacity-80" />
        </div>
      </div>
    </div>
  );
}
