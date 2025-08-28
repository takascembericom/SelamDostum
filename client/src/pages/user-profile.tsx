import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { doc, getDoc, query, collection, where, getDocs, addDoc, orderBy, updateDoc } from "firebase/firestore";
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
import { Edit, Eye } from "lucide-react";

export default function UserProfile() {
  const { id: userId } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [rating, setRating] = useState(5);
  const queryClient = useQueryClient();
  

  // Function to update user rating statistics
  const updateUserRatingStats = async (userId: string) => {
    try {
      // Get all ratings for this user
      const ratingsQuery = query(
        collection(db, "ratings"),
        where("ratedUserId", "==", userId)
      );
      
      const ratingsSnapshot = await getDocs(ratingsQuery);
      const ratings = ratingsSnapshot.docs.map(doc => doc.data());
      
      const totalRatings = ratings.length;
      const averageRating = totalRatings > 0 
        ? ratings.reduce((sum, rating) => sum + rating.rating, 0) / totalRatings 
        : 0;
      
      // Update user document with new statistics
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        totalRatings,
        averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      });
      
      console.log(`User ${userId} rating stats updated: ${totalRatings} ratings, avg: ${averageRating}`);
    } catch (error) {
      console.error("Error updating user rating stats:", error);
      throw error;
    }
  };

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
      
      // Single field query to avoid composite index requirement
      const q = query(
        collection(db, "items"),
        where("ownerId", "==", userId)
      );

      try {
        const querySnapshot = await getDocs(q);
        
        const items = querySnapshot.docs
          .map(doc => {
            const data = doc.data();
            return {
              ...data,
              id: doc.id,
              createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
              updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
            } as Item;
          })
          .filter(item => item.status === "aktif") // Client-side status filtering
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Client-side sorting
        
        return items;
      } catch (error) {
        console.error("Query error:", error);
        return [];
      }
    },
    enabled: !!userId, // Only run query when userId exists
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
    enabled: !!userId, // Only run query when userId exists
  });

  // Add rating mutation
  const addRatingMutation = useMutation({
    mutationFn: async (ratingData: InsertRating) => {
      // Add rating to ratings collection
      const docRef = await addDoc(collection(db, "ratings"), {
        ...ratingData,
        createdAt: new Date(),
      });

      // Update user statistics
      await updateUserRatingStats(ratingData.ratedUserId);
      
      return docRef.id;
    },
    onSuccess: () => {
      // Invalidate all user-related queries to refresh data for all users
      queryClient.invalidateQueries({ queryKey: ["user-ratings"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      
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
      
      // Conversation oluşturulduktan sonra kısa bir bekleme
      await new Promise(resolve => setTimeout(resolve, 500));
      
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


    console.log("Rating gönderiliyor:", { raterUserId: profile.id, ratedUserId: userId, rating });
    addRatingMutation.mutate({
      raterUserId: profile.id,
      ratedUserId: userId,
      rating,
    });
  };

  const handleViewItemDetails = (item: Item) => {
    setLocation(`/item/${item.id}`);
  };

  const handleEditItem = (item: Item) => {
    setLocation(`/items/${item.id}/edit`);
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
  console.log("Profile Debug:", { 
    currentUserId: profile?.id, 
    profilePageUserId: userId, 
    isOwnProfile,
    userItemsCount: userItems?.length 
  });
  // Use database values instead of client-side calculation
  const averageRating = user.averageRating || 0;
  const totalRatings = user.totalRatings || 0;

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
                  ({totalRatings} değerlendirme)
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
                  <div className="text-2xl font-bold text-green-600">{user.totalListings || 0}</div>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {userItems.map((item) => (
                  <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative">
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        className="w-full h-48 object-cover"
                      />
                      <Badge 
                        variant="secondary" 
                        className="absolute top-2 left-2 bg-white/90"
                      >
                        {CATEGORY_LABELS[item.category as keyof typeof CATEGORY_LABELS]}
                      </Badge>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {item.description}
                      </p>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-gray-500">
                          {CONDITION_LABELS[item.condition]}
                        </span>
                        <span className="text-sm text-gray-500">
                          {item.location}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleViewItemDetails(item)}
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Detay
                        </Button>
                        {isOwnProfile && (
                          <Button
                            onClick={() => handleEditItem(item)}
                            variant="default"
                            size="sm"
                            className="flex-1"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Düzenle
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
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
              Değerlendirmeler ({totalRatings})
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
            ) : totalRatings > 0 ? (
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