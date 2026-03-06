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
        'flex gap-2 mb-1',
        isOwn ? 'flex-row-reverse' : 'flex-row',
        showAvatar ? 'mt-2' : 'mt-0.5'
      )}
    >
      {!isOwn && (
        <div className="w-7 shrink-0">
          {showAvatar && (
            <Avatar className="h-7 w-7">
              <AvatarImage src={message.sender?.avatar_url || ''} />
              <AvatarFallback className="bg-muted text-[10px] font-bold">
                {message.sender?.fullname?.charAt(0).toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      )}
      
      <div
        className={cn(
          'max-w-[75%] rounded-2xl px-3.5 py-2 shadow-sm',
          isOwn
            ? 'bg-primary text-primary-foreground rounded-br-md'
            : 'bg-card border border-border/30 rounded-bl-md'
        )}
      >
        <p className="text-[14px] leading-relaxed whitespace-pre-wrap break-words">
          {message.content}
        </p>
        
        <div
          className={cn(
            'flex items-center gap-1 mt-0.5',
            isOwn ? 'justify-end' : 'justify-start'
          )}
        >
          <span className={cn(
            'text-[10px]',
            isOwn ? 'text-primary-foreground/60' : 'text-muted-foreground'
          )}>
            {formatMessageTime(message.created_at)}
          </span>
          
          {isOwn && (
            message.is_read ? (
              <CheckCheck className="h-3 w-3 text-blue-300" />
            ) : (
              <Check className="h-3 w-3 text-primary-foreground/50" />
            )
          )}
        </div>
      </div>
      
      {isOwn && <div className="w-7 shrink-0" />}
    </div>
  );
};