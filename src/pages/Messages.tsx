import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { MobileNavbar } from '@/components/MobileNavbar';
import { ConversationList } from '@/components/chat/ConversationList';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { useAuth } from '@/contexts/AuthContext';
import { useConversations, useConversationMessages, useCreateConversation } from '@/hooks/useConversations';
import { Conversation } from '@/types/database';
import { Loader2, MessageSquare } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { AuthModal } from '@/components/AuthModal';

const Messages = () => {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isMobile = useIsMobile();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const { data: conversations = [], isLoading: conversationsLoading } = useConversations();
  const { data: messages = [], isLoading: messagesLoading } = useConversationMessages(selectedConversation?.id || null);
  const createConversation = useCreateConversation();

  useEffect(() => {
    const userId = searchParams.get('user');
    const propertyId = searchParams.get('property');
    if (userId && user) {
      const existing = conversations.find(c =>
        (c.participant_1 === userId || c.participant_2 === userId) && (propertyId ? c.property_id === propertyId : true)
      );
      if (existing) { setSelectedConversation(existing); setShowChat(true); }
      else if (!createConversation.isPending) {
        createConversation.mutateAsync({ otherUserId: userId, propertyId: propertyId || undefined });
      }
    }
  }, [searchParams, user, conversations]);

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-accent" /></div>;
  if (!isAuthenticated) { navigate('/'); return null; }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {!isMobile && <Navbar />}

      <main className="flex-1 flex flex-col">
        <div className={`flex-1 ${isMobile ? 'h-screen' : 'container mx-auto px-4 py-6'}`}>
          <div className={`bg-card overflow-hidden ${isMobile ? 'h-full' : 'rounded-2xl border border-border/50 h-[calc(100vh-200px)] min-h-[500px] shadow-sm'}`}>
            {isMobile ? (
              showChat && selectedConversation ? (
                <ChatWindow conversation={selectedConversation} messages={messages} isLoading={messagesLoading} onBack={() => { setShowChat(false); setSelectedConversation(null); }} showBackButton />
              ) : (
                <div className="h-full flex flex-col">
                  <div className="p-5 border-b border-border/50 bg-card/95 backdrop-blur-lg">
                    <h1 className="text-xl font-bold flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-accent" /> Messages
                    </h1>
                  </div>
                  <ConversationList conversations={conversations} selectedId={selectedConversation?.id || null} onSelect={(c) => { setSelectedConversation(c); setShowChat(true); }} isLoading={conversationsLoading} />
                </div>
              )
            ) : (
              <div className="flex h-full">
                <div className="w-80 border-r border-border/50 flex flex-col">
                  <div className="p-5 border-b border-border/50">
                    <h1 className="text-xl font-bold flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-accent" /> Messages
                    </h1>
                  </div>
                  <div className="flex-1"><ConversationList conversations={conversations} selectedId={selectedConversation?.id || null} onSelect={(c) => { setSelectedConversation(c); setShowChat(true); }} isLoading={conversationsLoading} /></div>
                </div>
                <div className="flex-1"><ChatWindow conversation={selectedConversation} messages={messages} isLoading={messagesLoading} /></div>
              </div>
            )}
          </div>
        </div>
      </main>

      <MobileNavbar onOpenAuth={() => setAuthModalOpen(true)} />
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </div>
  );
};

export default Messages;
