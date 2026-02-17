import { useState, useRef, useEffect } from 'react';
import { useEditableContent } from '@/hooks/useEditableContent';
import { Pencil } from 'lucide-react';

interface EditableTextProps {
  id: string;
  defaultValue: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div';
  className?: string;
  style?: React.CSSProperties;
}

export function EditableText({
  id,
  defaultValue,
  as: Component = 'p',
  className = '',
  style
}: EditableTextProps) {
  const { getContent, saveContent, isEditing, setIsEditing } = useEditableContent();
  const ref = useRef<HTMLElement>(null);
  const [showPencil, setShowPencil] = useState(false);

  const currentValue = getContent(id, defaultValue);
  const editing = isEditing === id;

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEditing(id);
    
    setTimeout(() => {
      if (ref.current) {
        ref.current.focus();
        const range = document.createRange();
        range.selectNodeContents(ref.current);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    }, 10);
  };

  const handleBlur = () => {
    if (ref.current) {
      const newValue = ref.current.innerText.trim();
      if (newValue && newValue !== currentValue) {
        saveContent(id, newValue);
      } else if (!newValue) {
        ref.current.innerText = currentValue;
      }
    }
    setIsEditing(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      ref.current?.blur();
    }
    if (e.key === 'Escape') {
      if (ref.current) {
        ref.current.innerText = currentValue;
      }
      setIsEditing(null);
    }
  };

  // Prevent click propagation when editing
  const handleClick = (e: React.MouseEvent) => {
    if (editing) {
      e.stopPropagation();
    }
  };

  return (
    <span 
      className="group/editable relative inline"
      onMouseEnter={() => setShowPencil(true)}
      onMouseLeave={() => setShowPencil(false)}
    >
      <Component
        ref={ref as any}
        contentEditable={editing}
        suppressContentEditableWarning
        onDoubleClick={handleDoubleClick}
        onClick={handleClick}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`${className} ${editing ? 'outline-none ring-2 ring-primary/50 rounded px-1 -mx-1' : 'cursor-pointer'}`}
        style={{
          ...style,
          minWidth: editing ? '20px' : undefined,
        }}
      >
        {currentValue}
      </Component>

      {!editing && showPencil && (
        <span 
          className="absolute -right-6 top-1/2 -translate-y-1/2 p-1 rounded bg-primary/20 opacity-0 group-hover/editable:opacity-100 transition-opacity cursor-pointer"
          onClick={handleDoubleClick as any}
        >
          <Pencil className="w-3 h-3 text-primary" />
        </span>
      )}
    </span>
  );
}
