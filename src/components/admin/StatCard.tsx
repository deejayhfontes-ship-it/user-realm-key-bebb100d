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
  const isLime = variant === 'primary' || variant === 'success';
  
  return (
    <div className={cn(
      "relative overflow-hidden rounded-3xl p-6 transition-all hover:scale-[1.02] duration-300",
      isLime 
        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
        : "soft-card"
    )}>
      {/* Decorative circles for lime cards */}
      {isLime && (
        <div className="absolute -right-8 -bottom-8 opacity-20">
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
            <circle cx="60" cy="60" r="50" stroke="currentColor" strokeWidth="2" />
            <circle cx="60" cy="60" r="35" stroke="currentColor" strokeWidth="2" />
            <circle cx="60" cy="60" r="20" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>
      )}
      
      <div className="relative flex items-start justify-between">
        <div className="space-y-3">
          <p className={cn(
            "text-sm font-medium tracking-wide",
            isLime ? "text-primary-foreground/80" : "text-muted-foreground"
          )}>{title}</p>
          <div className="flex items-center gap-3">
            <span className={cn(
              "text-3xl font-bold tracking-tight",
              isLime ? "text-primary-foreground" : "text-foreground"
            )}>
              {value}
            </span>
            {trend && (
              <span className={cn(
                "text-xs font-medium px-2.5 py-1 rounded-full",
                isLime
                  ? trend.isPositive 
                    ? "bg-primary-foreground/20 text-primary-foreground" 
                    : "bg-destructive/20 text-destructive"
                  : trend.isPositive 
                    ? "bg-primary/15 text-primary" 
                    : "bg-destructive/15 text-destructive"
              )}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
            )}
          </div>
        </div>
        <div className={cn(
          "w-12 h-12 rounded-2xl flex items-center justify-center",
          isLime 
            ? "bg-primary-foreground/15" 
            : "bg-muted"
        )}>
          <Icon className={cn(
            "w-6 h-6",
            isLime ? "text-primary-foreground" : "text-muted-foreground"
          )} />
        </div>
      </div>
    </div>
  );
}