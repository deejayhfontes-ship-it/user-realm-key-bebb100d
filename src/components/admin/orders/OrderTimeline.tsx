<<<<<<< HEAD
import React from 'react';
import { useOrderActivityLog, ACTION_LABELS, ACTION_ICONS, type OrderActivity } from '@/hooks/useOrderActivityLog';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import * as LucideIcons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface OrderTimelineProps {
    pedidoId: string;
    maxItems?: number;
}

// Cores por tipo de ator
const ACTOR_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    admin: { bg: 'bg-[#CCFF00]/10', text: 'text-[#CCFF00]', border: 'border-[#CCFF00]/20' },
    client: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
    system: { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/20' },
};

function getIcon(action: string): LucideIcon {
    const iconName = ACTION_ICONS[action] as keyof typeof LucideIcons;
    return (LucideIcons[iconName] as LucideIcon) || LucideIcons.Activity;
}

export function OrderTimeline({ pedidoId, maxItems }: OrderTimelineProps) {
    const { data: activities = [], isLoading } = useOrderActivityLog(pedidoId);

    const displayActivities = maxItems ? activities.slice(0, maxItems) : activities;

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/[0.03] animate-pulse" />
                        <div className="flex-1 h-12 bg-white/[0.03] rounded-lg animate-pulse" />
                    </div>
                ))}
            </div>
        );
    }

    if (displayActivities.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                <LucideIcons.Activity className="w-10 h-10 mb-3 text-gray-600" />
                <p className="text-sm">Nenhuma atividade registrada</p>
            </div>
        );
    }

    return (
        <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[15px] top-4 bottom-4 w-px bg-white/[0.06]" />

            <div className="space-y-4">
                {displayActivities.map((activity, index) => {
                    const Icon = getIcon(activity.action);
                    const colors = ACTOR_COLORS[activity.actor_type] || ACTOR_COLORS.system;
                    const label = ACTION_LABELS[activity.action] || activity.action;

                    return (
                        <div key={activity.id} className="relative flex gap-3 pl-0">
                            {/* Icon circle */}
                            <div className={`
                relative z-10 w-8 h-8 rounded-full flex items-center justify-center 
                flex-shrink-0 ${colors.bg} border ${colors.border}
              `}>
                                <Icon className={`w-3.5 h-3.5 ${colors.text}`} />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0 pt-0.5">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-sm text-white">{label}</span>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${colors.bg} ${colors.text}`}>
                                        {activity.actor_type === 'admin' ? 'Admin' :
                                            activity.actor_type === 'client' ? 'Cliente' : 'Sistema'}
                                    </span>
                                </div>

                                {/* Details */}
                                {activity.details && Object.keys(activity.details).length > 0 && (
                                    <div className="mt-1 text-[11px] text-gray-500">
                                        {Object.entries(activity.details).map(([key, val]) => (
                                            <span key={key} className="mr-2">
                                                {key}: <span className="text-gray-400">{String(val)}</span>
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Timestamp */}
                                <p className="text-[10px] text-gray-600 mt-1">
                                    {format(new Date(activity.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                                    {' · '}
                                    {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true, locale: ptBR })}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Show more */}
            {maxItems && activities.length > maxItems && (
                <div className="mt-4 text-center">
                    <span className="text-xs text-gray-500">
                        +{activities.length - maxItems} atividades anteriores
                    </span>
                </div>
            )}
        </div>
    );
}
=======
import React from 'react';
import { useOrderActivityLog, ACTION_LABELS, ACTION_ICONS, type OrderActivity } from '@/hooks/useOrderActivityLog';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import * as LucideIcons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface OrderTimelineProps {
    pedidoId: string;
    maxItems?: number;
}

// Cores por tipo de ator
const ACTOR_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    admin: { bg: 'bg-[#CCFF00]/10', text: 'text-[#CCFF00]', border: 'border-[#CCFF00]/20' },
    client: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
    system: { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/20' },
};

function getIcon(action: string): LucideIcon {
    const iconName = ACTION_ICONS[action] as keyof typeof LucideIcons;
    return (LucideIcons[iconName] as LucideIcon) || LucideIcons.Activity;
}

export function OrderTimeline({ pedidoId, maxItems }: OrderTimelineProps) {
    const { data: activities = [], isLoading } = useOrderActivityLog(pedidoId);

    const displayActivities = maxItems ? activities.slice(0, maxItems) : activities;

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/[0.03] animate-pulse" />
                        <div className="flex-1 h-12 bg-white/[0.03] rounded-lg animate-pulse" />
                    </div>
                ))}
            </div>
        );
    }

    if (displayActivities.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                <LucideIcons.Activity className="w-10 h-10 mb-3 text-gray-600" />
                <p className="text-sm">Nenhuma atividade registrada</p>
            </div>
        );
    }

    return (
        <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[15px] top-4 bottom-4 w-px bg-white/[0.06]" />

            <div className="space-y-4">
                {displayActivities.map((activity, index) => {
                    const Icon = getIcon(activity.action);
                    const colors = ACTOR_COLORS[activity.actor_type] || ACTOR_COLORS.system;
                    const label = ACTION_LABELS[activity.action] || activity.action;

                    return (
                        <div key={activity.id} className="relative flex gap-3 pl-0">
                            {/* Icon circle */}
                            <div className={`
                relative z-10 w-8 h-8 rounded-full flex items-center justify-center 
                flex-shrink-0 ${colors.bg} border ${colors.border}
              `}>
                                <Icon className={`w-3.5 h-3.5 ${colors.text}`} />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0 pt-0.5">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-sm text-white">{label}</span>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${colors.bg} ${colors.text}`}>
                                        {activity.actor_type === 'admin' ? 'Admin' :
                                            activity.actor_type === 'client' ? 'Cliente' : 'Sistema'}
                                    </span>
                                </div>

                                {/* Details */}
                                {activity.details && Object.keys(activity.details).length > 0 && (
                                    <div className="mt-1 text-[11px] text-gray-500">
                                        {Object.entries(activity.details).map(([key, val]) => (
                                            <span key={key} className="mr-2">
                                                {key}: <span className="text-gray-400">{String(val)}</span>
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Timestamp */}
                                <p className="text-[10px] text-gray-600 mt-1">
                                    {format(new Date(activity.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                                    {' · '}
                                    {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true, locale: ptBR })}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Show more */}
            {maxItems && activities.length > maxItems && (
                <div className="mt-4 text-center">
                    <span className="text-xs text-gray-500">
                        +{activities.length - maxItems} atividades anteriores
                    </span>
                </div>
            )}
        </div>
    );
}
>>>>>>> 156f36cf0eee94361ff12bfb77e006213e68283d
