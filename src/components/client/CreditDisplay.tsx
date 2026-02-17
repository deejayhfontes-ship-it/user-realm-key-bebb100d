import { CreditCard, AlertTriangle, Calendar, Infinity as InfinityIcon } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface CreditDisplayProps {
  used: number;
  total: number;
  resetDate?: string | null;
  type: 'fixed' | 'package';
  variant?: 'default' | 'compact' | 'header';
  showLabel?: boolean;
}

export function CreditDisplay({ 
  used, 
  total, 
  resetDate, 
  type,
  variant = 'default',
  showLabel = true
}: CreditDisplayProps) {
  const isUnlimited = type === 'fixed' || !isFinite(total) || total === 0;
  const remaining = isUnlimited ? Number.POSITIVE_INFINITY : Math.max(0, total - used);
  const percentage = isUnlimited ? 100 : Math.round((remaining / total) * 100);
  
  // Color logic based on remaining percentage
  const getProgressColor = () => {
    if (isUnlimited) return 'bg-primary';
    if (percentage > 50) return 'bg-primary';
    if (percentage > 20) return 'bg-yellow-500';
    return 'bg-destructive';
  };

  const getTextColor = () => {
    if (isUnlimited) return 'text-primary';
    if (percentage > 50) return 'text-primary';
    if (percentage > 20) return 'text-yellow-600';
    return 'text-destructive';
  };

  const isLowCredits = !isUnlimited && isFinite(remaining) && remaining <= 10;

  // Header variant (compact for sidebar/header)
  if (variant === 'header') {
    return (
      <div className="flex items-center gap-2">
        {isLowCredits && (
          <AlertTriangle className="w-4 h-4 text-destructive" />
        )}
        <div className="flex items-center gap-1.5">
          <CreditCard className="w-4 h-4 text-muted-foreground" />
          <span className={cn("text-sm font-medium", getTextColor())}>
            {isUnlimited ? (
              <span className="flex items-center gap-1">
                <InfinityIcon className="w-4 h-4" />
                Ilimitado
              </span>
            ) : (
              `${remaining}/${total}`
            )}
          </span>
        </div>
      </div>
    );
  }

  // Compact variant
  if (variant === 'compact') {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isLowCredits && (
              <AlertTriangle className="w-4 h-4 text-destructive" />
            )}
            <span className={cn("text-sm font-semibold", getTextColor())}>
              {isUnlimited ? (
                <span className="flex items-center gap-1">
                  <InfinityIcon className="w-4 h-4" />
                  Ilimitado
                </span>
              ) : (
                `${remaining} créditos restantes`
              )}
            </span>
          </div>
          {!isUnlimited && (
            <span className="text-xs text-muted-foreground">
              {used}/{total}
            </span>
          )}
        </div>
        {!isUnlimited && (
          <Progress 
            value={percentage} 
            className={cn("h-2", `[&>div]:${getProgressColor()}`)} 
          />
        )}
      </div>
    );
  }

  // Default variant (full card)
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <CreditCard className="w-5 h-5 text-primary" />
        </div>
        <div>
          {showLabel && (
            <p className="text-sm text-muted-foreground">Créditos Disponíveis</p>
          )}
          <div className="flex items-center gap-2">
            {isLowCredits && (
              <AlertTriangle className="w-4 h-4 text-destructive" />
            )}
            <p className={cn("text-2xl font-bold", getTextColor())}>
              {isUnlimited ? (
                <span className="flex items-center gap-2">
                  <InfinityIcon className="w-6 h-6" />
                  <span>Ilimitado</span>
                </span>
              ) : (
                <>
                  {remaining}
                  <span className="text-sm font-normal text-muted-foreground">
                    /{total}
                  </span>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
      
      {!isUnlimited && (
        <Progress 
          value={percentage} 
          className={cn("h-2", `[&>div]:${getProgressColor()}`)} 
        />
      )}
      
      {resetDate && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="w-3 h-3" />
          <span>
            {type === 'package' ? 'Expira em' : 'Renova em'}{' '}
            {new Date(resetDate).toLocaleDateString('pt-BR')}
          </span>
        </div>
      )}
      
      {isLowCredits && (
        <Badge variant="destructive" className="text-xs">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Poucos créditos restantes
        </Badge>
      )}
    </div>
  );
}
