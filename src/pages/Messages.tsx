import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ConversationList } from '@/components/chat/ConversationList';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { useAuth } from '@/contexts/AuthContext';
import { useConversations, useConversationMessages, useCreateConversation } from '@/hooks/useConversations';
import { Conversation } from '@/types/database';
import { Loader2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const Messages = () => {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isMobile = useIsMobile();
  
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [showChat, setShowChat] = useState(false);

  const { data: conversations = [], isLoading: conversationsLoading } = useConversations();
  const { data: messages = [], isLoading: messagesLoading } = useConversationMessages(
    selectedConversation?.id || null
  );
  const createConversation = useCreateConversation();

  // Handle deep link to start conversation with someone
  useEffect(() => {
    const userId = searchParams.get('user');
    const propertyId = searchParams.get('property');
    
    if (userId && user) {
      // Check if conversation already exists
      const existing = conversations.find(c => 
        (c.participant_1 === userId || c.participant_2 === userId) &&
        (propertyId ? c.property_id === propertyId : true)
      );
      
      if (existing) {
        setSelectedConversation(existing);
        setShowChat(true);
      } else if (!createConversation.isPending) {
        createConversation.mutateAsync({ 
          otherUserId: userId, 
          propertyId: propertyId || undefined 
        }).then(() => {
          // Conversation will appear after refresh
        });
      }
    }
  }, [searchParams, user, conversations]);

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setShowChat(true);
  };

  const handleBack = () => {
    setShowChat(false);
    setSelectedConversation(null);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="bg-card rounded-lg shadow-sm border overflow-hidden h-[calc(100vh-200px)] min-h-[500px]">
          {isMobile ? (
            // Mobile: Show either list or chat
            showChat && selectedConversation ? (
              <ChatWindow
                conversation={selectedConversation}
                messages={messages}
                isLoading={messagesLoading}
                onBack={handleBack}
                showBackButton
              />
            ) : (
              <div className="h-full flex flex-col">
                <div className="p-4 border-b">
                  <h1 className="text-xl font-semibold">Messages</h1>
                </div>
                <ConversationList
                  conversations={conversations}
                  selectedId={selectedConversation?.id || null}
                  onSelect={handleSelectConversation}
                  isLoading={conversationsLoading}
                />
              </div>
            )
          ) : (
            // Desktop: Side by side
            <div className="flex h-full">
              <div className="w-80 border-r flex flex-col">
                <div className="p-4 border-b">
                  <h1 className="text-xl font-semibold">Messages</h1>
                </div>
                <div className="flex-1">
                  <ConversationList
                    conversations={conversations}
                    selectedId={selectedConversation?.id || null}
                    onSelect={handleSelectConversation}
                    isLoading={conversationsLoading}
                  />
                </div>
              </div>
              
              <div className="flex-1">
                <ChatWindow
                  conversation={selectedConversation}
                  messages={messages}
                  isLoading={messagesLoading}
                />
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Messages;
