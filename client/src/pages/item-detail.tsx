import { useState } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Item, CONDITION_LABELS, CATEGORY_LABELS } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, MapPin, Star, Calendar, User, MessageCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { TradeOfferModal } from "@/components/trade/trade-offer-modal";
import { createOrGetConversation } from "@/lib/userMessages";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function ItemDetail() {
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: item, isLoading, error } = useQuery({
    queryKey: ["item", id],
    queryFn: async (): Promise<Item | null> => {
      if (!id) return null;
      
      const itemDoc = await getDoc(doc(db, "items", id));
      if (!itemDoc.exists()) return null;
      
      const data = itemDoc.data();
      return {
        ...data,
        id: itemDoc.id,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as Item;
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-96 bg-gray-200 rounded"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">İlan Bulunamadı</h1>
          <p className="text-gray-600 mb-6">Aradığınız ilan mevcut değil veya kaldırılmış olabilir.</p>
          <Link href="/items">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              İlanlara Dön
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isOwner = profile?.id === item.ownerId;

  const handleSendMessage = async () => {
    if (!profile?.id || !item) return;

    try {
      const conversationId = await createOrGetConversation(profile.id, item.ownerId);
      setLocation(`/messages?conversation=${conversationId}`);
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "Sohbet başlatılamadı",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <div className="mb-6">
        <Link href="/items">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            İlanlara Dön
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <div className="relative">
                <img
                  src={item.images[currentImageIndex]}
                  alt={item.title}
                  className="w-full h-96 object-cover rounded-lg"
                  data-testid="img-item-main"
                />
                <Badge 
                  className="absolute top-4 right-4" 
                  variant="secondary"
                  data-testid="badge-condition"
                >
                  {CONDITION_LABELS[item.condition]}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Image Thumbnails */}
          {item.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {item.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                    currentImageIndex === index ? 'border-blue-500' : 'border-gray-200'
                  }`}
                  data-testid={`thumbnail-${index}`}
                >
                  <img
                    src={image}
                    alt={`${item.title} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Item Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="title-item">
              {item.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span data-testid="date-item">{formatDate(item.createdAt)}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span data-testid="location-item">{item.location}</span>
              </div>
              {item.rating && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span data-testid="rating-item">{item.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Badge variant="outline" data-testid="category-item">
              {CATEGORY_LABELS[item.category as keyof typeof CATEGORY_LABELS] || item.category}
            </Badge>
            <Badge 
              variant={item.status === 'aktif' ? 'default' : 'secondary'}
              data-testid="status-item"
            >
              {item.status === 'aktif' ? 'Aktif' : 
               item.status === 'takas_edildi' ? 'Takas Edildi' : 
               item.status}
            </Badge>
          </div>

          <Separator />

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Açıklama</h2>
            <p className="text-gray-700 leading-relaxed" data-testid="description-item">
              {item.description}
            </p>
          </div>

          <Separator />

          {/* Owner Info */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900" data-testid="owner-name">
                      {item.ownerName}
                    </p>
                    <p className="text-sm text-gray-500">İlan Sahibi</p>
                  </div>
                </div>
                {!isOwner && profile && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleSendMessage}
                    data-testid="button-send-message"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Mesaj Gönder
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          {!isOwner && profile && item.status === 'aktif' && (
            <div className="space-y-3">
              <Button 
                className="w-full" 
                size="lg" 
                onClick={() => setIsTradeModalOpen(true)}
                data-testid="button-trade-offer"
              >
                Takas Teklifi Ver
              </Button>
              <p className="text-sm text-gray-500 text-center">
                Bu ilan ile takas yapmak için kendi ilanlarınızdan birini seçin
              </p>
            </div>
          )}

          {!profile && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4 text-center">
                <p className="text-blue-800 mb-3">
                  Takas teklifi vermek için giriş yapmanız gerekiyor
                </p>
                <Button asChild>
                  <Link href="/profile">Giriş Yap</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {isOwner && (
            <Card className="bg-gray-50 border-gray-200">
              <CardContent className="p-4 text-center">
                <p className="text-gray-700">Bu sizin ilanınız</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Trade Offer Modal */}
      {item && (
        <TradeOfferModal
          isOpen={isTradeModalOpen}
          onClose={() => setIsTradeModalOpen(false)}
          targetItem={item}
        />
      )}
    </div>
  );
}