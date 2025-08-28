import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, X, Send, Minimize2, Camera, Image } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, getDocs, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { ImageUpload } from "@/components/image-upload";

interface ChatMessage {
  id: string;
  text?: string;
  imageUrl?: string;
  messageType: 'text' | 'image';
  sender: 'user' | 'admin';
  senderName?: string;
  createdAt: Date;
}

export function LiveChat() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [chatCleared, setChatCleared] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Listen to messages for this user
  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, 'chatMessages'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      // Eğer kullanıcı chat'i kapatmışsa mesajları yükleme
      if (chatCleared) {
        return;
      }

      const userMessages: ChatMessage[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        userMessages.push({
          id: doc.id,
          text: data.text,
          imageUrl: data.imageUrl,
          messageType: data.messageType || 'text',
          sender: data.sender,
          senderName: data.senderName,
          createdAt: data.timestamp?.toDate() || new Date(),
        });
      });
      userMessages.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      setMessages(userMessages);
    });

    return () => unsubscribe();
  }, [user?.uid, chatCleared]);

  const handleSendMessage = async () => {
    if (!message.trim() || !user?.uid || loading) return;

    // Yeni mesaj gönderilirken chat'i tekrar aktif hale getir
    if (chatCleared) {
      setChatCleared(false);
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'chatMessages'), {
        text: message,
        messageType: 'text',
        sender: 'user',
        senderName: profile?.firstName ? `${profile.firstName} ${profile.lastName}` : user.email,
        userId: user.uid,
        timestamp: serverTimestamp(),
      });

      setMessage("");
    } catch (error: any) {
      toast({
        title: "Hata",
        description: "Mesaj gönderilemedi",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleImageUpload = async (imageUrl: string) => {
    if (!user?.uid || loading) return;

    // Yeni resim gönderilirken chat'i tekrar aktif hale getir
    if (chatCleared) {
      setChatCleared(false);
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'chatMessages'), {
        imageUrl,
        messageType: 'image',
        sender: 'user',
        senderName: profile?.firstName ? `${profile.firstName} ${profile.lastName}` : user.email,
        userId: user.uid,
        timestamp: serverTimestamp(),
      });

      setShowImageUpload(false);
    } catch (error: any) {
      toast({
        title: "Hata",
        description: "Resim gönderilemedi",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseChat = () => {
    // Chat'i temizlenmiş olarak işaretle ve kapat
    // Mesajlar veritabanında kalır, admin panelinde görülmeye devam eder
    setChatCleared(true);
    setMessages([]);
    setMessage("");
    setShowImageUpload(false);
    setIsOpen(false);
    
    toast({
      title: "Sohbet Kapatıldı",
      description: "Chat penceresi temizlendi",
    });
  };

  return (
    <>
      {/* Chat Bubble */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={() => setIsOpen(true)}
            className="w-16 h-16 rounded-full shadow-lg hover:scale-105 transition-transform bg-blue-600 hover:bg-blue-700"
            data-testid="button-live-chat-open"
          >
            <MessageCircle className="h-6 w-6" />
            <span className="sr-only">Canlı Destek</span>
          </Button>
          
          {/* Floating Label */}
          <div className="absolute bottom-full right-0 mb-2 opacity-0 hover:opacity-100 transition-opacity">
            <div className="bg-gray-900 text-white text-sm px-3 py-1 rounded-lg whitespace-nowrap">
              Canlı Destek
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-80 max-w-[calc(100vw-2rem)]">
          <Card className="flex flex-col shadow-2xl max-h-[500px]">
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-2 bg-blue-600 text-white rounded-t-lg">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                <CardTitle className="text-lg">Canlı Destek</CardTitle>
                <Badge variant="secondary" className="bg-green-500 text-white border-0">
                  Çevrimiçi
                </Badge>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-white hover:bg-blue-700"
                  onClick={() => setIsMinimized(!isMinimized)}
                  data-testid="button-minimize-chat"
                >
                  <Minimize2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-white hover:bg-blue-700"
                  onClick={handleCloseChat}
                  data-testid="button-close-chat"
                  disabled={loading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            {!isMinimized && (
              <CardContent className="flex flex-col h-80 p-0">
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                          msg.sender === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        {msg.messageType === 'image' && msg.imageUrl ? (
                          <div className="space-y-2">
                            <img
                              src={msg.imageUrl}
                              alt="Gönderilen resim"
                              className="max-w-full max-h-48 rounded object-cover"
                            />
                            {msg.text && <p>{msg.text}</p>}
                          </div>
                        ) : (
                          <p>{msg.text}</p>
                        )}
                        <p className={`text-xs mt-1 ${
                          msg.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {msg.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input - Always at bottom */}
                <div className="flex-shrink-0 p-4 border-t bg-gray-50 space-y-3">
                  {/* Normal mesaj yazma alanı */}
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Mesajınızı yazın..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1 min-h-[40px] max-h-[60px] resize-none"
                      rows={1}
                      data-testid="input-chat-message"
                    />
                    <div className="flex flex-col gap-1">
                      <Button
                        onClick={handleSendMessage}
                        disabled={!message.trim() || loading}
                        size="sm"
                        data-testid="button-send-message"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => setShowImageUpload(!showImageUpload)}
                        variant="outline"
                        size="sm"
                        disabled={loading}
                        data-testid="button-upload-image"
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Resim yükleme alanı */}
                  {showImageUpload && (
                    <ImageUpload
                      onImageUpload={handleImageUpload}
                      onCancel={() => setShowImageUpload(false)}
                      buttonText="Resim Gönder"
                    />
                  )}
                  
                  <p className="text-xs text-gray-500">
                    Genellikle birkaç dakika içinde yanıtlıyoruz
                  </p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      )}
    </>
  );
}