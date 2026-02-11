import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageBubble } from './MessageBubble';
import { Conversation, Message } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';
import { useSendMessageToConversation, useMarkConversationAsRead, useDeleteConversation } from '@/hooks/useConversations';
import { Send, ArrowLeft, Loader2, Trash2, MoreVertical } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const sendMessage = useSendMessageToConversation();
  const markAsRead = useMarkConversationAsRead();
  const deleteConversation = useDeleteConversation();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Mark messages as read when conversation is opened
  useEffect(() => {
    if (conversation?.id && conversation.unread_count && conversation.unread_count > 0) {
      markAsRead.mutate(conversation.id);
    }
  }, [conversation?.id, conversation?.unread_count]);

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

        {/* Menu options */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer la discussion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Confirmation suppression */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer cette discussion ?</AlertDialogTitle>
              <AlertDialogDescription>
                Les messages de cette conversation seront supprimés. Cette action est irréversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={async () => {
                  try {
                    await deleteConversation.mutateAsync(conversation.id);
                    toast({ title: 'Discussion supprimée' });
                    onBack?.();
                  } catch {
                    toast({ title: 'Erreur', description: 'Impossible de supprimer', variant: 'destructive' });
                  }
                }}
              >
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Messages - Custom scrollable container */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-4"
      >
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
            {/* Invisible element to scroll to */}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

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
