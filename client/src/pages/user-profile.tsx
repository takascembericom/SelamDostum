import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { doc, getDoc, query, collection, where, getDocs, addDoc, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { User, Item, Rating, InsertRating } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Star, 
  MessageCircle,
  Package,
  ThumbsUp,
  User as UserIcon
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createOrGetConversation } from "@/lib/userMessages";
import { useLocation } from "wouter";
import { ItemGrid } from "@/components/items/item-grid";
import { CATEGORY_LABELS, CONDITION_LABELS } from "@shared/schema";

export default function UserProfile() {
  const { id: userId } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [rating, setRating] = useState(5);
  const queryClient = useQueryClient();

  // Fetch user data
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["user", userId],
    queryFn: async (): Promise<User | null> => {
      if (!userId) return null;
      
      const userDoc = await getDoc(doc(db, "users", userId));
      if (!userDoc.exists()) return null;
      
      const data = userDoc.data();
      return {
        ...data,
        id: userDoc.id,
        createdAt: data.createdAt.toDate(),
      } as User;
    },
  });

  // Fetch user's active items
  const { data: userItems = [], isLoading: itemsLoading } = useQuery({
    queryKey: ["user-items", userId],
    queryFn: async (): Promise<Item[]> => {
      if (!userId) return [];
      
      const q = query(
        collection(db, "items"),
        where("ownerId", "==", userId),
        where("status", "==", "aktif"),
        orderBy("createdAt", "desc")
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
        } as Item;
      });
    },
  });

  // Fetch user ratings
  const { data: ratings = [], isLoading: ratingsLoading } = useQuery({
    queryKey: ["user-ratings", userId],
    queryFn: async (): Promise<Rating[]> => {
      if (!userId) return [];
      
      const q = query(
        collection(db, "ratings"),
        where("ratedUserId", "==", userId),
        orderBy("createdAt", "desc")
      );

      const querySnapshot = await getDocs(q);
      const ratingsData: Rating[] = [];
      
      for (const docSnap of querySnapshot.docs) {
        const data = docSnap.data();
        
        // Get rater user name
        const raterDoc = await getDoc(doc(db, "users", data.raterUserId));
        const raterData = raterDoc.data();
        
        ratingsData.push({
          ...data,
          id: docSnap.id,
          createdAt: data.createdAt.toDate(),
          raterName: raterData ? `${raterData.firstName} ${raterData.lastName}` : 'Kullanıcı',
        } as Rating & { raterName: string });
      }

      return ratingsData;
    },
  });

  // Add rating mutation
  const addRatingMutation = useMutation({
    mutationFn: async (ratingData: InsertRating) => {
      const docRef = await addDoc(collection(db, "ratings"), {
        ...ratingData,
        createdAt: new Date(),
      });
      return docRef.id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-ratings", userId] });
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
      setShowRatingForm(false);
      setRating(5);
      toast({
        title: "Değerlendirme Eklendi",
        description: "Kullanıcı değerlendirmeniz başarıyla kaydedildi.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: error.message || "Değerlendirme eklenemedi",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = async () => {
    if (!profile?.id || !userId) {
      toast({
        title: "Hata",
        description: "Giriş yapmalısınız.",
        variant: "destructive",
      });
      return;
    }

    if (profile.id === userId) {
      toast({
        title: "Hata",
        description: "Kendinize mesaj gönderemezsiniz.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("Mesaj gönderilecek:", { from: profile.id, to: userId });
      const conversationId = await createOrGetConversation(profile.id, userId);
      console.log("Conversation ID:", conversationId);
      setLocation(`/messages?conversation=${conversationId}`);
    } catch (error: any) {
      console.error("Mesaj gönderme hatası:", error);
      toast({
        title: "Hata",
        description: error.message || "Sohbet başlatılamadı",
        variant: "destructive",
      });
    }
  };

  const handleSubmitRating = () => {
    if (!profile?.id || !userId) {
      toast({
        title: "Hata",
        description: "Giriş yapmalısınız.",
        variant: "destructive",
      });
      return;
    }

    if (profile.id === userId) {
      toast({
        title: "Hata",
        description: "Kendinizi değerlendiremezsiniz.",
        variant: "destructive",
      });
      return;
    }

    // Check if user already rated this user
    const hasRated = ratings.some(r => r.raterUserId === profile.id);
    if (hasRated) {
      toast({
        title: "Hata",
        description: "Bu kullanıcıyı zaten değerlendirdiniz.",
        variant: "destructive",
      });
      return;
    }


    addRatingMutation.mutate({
      raterUserId: profile.id,
      ratedUserId: userId,
      rating,
    });
  };

  const handleViewItemDetails = (item: Item) => {
    setLocation(`/item/${item.id}`);
  };

  if (userLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Kullanıcı Bulunamadı</h1>
          <p className="text-gray-600 mb-6">Aradığınız kullanıcı mevcut değil.</p>
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

  const isOwnProfile = profile?.id === userId;
  const averageRating = ratings.length > 0 
    ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length 
    : 0;

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Profile Card */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="text-center">
              <Avatar className="w-24 h-24 mx-auto mb-4">
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                  {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-xl">
                {user.firstName} {user.lastName}
              </CardTitle>
              
              {/* Rating Display */}
              <div className="flex items-center justify-center space-x-2 mt-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-5 w-5 ${
                        star <= averageRating
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {averageRating > 0 ? averageRating.toFixed(1) : 'Değerlendirme yok'}
                </span>
                <span className="text-sm text-gray-500">
                  ({ratings.length} değerlendirme)
                </span>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* User Stats */}
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-primary">{itemsLoading ? "..." : userItems.length}</div>
                  <div className="text-sm text-gray-600">Aktif İlan</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-green-600">{user.totalListings || userItems.length}</div>
                  <div className="text-sm text-gray-600">Toplam İlan</div>
                </div>
              </div>

              <Separator />

              {/* User Info */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{user.city || 'Belirtilmemiş'}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>Üye: {new Date(user.createdAt).toLocaleDateString('tr-TR')}</span>
                </div>
              </div>

              {!isOwnProfile && profile && (
                <>
                  <Separator />
                  
                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <Button onClick={handleSendMessage} className="w-full">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Mesaj Gönder
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      onClick={() => setShowRatingForm(!showRatingForm)}
                      className="w-full"
                    >
                      <Star className="h-4 w-4 mr-2" />
                      Değerlendir
                    </Button>
                  </div>

                  {/* Rating Form */}
                  {showRatingForm && (
                    <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Puan</label>
                        <div className="flex space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => setRating(star)}
                              className="focus:outline-none"
                            >
                              <Star
                                className={`h-6 w-6 ${
                                  star <= rating
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      
                      <div className="flex space-x-2">
                        <Button 
                          onClick={handleSubmitRating}
                          disabled={addRatingMutation.isPending}
                          className="flex-1"
                        >
                          {addRatingMutation.isPending ? "Gönderiliyor..." : "Gönder"}
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setShowRatingForm(false)}
                          className="flex-1"
                        >
                          İptal
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* User Items and Ratings */}
        <div className="lg:col-span-2 space-y-8">
          {/* User Items */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Package className="h-6 w-6 mr-2" />
              Aktif İlanları ({userItems.length})
            </h2>
            
            {itemsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg overflow-hidden shadow-sm">
                    <div className="animate-pulse">
                      <div className="w-full h-48 bg-gray-200"></div>
                      <div className="p-4 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : userItems.length > 0 ? (
              <ItemGrid 
                items={userItems} 
                onViewDetails={handleViewItemDetails}
              />
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Henüz aktif ilan yok
                </h3>
                <p className="text-gray-600">
                  Bu kullanıcının şu anda aktif ilanı bulunmuyor.
                </p>
              </div>
            )}
          </div>

          {/* User Ratings */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <ThumbsUp className="h-6 w-6 mr-2" />
              Değerlendirmeler ({ratings.length})
            </h2>
            
            {ratingsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-white p-4 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : ratings.length > 0 ? (
              <div className="space-y-4">
                {ratings.map((rating) => (
                  <Card key={rating.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-4">
                        <Avatar>
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {(rating as any).raterName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-900">
                              {(rating as any).raterName}
                            </h4>
                            <div className="flex items-center space-x-2">
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`h-4 w-4 ${
                                      star <= rating.rating
                                        ? 'text-yellow-400 fill-current'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-500">
                                {new Date(rating.createdAt).toLocaleDateString('tr-TR')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <ThumbsUp className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Henüz değerlendirme yok
                </h3>
                <p className="text-gray-600">
                  Bu kullanıcı henüz değerlendirilmemiş.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}