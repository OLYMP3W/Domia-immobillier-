import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Conversation } from '@/types/database';
import { formatRelativeDate } from '@/lib/dateUtils';
import { MessageCircle, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConversationListProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (conversation: Conversation) => void;
  isLoading?: boolean;
}

export const ConversationList = ({
  conversations,
  selectedId,
  onSelect,
  isLoading,
}: ConversationListProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-3">
          <MessageCircle className="h-7 w-7 text-muted-foreground/50" />
        </div>
        <p className="font-semibold text-foreground mb-1">Aucune conversation</p>
        <p className="text-sm text-muted-foreground">
          Contactez un propriétaire pour démarrer
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div>
        {conversations.map((conversation) => {
          const isSelected = selectedId === conversation.id;
          const hasUnread = conversation.unread_count && conversation.unread_count > 0;
          const propertyImage = (conversation.property as any)?.primary_image_url;

          return (
            <button
              key={conversation.id}
              onClick={() => onSelect(conversation)}
              className={cn(
                "w-full px-4 py-3 flex items-center gap-3 transition-all text-left border-b border-border/10",
                isSelected 
                  ? "bg-primary/5 border-l-2 border-l-primary" 
                  : "hover:bg-muted/50",
                hasUnread && "bg-accent/5"
              )}
            >
              <div className="relative shrink-0">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={conversation.other_participant?.avatar_url || ''} />
                  <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                    {conversation.other_participant?.fullname?.charAt(0).toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>
                {/* Online dot */}
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-card" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className={cn(
                    "truncate text-[14px]",
                    hasUnread ? "font-bold text-foreground" : "font-medium"
                  )}>
                    {conversation.other_participant?.fullname || 'Utilisateur'}
                  </span>
                  <span className="text-[11px] text-muted-foreground shrink-0">
                    {formatRelativeDate(conversation.last_message_at)}
                  </span>
                </div>
                
                {conversation.property && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <Home className="h-3 w-3 text-accent shrink-0" />
                    <p className="text-[11px] text-accent font-medium truncate">
                      {conversation.property.title}
                    </p>
                  </div>
                )}
                
                <div className="flex items-center justify-between gap-2 mt-0.5">
                  {conversation.last_message ? (
                    <p className={cn(
                      "text-[13px] truncate",
                      hasUnread ? "text-foreground font-medium" : "text-muted-foreground"
                    )}>
                      {conversation.last_message.content}
                    </p>
                  ) : (
                    <p className="text-[13px] text-muted-foreground italic">Aucun message</p>
                  )}
                  
                  {hasUnread && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent text-accent-foreground text-[10px] font-bold px-1.5 shrink-0">
                      {conversation.unread_count! > 9 ? '9+' : conversation.unread_count}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </ScrollArea>
  );
};