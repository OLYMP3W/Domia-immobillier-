import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Conversation } from '@/types/database';
import { formatRelativeDate } from '@/lib/dateUtils';
import { MessageCircle } from 'lucide-react';

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
      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
        <MessageCircle className="h-12 w-12 text-muted-foreground mb-2" />
        <p className="text-muted-foreground">Aucune conversation</p>
        <p className="text-sm text-muted-foreground">
          Contactez un propriétaire pour démarrer
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="divide-y">
        {conversations.map((conversation) => (
          <button
            key={conversation.id}
            onClick={() => onSelect(conversation)}
            className={`w-full p-3 flex items-start gap-3 hover:bg-accent transition-colors text-left ${
              selectedId === conversation.id ? 'bg-accent' : ''
            }`}
          >
            <Avatar className="h-12 w-12 flex-shrink-0">
              <AvatarImage src={conversation.other_participant?.avatar_url || ''} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {conversation.other_participant?.fullname?.charAt(0).toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium truncate">
                  {conversation.other_participant?.fullname || 'Utilisateur'}
                </span>
                {conversation.unread_count && conversation.unread_count > 0 && (
                  <Badge variant="default" className="flex-shrink-0">
                    {conversation.unread_count}
                  </Badge>
                )}
              </div>
              
              {conversation.property && (
                <p className="text-xs text-primary truncate">
                  {conversation.property.title}
                </p>
              )}
              
              {conversation.last_message && (
                <p className="text-sm text-muted-foreground truncate">
                  {conversation.last_message.content}
                </p>
              )}
              
              <p className="text-xs text-muted-foreground mt-1">
                {formatRelativeDate(conversation.last_message_at)}
              </p>
            </div>
          </button>
        ))}
      </div>
    </ScrollArea>
  );
};
