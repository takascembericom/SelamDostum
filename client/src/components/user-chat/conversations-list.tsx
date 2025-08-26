import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Conversation } from "@shared/schema";
import { subscribeToUserConversations } from "@/lib/userMessages";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  MessageCircle, 
  User, 
  Search,
  Clock,
  ArrowRight
} from "lucide-react";

interface ConversationsListProps {
  onSelectConversation: (conversation: Conversation & { otherUserName: string; otherUserId: string }) => void;
  selectedConversationId?: string;
}

export function ConversationsList({ onSelectConversation, selectedConversationId }: ConversationsListProps) {
  const { profile } = useAuth();
  const [location] = useLocation();
  const [conversations, setConversations] = useState<(Conversation & { otherUserName: string; otherUserId: string })[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.id) return;

    const unsubscribe = subscribeToUserConversations(profile.id, (newConversations) => {
      setConversations(newConversations as (Conversation & { otherUserName: string; otherUserId: string })[]);
      setLoading(false);
      
      // Auto-select conversation from URL parameter
      const params = new URLSearchParams(location.split('?')[1]);
      const conversationId = params.get('conversation');
      
      if (conversationId && !selectedConversationId) {
        const conversation = newConversations.find(c => c.id === conversationId) as 
          Conversation & { otherUserName: string; otherUserId: string };
        if (conversation) {
          onSelectConversation(conversation);
        }
      }
    });

    return () => unsubscribe();
  }, [profile?.id, location, selectedConversationId, onSelectConversation]);

  const filteredConversations = conversations.filter(conversation =>
    conversation.otherUserName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (date: Date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return diffInMinutes < 1 ? "şimdi" : `${diffInMinutes}dk`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}sa`;
    } else if (diffInHours < 168) { // 7 days
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}g`;
    } else {
      return messageDate.toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'short'
      });
    }
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Giriş yapmalısınız</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Mesajlarım
        </CardTitle>
      </CardHeader>

      {/* Search */}
      <div className="px-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Konuşma ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="space-y-2 px-6 pb-6">
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="text-center py-8">
            {searchQuery ? (
              <>
                <Search className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Konuşma bulunamadı</h3>
                <p className="text-gray-600">"{searchQuery}" için konuşma bulunamadı</p>
              </>
            ) : (
              <>
                <MessageCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Henüz konuşma yok</h3>
                <p className="text-gray-600">
                  Takas teklifleri üzerinden diğer kullanıcılarla mesajlaşmaya başlayın
                </p>
              </>
            )}
          </div>
        ) : (
          filteredConversations.map((conversation) => {
            const unreadCount = conversation.unreadCount[profile.id] || 0;
            const isSelected = conversation.id === selectedConversationId;

            return (
              <Card
                key={conversation.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                  isSelected ? 'ring-2 ring-primary border-primary' : ''
                }`}
                onClick={() => onSelectConversation(conversation)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                      <User className="h-6 w-6 text-primary" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-gray-900 truncate">
                          {conversation.otherUserName}
                        </h4>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {unreadCount > 0 && (
                            <Badge variant="destructive" className="text-xs min-w-[20px] h-5 flex items-center justify-center">
                              {unreadCount > 99 ? '99+' : unreadCount}
                            </Badge>
                          )}
                          <span className="text-xs text-gray-500">
                            {formatTime(conversation.lastMessageTime)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <p className={`text-sm truncate ${
                          unreadCount > 0 ? 'font-medium text-gray-900' : 'text-gray-600'
                        }`}>
                          {conversation.lastMessage || 'Henüz mesaj yok'}
                        </p>
                        <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0 ml-2" />
                      </div>

                      {/* Trade offer indicator */}
                      {conversation.tradeOfferId && (
                        <div className="mt-2">
                          <Badge variant="outline" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            Takas Teklifi
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}