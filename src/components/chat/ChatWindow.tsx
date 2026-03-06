import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageBubble } from './MessageBubble';
import { Conversation, Message } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';
import { useSendMessageToConversation, useMarkConversationAsRead, useDeleteConversation } from '@/hooks/useConversations';
import { Send, ArrowLeft, Loader2, Trash2, MoreVertical, Home, Smile } from 'lucide-react';
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
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  
  const sendMessage = useSendMessageToConversation();
  const markAsRead = useMarkConversationAsRead();
  const deleteConversation = useDeleteConversation();

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

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
      if (inputRef.current) {
        inputRef.current.style.height = 'auto';
      }
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

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    // Auto-resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  if (!conversation) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-4">
        <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center">
          <Send className="h-8 w-8 text-muted-foreground/40" />
        </div>
        <div className="text-center">
          <p className="font-semibold text-foreground mb-1">Vos messages</p>
          <p className="text-sm">Sélectionnez une conversation pour commencer</p>
        </div>
      </div>
    );
  }

  const propertyData = conversation.property;
  const propertyImage = (propertyData as any)?.primary_image_url || null;

  // Group messages by date
  const groupedMessages: { date: string; msgs: Message[] }[] = [];
  messages.forEach((msg) => {
    const date = new Date(msg.created_at).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
    const last = groupedMessages[groupedMessages.length - 1];
    if (last && last.date === date) {
      last.msgs.push(msg);
    } else {
      groupedMessages.push({ date, msgs: [msg] });
    }
  });

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header - iMessage style */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border/30 bg-card/95 backdrop-blur-xl">
        {showBackButton && (
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full -ml-1" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        
        <Link 
          to={`/profile/${conversation.other_participant?.user_id || ''}`}
          className="flex items-center gap-3 flex-1 hover:opacity-80 transition-opacity"
        >
          <div className="relative">
            <Avatar className="h-10 w-10 ring-2 ring-primary/10">
              <AvatarImage src={conversation.other_participant?.avatar_url || ''} />
              <AvatarFallback className="bg-primary text-primary-foreground text-sm font-bold">
                {conversation.other_participant?.fullname?.charAt(0).toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>
            {/* Online indicator */}
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-card" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-[15px] truncate">
              {conversation.other_participant?.fullname || 'Utilisateur'}
            </h3>
            <p className="text-xs text-muted-foreground">En ligne</p>
          </div>
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-xl">
            <DropdownMenuItem
              className="text-destructive rounded-lg"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer la discussion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent className="rounded-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer cette discussion ?</AlertDialogTitle>
              <AlertDialogDescription>
                Les messages de cette conversation seront supprimés. Cette action est irréversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl">Annuler</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
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

      {/* Property context banner */}
      {propertyData && (
        <Link 
          to={`/property/${propertyData.id}`}
          className="flex items-center gap-3 px-4 py-2 bg-accent/5 border-b border-border/20 hover:bg-accent/10 transition-colors"
        >
          {propertyImage ? (
            <img src={propertyImage} alt="" className="h-10 w-14 rounded-lg object-cover shrink-0 shadow-sm" />
          ) : (
            <div className="h-10 w-14 rounded-lg bg-muted flex items-center justify-center shrink-0">
              <Home className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold truncate">{propertyData.title}</p>
            {(propertyData as any)?.price && (
              <p className="text-xs text-accent font-bold">
                {Number((propertyData as any).price).toLocaleString('fr-FR')} CFA
              </p>
            )}
          </div>
          <span className="text-xs text-muted-foreground shrink-0">Voir →</span>
        </Link>
      )}

      {/* Messages area */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-4 py-3"
        style={{ 
          backgroundImage: 'radial-gradient(circle at 50% 50%, hsl(var(--muted)/0.3) 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3">
            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
              <Smile className="h-7 w-7 text-accent" />
            </div>
            <div className="text-center">
              <p className="font-medium text-foreground">Démarrer la conversation</p>
              <p className="text-sm mt-1">Envoyez le premier message !</p>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            {groupedMessages.map((group) => (
              <div key={group.date}>
                <div className="flex justify-center my-4">
                  <span className="text-[11px] text-muted-foreground bg-muted/80 backdrop-blur-sm px-3 py-1 rounded-full font-medium">
                    {group.date}
                  </span>
                </div>
                {group.msgs.map((message, index) => {
                  const isOwn = message.sender_id === user?.id;
                  const showAvatar = index === 0 || 
                    group.msgs[index - 1].sender_id !== message.sender_id;
                  
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
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input - iMessage style */}
      <div className="px-3 py-2 border-t border-border/30 bg-card/95 backdrop-blur-xl">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={newMessage}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Message..."
              rows={1}
              className="w-full resize-none rounded-2xl border border-border/50 bg-muted/50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 placeholder:text-muted-foreground/60 max-h-[120px]"
              disabled={sendMessage.isPending}
              style={{ minHeight: '40px' }}
            />
          </div>
          <Button
            onClick={handleSend}
            disabled={!newMessage.trim() || sendMessage.isPending}
            size="icon"
            className={`h-10 w-10 rounded-full shrink-0 transition-all ${
              newMessage.trim() 
                ? 'gradient-gold shadow-lg shadow-accent/20 scale-100' 
                : 'bg-muted text-muted-foreground scale-95'
            }`}
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