<<<<<<< HEAD
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DraggableCardProps {
    id: string;
    children: React.ReactNode;
    className?: string;
}

export function DraggableCard({ id, children, className }: DraggableCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
        isOver,
    } = useSortable({ id });

    const style: React.CSSProperties = {
        transform: CSS.Translate.toString(transform),
        transition: transition ?? 'transform 300ms ease',
        opacity: isDragging ? 0.85 : 1,
        boxShadow: isDragging
            ? '0 20px 60px rgba(0,0,0,0.25), 0 8px 24px rgba(0,0,0,0.15)'
            : undefined,
        zIndex: isDragging ? 50 : 'auto',
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                'relative group min-h-[120px]',
                isDragging && 'cursor-grabbing scale-[1.02]',
                isOver &&
                'ring-2 ring-dashed ring-[#d5e636]/60 ring-offset-2 ring-offset-[#c5c9b8]',
                className
            )}
        >
            {/* Drag Handle — grip icon */}
            <div
                {...attributes}
                {...listeners}
                className={cn(
                    'absolute top-3 left-1/2 -translate-x-1/2 z-20',
                    'flex items-center justify-center',
                    'w-10 h-5 rounded-full',
                    'bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200',
                    'cursor-grab active:cursor-grabbing',
                    'hover:bg-black/10'
                )}
                title="Arraste para reorganizar"
            >
                <GripVertical className="w-4 h-4 text-gray-500" />
            </div>

            {children}
        </div>
    );
}
=======
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DraggableCardProps {
    id: string;
    children: React.ReactNode;
    className?: string;
}

export function DraggableCard({ id, children, className }: DraggableCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
        isOver,
    } = useSortable({ id });

    const style: React.CSSProperties = {
        transform: CSS.Translate.toString(transform),
        transition: transition ?? 'transform 300ms ease',
        opacity: isDragging ? 0.85 : 1,
        boxShadow: isDragging
            ? '0 20px 60px rgba(0,0,0,0.25), 0 8px 24px rgba(0,0,0,0.15)'
            : undefined,
        zIndex: isDragging ? 50 : 'auto',
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                'relative group min-h-[120px]',
                isDragging && 'cursor-grabbing scale-[1.02]',
                isOver &&
                'ring-2 ring-dashed ring-[#d5e636]/60 ring-offset-2 ring-offset-[#c5c9b8]',
                className
            )}
        >
            {/* Drag Handle — grip icon */}
            <div
                {...attributes}
                {...listeners}
                className={cn(
                    'absolute top-3 left-1/2 -translate-x-1/2 z-20',
                    'flex items-center justify-center',
                    'w-10 h-5 rounded-full',
                    'bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200',
                    'cursor-grab active:cursor-grabbing',
                    'hover:bg-black/10'
                )}
                title="Arraste para reorganizar"
            >
                <GripVertical className="w-4 h-4 text-gray-500" />
            </div>

            {children}
        </div>
    );
}
>>>>>>> 156f36cf0eee94361ff12bfb77e006213e68283d
