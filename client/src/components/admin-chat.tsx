import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { MessageCircle, Send, User, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ImageUpload } from "@/components/image-upload";

interface ChatMessage {
  id: string;
  text?: string;
  imageUrl?: string;
  messageType: 'text' | 'image';
  sender: 'user' | 'admin';
  senderName?: string;
  userId?: string;
  timestamp: any;
  createdAt: Date;
}

interface ChatConversation {
  userId: string;
  userName: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  messages: ChatMessage[];
}

export function AdminChat() {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Listen to all chat messages
    const q = query(
      collection(db, 'chatMessages')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages: ChatMessage[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        messages.push({
          id: doc.id,
          text: data.text,
          imageUrl: data.imageUrl,
          messageType: data.messageType || 'text',
          sender: data.sender,
          senderName: data.senderName,
          userId: data.userId,
          timestamp: data.timestamp,
          createdAt: data.timestamp?.toDate() || new Date(),
        });
      });

      // Group messages by userId
      const conversationsMap = new Map<string, ChatConversation>();
      
      messages.forEach((message) => {
        if (!message.userId) return;
        
        if (!conversationsMap.has(message.userId)) {
          conversationsMap.set(message.userId, {
            userId: message.userId,
            userName: message.senderName || 'Kullanıcı',
            lastMessage: message.messageType === 'image' ? '📷 Resim gönderildi' : message.text || '',
            lastMessageTime: message.createdAt,
            unreadCount: message.sender === 'user' ? 1 : 0,
            messages: [],
          });
        }
        
        const conversation = conversationsMap.get(message.userId)!;
        conversation.messages.push(message);
        
        // Update last message if this is newer
        if (message.createdAt > conversation.lastMessageTime) {
          conversation.lastMessage = message.messageType === 'image' ? '📷 Resim gönderildi' : message.text || '';
          conversation.lastMessageTime = message.createdAt;
        }
      });

      // Sort messages within each conversation
      conversationsMap.forEach((conversation) => {
        conversation.messages.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      });

      const conversationList = Array.from(conversationsMap.values())
        .sort((a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime());

      setConversations(conversationList);
    });

    return () => unsubscribe();
  }, []);

  const handleSendReply = async () => {
    if (!replyMessage.trim() || !selectedUserId || loading) return;

    setLoading(true);
    try {
      await addDoc(collection(db, 'chatMessages'), {
        text: replyMessage,
        messageType: 'text',
        sender: 'admin',
        senderName: 'Destek Ekibi',
        userId: selectedUserId,
        timestamp: serverTimestamp(),
      });

      setReplyMessage("");
      toast({
        title: "Mesaj gönderildi",
        description: "Kullanıcıya yanıtınız iletildi",
      });
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (imageUrl: string) => {
    if (!selectedUserId || loading) return;

    setLoading(true);
    try {
      await addDoc(collection(db, 'chatMessages'), {
        imageUrl,
        messageType: 'image',
        sender: 'admin',
        senderName: 'Destek Ekibi',
        userId: selectedUserId,
        timestamp: serverTimestamp(),
      });

      setShowImageUpload(false);
      toast({
        title: "Resim gönderildi",
        description: "Kullanıcıya resim iletildi",
      });
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedConversation = conversations.find(c => c.userId === selectedUserId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
      {/* Conversations List */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Canlı Destek ({conversations.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[500px] overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <MessageCircle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>Henüz mesaj yok</p>
              </div>
            ) : (
              conversations.map((conversation) => (
                <div
                  key={conversation.userId}
                  onClick={() => setSelectedUserId(conversation.userId)}
                  className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                    selectedUserId === conversation.userId ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{conversation.userName}</h4>
                        <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs text-gray-500">
                        {conversation.lastMessageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {conversation.unreadCount > 0 && (
                        <Badge variant="default" className="text-xs">
                          {conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Chat Messages */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>
            {selectedConversation ? `${selectedConversation.userName} ile Sohbet` : 'Bir konuşma seçin'}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col h-[500px] p-0">
          {selectedConversation ? (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {selectedConversation.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg px-3 py-2 ${
                        message.sender === 'admin'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      {message.messageType === 'image' && message.imageUrl ? (
                        <div className="space-y-2">
                          <img
                            src={message.imageUrl}
                            alt="Gönderilen resim"
                            className="max-w-full max-h-48 rounded object-cover"
                          />
                          {message.text && <p className="text-sm">{message.text}</p>}
                        </div>
                      ) : (
                        <p className="text-sm">{message.text}</p>
                      )}
                      <p className={`text-xs mt-1 ${
                        message.sender === 'admin' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {message.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Reply Input */}
              <div className="p-4 border-t bg-gray-50">
                {showImageUpload ? (
                  <ImageUpload
                    onImageUpload={handleImageUpload}
                    onCancel={() => setShowImageUpload(false)}
                    buttonText="Admin Resim Gönder"
                  />
                ) : (
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Kullanıcıya yanıt yazın..."
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      className="flex-1 min-h-[40px] max-h-[100px] resize-none"
                      rows={2}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendReply();
                        }
                      }}
                    />
                    <div className="flex flex-col gap-1">
                      <Button
                        onClick={handleSendReply}
                        disabled={!replyMessage.trim() || loading}
                        size="sm"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => setShowImageUpload(true)}
                        variant="outline"
                        size="sm"
                        disabled={loading}
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Bir kullanıcı konuşması seçin</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}