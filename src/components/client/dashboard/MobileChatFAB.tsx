import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChatWidget } from './ChatWidget';
import { cn } from '@/lib/utils';

interface MobileChatFABProps {
  unreadCount?: number;
}

export function MobileChatFAB({ unreadCount = 0 }: MobileChatFABProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* FAB Button */}
      <Button
        size="icon"
        className={cn(
          "fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg z-40 lg:hidden",
          isOpen && "hidden"
        )}
        onClick={() => setIsOpen(true)}
      >
        <MessageCircle className="w-6 h-6" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-destructive text-destructive-foreground">
            {unreadCount}
          </Badge>
        )}
      </Button>

      {/* Fullscreen chat modal */}
      {isOpen && (
        <ChatWidget 
          isOpen={isOpen} 
          onClose={() => setIsOpen(false)} 
          isMobile 
        />
      )}
    </>
  );
}
