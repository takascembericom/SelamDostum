import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ConversationsList } from "@/components/user-chat/conversations-list";
import { UserChat } from "@/components/user-chat/user-chat";
import { Conversation } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { MessageCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MessagesPage() {
  const [location] = useLocation();
  const [selectedConversation, setSelectedConversation] = useState<
    (Conversation & { otherUserName: string; otherUserId: string }) | null
  >(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Handle conversation query parameter
  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1]);
    const conversationId = params.get('conversation');
    
    if (conversationId) {
      // If there's a conversation parameter, we'll select it when conversations load
      // This will be handled in the conversations list component
    }
  }, [location]);

  // Handle window resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSelectConversation = (conversation: Conversation & { otherUserName: string; otherUserId: string }) => {
    setSelectedConversation(conversation);
  };

  const handleBackToList = () => {
    setSelectedConversation(null);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <MessageCircle className="h-8 w-8 text-primary" />
            Mesajlarım
          </h1>
          <p className="text-gray-600 mt-2">
            Diğer kullanıcılarla sohbet edin ve takas detaylarını konuşun
          </p>
        </div>

        {/* Chat Interface */}
        <Card className="h-[calc(100vh-200px)] overflow-hidden">
          <div className="flex h-full">
            {/* Mobile Layout */}
            {isMobile ? (
              <>
                {!selectedConversation ? (
                  /* Conversations List - Mobile */
                  <div className="w-full h-full">
                    <ConversationsList
                      onSelectConversation={handleSelectConversation}
                      selectedConversationId={selectedConversation ? selectedConversation.id : null}
                    />
                  </div>
                ) : (
                  /* Chat View - Mobile */
                  <div className="w-full h-full">
                    <UserChat
                      otherUserId={selectedConversation.otherUserId}
                      otherUserName={selectedConversation.otherUserName}
                      conversationId={selectedConversation.id}
                      tradeOfferId={selectedConversation.tradeOfferId}
                      onBack={handleBackToList}
                    />
                  </div>
                )}
              </>
            ) : (
              /* Desktop Layout */
              <>
                {/* Conversations List - Desktop */}
                <div className="w-1/3 border-r">
                  <ConversationsList
                    onSelectConversation={handleSelectConversation}
                    selectedConversationId={selectedConversation ? selectedConversation.id : null}
                  />
                </div>

                {/* Chat View - Desktop */}
                <div className="w-2/3">
                  {selectedConversation ? (
                    <UserChat
                      otherUserId={selectedConversation.otherUserId}
                      otherUserName={selectedConversation.otherUserName}
                      conversationId={selectedConversation.id}
                      tradeOfferId={selectedConversation.tradeOfferId}
                    />
                  ) : (
                    /* Empty State */
                    <div className="h-full flex items-center justify-center bg-gray-50">
                      <div className="text-center">
                        <MessageCircle className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Konuşma Seçin
                        </h3>
                        <p className="text-gray-600">
                          Mesajlaşmaya başlamak için sol taraftan bir konuşma seçin
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}