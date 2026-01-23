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

const variantStyles = {
  default: 'bg-card border-border',
  primary: 'bg-card border-border',
  success: 'bg-card border-border',
  warning: 'bg-card border-border',
};

const iconStyles = {
  default: 'bg-accent/10 text-accent',
  primary: 'bg-accent/10 text-accent',
  success: 'bg-emerald-500/10 text-emerald-500',
  warning: 'bg-amber-500/10 text-amber-500',
};

export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  variant = 'default' 
}: StatCardProps) {
  return (
    <div className={cn(
      "p-6 rounded-xl border transition-all hover:shadow-lg card-shadow",
      variantStyles[variant]
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
          {trend && (
            <p className={cn(
              "text-sm font-semibold",
              trend.isPositive ? "text-[hsl(160_60%_40%)]" : "text-destructive"
            )}>
              {trend.isPositive ? '+' : ''}{trend.value}% vs ontem
            </p>
          )}
        </div>
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center",
          iconStyles[variant]
        )}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
