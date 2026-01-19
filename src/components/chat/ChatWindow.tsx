import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageBubble } from './MessageBubble';
import { Conversation, Message } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';
import { useSendMessageToConversation, useMarkConversationAsRead } from '@/hooks/useConversations';
import { Send, ArrowLeft, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ChatWindowProps {
  conversation: Conversation | null;
  messages: Message[];
  isLoading?: boolean;
  onBack?: () => void;
  showBackButton?: boolean;
}

export const ChatWindow = ({
  conversation,
  messages,
  isLoading,
  onBack,
  showBackButton = false,
}: ChatWindowProps) => {
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const sendMessage = useSendMessageToConversation();
  const markAsRead = useMarkConversationAsRead();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Mark messages as read when conversation is opened
  useEffect(() => {
    if (conversation?.id && conversation.unread_count && conversation.unread_count > 0) {
      markAsRead.mutate(conversation.id);
    }
  }, [conversation?.id]);

  const handleSend = async () => {
    if (!newMessage.trim() || !conversation || !user) return;

    const receiverId = conversation.participant_1 === user.id 
      ? conversation.participant_2 
      : conversation.participant_1;

    try {
      await sendMessage.mutateAsync({
        conversationId: conversation.id,
        receiverId,
        content: newMessage.trim(),
        propertyId: conversation.property_id || undefined,
      });
      setNewMessage('');
      inputRef.current?.focus();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!conversation) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <p>Sélectionnez une conversation</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b bg-card">
        {showBackButton && (
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        
        <Link 
          to={`/profile/${conversation.other_participant?.user_id || ''}`}
          className="flex items-center gap-3 flex-1 hover:opacity-80 transition-opacity"
        >
          <Avatar className="h-10 w-10">
            <AvatarImage src={conversation.other_participant?.avatar_url || ''} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {conversation.other_participant?.fullname?.charAt(0).toUpperCase() || '?'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate">
              {conversation.other_participant?.fullname || 'Utilisateur'}
            </h3>
            {conversation.property && (
              <p className="text-sm text-primary truncate">
                {conversation.property.title}
              </p>
            )}
          </div>
        </Link>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <p>Aucun message</p>
            <p className="text-sm">Envoyez le premier message !</p>
          </div>
        ) : (
          <div className="space-y-1">
            {messages.map((message, index) => {
              const isOwn = message.sender_id === user?.id;
              const showAvatar = index === 0 || 
                messages[index - 1].sender_id !== message.sender_id;
              
              return (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwn={isOwn}
                  showAvatar={showAvatar}
                />
              );
            })}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t bg-card">
        <div className="flex items-center gap-2">
          <Input
            ref={inputRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Écrivez votre message..."
            className="flex-1"
            disabled={sendMessage.isPending}
          />
          <Button
            onClick={handleSend}
            disabled={!newMessage.trim() || sendMessage.isPending}
            size="icon"
          >
            {sendMessage.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
