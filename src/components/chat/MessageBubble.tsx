import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Message } from '@/types/database';
import { formatMessageTime } from '@/lib/dateUtils';
import { Check, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar?: boolean;
}

export const MessageBubble = ({ message, isOwn, showAvatar = true }: MessageBubbleProps) => {
  return (
    <div
      className={cn(
        'flex gap-2 mb-2',
        isOwn ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {showAvatar && !isOwn && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={message.sender?.avatar_url || ''} />
          <AvatarFallback className="bg-muted text-xs">
            {message.sender?.fullname?.charAt(0).toUpperCase() || '?'}
          </AvatarFallback>
        </Avatar>
      )}
      
      <div
        className={cn(
          'max-w-[70%] rounded-2xl px-4 py-2',
          isOwn
            ? 'bg-primary text-primary-foreground rounded-br-md'
            : 'bg-muted rounded-bl-md'
        )}
      >
        <p className="text-sm whitespace-pre-wrap break-words">
          {message.content}
        </p>
        
        <div
          className={cn(
            'flex items-center gap-1 mt-1',
            isOwn ? 'justify-end' : 'justify-start'
          )}
        >
          <span className={cn(
            'text-xs',
            isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
          )}>
            {formatMessageTime(message.created_at)}
          </span>
          
          {isOwn && (
            message.is_read ? (
              <CheckCheck className="h-3 w-3 text-primary-foreground/70" />
            ) : (
              <Check className="h-3 w-3 text-primary-foreground/70" />
            )
          )}
        </div>
      </div>
      
      {showAvatar && isOwn && <div className="w-8" />}
    </div>
  );
};
