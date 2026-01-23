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

export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  variant = 'default' 
}: StatCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl p-5 transition-all hover:scale-[1.01] bg-foreground/[0.04] backdrop-blur-xl border border-foreground/[0.08]">
      {/* Subtle inner glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-foreground/[0.02] to-transparent pointer-events-none" />
      
      <div className="relative flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm text-foreground/60 font-light tracking-wide">{title}</p>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-foreground/[0.08] text-foreground text-xl font-normal tracking-tight">
              {value}
            </span>
            {trend && (
              <span className={cn(
                "text-xs font-light px-2 py-0.5 rounded-full",
                trend.isPositive 
                  ? "bg-emerald-500/10 text-emerald-400" 
                  : "bg-destructive/10 text-destructive"
              )}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
            )}
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-foreground/[0.06]">
          <Icon className="w-5 h-5 text-foreground/50" />
        </div>
      </div>
    </div>
  );
}
