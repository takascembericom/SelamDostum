import { useState, useEffect, useRef } from "react";
import { UserMessage, InsertUserMessage } from "@shared/schema";
import { 
  sendUserMessage, 
  subscribeToConversationMessages, 
  markMessagesAsRead,
  createOrGetConversation 
} from "@/lib/userMessages";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ImageUpload } from "@/components/image-upload";
import { 
  Send, 
  ArrowLeft, 
  Image as ImageIcon,
  User,
  Loader2,
  MessageCircle 
} from "lucide-react";

interface UserChatProps {
  otherUserId: string;
  otherUserName: string;
  otherUserAvatar?: string;
  conversationId?: string;
  tradeOfferId?: string;
  onBack?: () => void;
}

export function UserChat({ 
  otherUserId, 
  otherUserName, 
  otherUserAvatar,
  conversationId: initialConversationId,
  tradeOfferId,
  onBack 
}: UserChatProps) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<UserMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(initialConversationId || null);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll to bottom when messages change - but delay to avoid UI jumping
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      scrollToBottom();
    }, 100);
    return () => clearTimeout(timeoutId);
  }, [messages]);

  // Initialize conversation
  useEffect(() => {
    const initConversation = async () => {
      if (!profile?.id || !otherUserId) return;

      try {
        let convId = initialConversationId;
        if (!convId) {
          convId = await createOrGetConversation(profile.id, otherUserId, tradeOfferId);
        }
        setConversationId(convId);
      } catch (error: any) {
        toast({
          title: "Hata",
          description: error.message || "Konuşma başlatılamadı",
          variant: "destructive",
        });
      }
    };

    initConversation();
  }, [profile?.id, otherUserId, initialConversationId, tradeOfferId]);

  // Subscribe to messages
  useEffect(() => {
    if (!conversationId) return;

    const unsubscribe = subscribeToConversationMessages(conversationId, (newMessages) => {
      // Simple approach like admin chat - just set messages directly
      setMessages(newMessages);
      
      // Mark messages as read when they arrive
      if (profile?.id) {
        markMessagesAsRead(conversationId, profile.id).catch(console.error);
      }
    }, profile?.id);

    // Also mark as read when conversation first opens
    if (profile?.id) {
      markMessagesAsRead(conversationId, profile.id).catch(console.error);
    }

    return () => unsubscribe();
  }, [conversationId, profile?.id]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !profile?.id || !conversationId || loading) return;

    setLoading(true);
    try {
      const messageData: InsertUserMessage = {
        fromUserId: profile.id,
        toUserId: otherUserId,
        text: newMessage.trim(),
        messageType: 'text',
        conversationId,
        isRead: false,
        timestamp: new Date(),
        deletedBy: [],
      };

      await sendUserMessage(messageData);
      setNewMessage("");
      
      // Scroll to bottom after sending message
      setTimeout(() => {
        scrollToBottom();
      }, 200);
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "Mesaj gönderilemedi",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (imageUrl: string) => {
    if (!profile?.id || !conversationId || loading) return;

    setLoading(true);
    try {
      const messageData: InsertUserMessage = {
        fromUserId: profile.id,
        toUserId: otherUserId,
        imageUrl,
        messageType: 'image',
        conversationId,
        isRead: false,
        timestamp: new Date(),
        deletedBy: [],
      };

      await sendUserMessage(messageData);
      setShowImageUpload(false);
      
      toast({
        title: "Başarılı",
        description: "Resim gönderildi",
      });
    } catch (error: any) {
      toast({
        title: "Hata", 
        description: error.message || "Resim gönderilemedi",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const messageDate = new Date(date);
    
    if (messageDate.toDateString() === today.toDateString()) {
      return "Bugün";
    }
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (messageDate.toDateString() === yesterday.toDateString()) {
      return "Dün";
    }
    
    return messageDate.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short'
    });
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Giriş yapmalısınız</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center overflow-hidden">
              {otherUserAvatar ? (
                <img 
                  src={otherUserAvatar} 
                  alt={otherUserName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="h-5 w-5 text-primary" />
              )}
            </div>
            
            <div>
              <CardTitle className="text-lg">{otherUserName}</CardTitle>
              <p className="text-sm text-gray-500">
                <MessageCircle className="h-4 w-4 inline mr-1" />
                Mesajlaşma
              </p>
            </div>
          </div>
        </div>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 max-h-96">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">Henüz mesaj yok</h3>
            <p className="text-gray-600">İlk mesajı gönderin ve sohbeti başlatın!</p>
          </div>
        ) : (
          <>
            {messages.map((message, index) => {
              const isFromMe = message.fromUserId === profile.id;
              const showDate = index === 0 || 
                formatDate(messages[index - 1].createdAt) !== formatDate(message.createdAt);

              return (
                <div key={message.id}>
                  {showDate && (
                    <div className="text-center my-4">
                      <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs">
                        {formatDate(message.createdAt)}
                      </span>
                    </div>
                  )}
                  
                  <div className={`flex ${isFromMe ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        isFromMe
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      {message.messageType === 'text' ? (
                        <p className="text-sm">{message.text}</p>
                      ) : (
                        <div className="space-y-2">
                          <img
                            src={message.imageUrl}
                            alt="Paylaşılan resim"
                            className="max-w-full rounded-lg"
                          />
                        </div>
                      )}
                      <p className={`text-xs mt-1 ${
                        isFromMe ? 'text-primary-foreground/70' : 'text-gray-500'
                      }`}>
                        {formatTime(message.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </CardContent>

      <Separator />

      {/* Message Input */}
      <div className="p-4 space-y-3">
        {showImageUpload && (
          <div className="border rounded-lg p-4 bg-gray-50">
            <ImageUpload
              onImageUpload={handleImageUpload}
              onCancel={() => setShowImageUpload(false)}
            />
          </div>
        )}

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowImageUpload(!showImageUpload)}
            disabled={loading}
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
          
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Mesajınızı yazın..."
            disabled={loading}
            className="flex-1"
          />
          
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || loading}
            size="sm"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}