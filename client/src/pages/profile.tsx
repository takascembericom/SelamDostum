import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { collection, query, where, orderBy, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db, storage } from "@/lib/firebase";
import { Item } from "@shared/schema";
import { republishItem, deleteItem } from "@/lib/itemUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ItemGrid } from "@/components/items/item-grid";
import { TradeOffersList } from "@/components/trade/trade-offers-list";
import { updateTradeOfferStatus, completeTrade } from "@/lib/tradeOffers";
import { User, Package, Star, MapPin, Plus, Camera, Settings, Lock, ArrowRightLeft, MessageCircle, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { ExpiredItemCard } from "@/components/items/expired-item-card";
import { Link, Redirect, useLocation } from "wouter";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { ConversationsList } from "@/components/user-chat/conversations-list";
import { UserChat } from "@/components/user-chat/user-chat";
import { Conversation } from "@shared/schema";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Profile() {
  const { user, profile, loading } = useAuth();
  const { t } = useLanguage();
  const [selectedTab, setSelectedTab] = useState<'pending-items' | 'active-items' | 'rejected-items' | 'expired-items' | 'trade-offers' | 'messages'>('pending-items');
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showPhotoDialog, setShowPhotoDialog] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [uploading, setUploading] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<
    (Conversation & { otherUserName: string; otherUserId: string }) | null
  >(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  // Trade offer action handlers - move before any conditional returns
  const handleAcceptOffer = useMutation({
    mutationFn: async (tradeOfferId: string) => {
      await completeTrade(tradeOfferId);
    },
    onSuccess: () => {
      toast({
        title: "Takas Kabul Edildi!",
        description: "Takas tamamlandı. İlanlarınız 'takas edildi' olarak işaretlendi.",
      });
      queryClient.invalidateQueries({ queryKey: ["trade-offers"] });
      queryClient.invalidateQueries({ queryKey: ["user-items"] });
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: error.message || "Takas kabul edilemedi",
        variant: "destructive",
      });
    },
  }).mutateAsync;

  const handleRejectOffer = useMutation({
    mutationFn: async (tradeOfferId: string) => {
      await updateTradeOfferStatus(tradeOfferId, "reddedildi");
    },
    onSuccess: () => {
      toast({
        title: "Teklif Reddedildi",
        description: "Takas teklifi reddedildi.",
      });
      queryClient.invalidateQueries({ queryKey: ["trade-offers"] });
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: error.message || "Teklif reddedilemedi",
        variant: "destructive",
      });
    },
  }).mutateAsync;

  const handleCancelOffer = useMutation({
    mutationFn: async (tradeOfferId: string) => {
      await updateTradeOfferStatus(tradeOfferId, "iptal_edildi");
    },
    onSuccess: () => {
      toast({
        title: "Teklif İptal Edildi",
        description: "Takas teklifiniz iptal edildi.",
      });
      queryClient.invalidateQueries({ queryKey: ["trade-offers"] });
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: error.message || "Teklif iptal edilemedi",
        variant: "destructive",
      });
    },
  }).mutateAsync;

  const { data: userItems = [], isLoading: itemsLoading } = useQuery({
    queryKey: ['user-items', user?.uid],
    queryFn: async (): Promise<Item[]> => {
      if (!user?.uid) return [];

      try {
        const q = query(
          collection(db, 'items'),
          where('ownerId', '==', user.uid)
          // Remove orderBy to avoid index issues
        );

        const querySnapshot = await getDocs(q);
        const items = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            ...data,
            id: doc.id,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
            expireAt: data.expireAt?.toDate ? data.expireAt.toDate() : (data.expireAt ? new Date(data.expireAt) : null),
          } as Item;
        });

        console.log('Fetched user items:', items.length, 'for user:', user?.uid);
        console.log('Items:', items.map(item => ({ id: item.id, status: item.status, title: item.title })));

        // Sort by createdAt manually
        return items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      } catch (error) {
        console.error('Error fetching user items:', error);
        throw error;
      }
    },
    enabled: !!user?.uid,
  });

  const handleViewDetails = (item: Item) => {
    console.log("View item details:", item);
  };

  const handleRepublishItem = async (itemId: string) => {
    try {
      await republishItem(itemId);
      
      // Refresh user items
      await queryClient.invalidateQueries({ queryKey: ['user-items'] });
      
      toast({
        title: "İlan Yeniden Yayına Alındı",
        description: "İlanınız admin onayından sonra tekrar yayınlanacak",
      });
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "İlan yeniden yayına alınamadı",
        variant: "destructive",
      });
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      await deleteItem(itemId);
      
      // Refresh user items
      await queryClient.invalidateQueries({ queryKey: ['user-items'] });
      
      toast({
        title: "İlan Silindi",
        description: "İlanınız kalıcı olarak silindi",
      });
    } catch (error: any) {
      toast({
        title: "Hata", 
        description: error.message || "İlan silinemedi",
        variant: "destructive",
      });
    }
  };

  // Bulk delete function for user items
  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) {
      toast({
        title: "Uyarı",
        description: "Lütfen silinecek ilanları seçin",
        variant: "destructive",
      });
      return;
    }

    setBulkActionLoading(true);
    try {
      // Delete all selected items
      const deletePromises = Array.from(selectedItems).map(itemId => 
        deleteDoc(doc(db, 'items', itemId))
      );
      
      await Promise.all(deletePromises);

      toast({
        title: "Başarılı",
        description: `${selectedItems.size} ilan başarıyla silindi`,
      });

      // Clear selection and refresh data
      setSelectedItems(new Set());
      queryClient.invalidateQueries({ queryKey: ['user-items'] });
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "İlanlar silinirken hata oluştu",
        variant: "destructive",
      });
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Handle single item selection
  const handleItemSelection = (itemId: string, checked: boolean) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(itemId);
      } else {
        newSet.delete(itemId);
      }
      return newSet;
    });
  };

  // Handle select all/none for current tab
  const handleSelectAll = (items: Item[], checked: boolean) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      items.forEach(item => {
        if (checked) {
          newSet.add(item.id);
        } else {
          newSet.delete(item.id);
        }
      });
      return newSet;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center" data-testid="loading-profile">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Profil yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/" />;
  }

  const pendingItems = userItems.filter(item => item.status === 'pending');
  const activeItems = userItems.filter(item => item.status === 'aktif');
  const rejectedItems = userItems.filter(item => item.status === 'reddedildi');
  const expiredItems = userItems.filter(item => {
    // Check if item has expired or has status süresi_biten
    if (item.status === 'süresi_biten') return true;
    
    // Check if expireAt date has passed (for items with expireAt field)
    if (item.expireAt) {
      return new Date() > new Date(item.expireAt);
    }
    
    // Fallback: Check if item is older than 30 days (for older items without expireAt)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return item.createdAt < thirtyDaysAgo;
  });
  const tradedItems = userItems.filter(item => item.status === 'takas_edildi');

  const handlePasswordChange = async () => {
    if (!currentPassword) {
      toast({
        title: "Hata",
        description: "Mevcut şifrenizi girin",
        variant: "destructive",
      });
      return;
    }

    if (!newPassword || newPassword !== confirmPassword) {
      toast({
        title: "Hata",
        description: "Yeni şifreler eşleşmiyor",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Hata", 
        description: "Yeni şifre en az 6 karakter olmalı",
        variant: "destructive",
      });
      return;
    }

    try {
      if (user && user.email) {
        // First verify current password
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, credential);
        
        // If verification successful, update password
        await updatePassword(user, newPassword);
        
        toast({
          title: "Başarılı",
          description: "Şifreniz güncellendi",
        });
        
        setShowPasswordDialog(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (error: any) {
      let errorMessage = "Şifre güncellenemedi";
      
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        errorMessage = "Mevcut şifreniz yanlış";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "Yeni şifre çok zayıf";
      }
      
      toast({
        title: "Hata",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const storageRef = ref(storage, `avatars/${user.uid}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      // Update user profile in Firestore
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        avatar: downloadURL
      });
      
      toast({
        title: "Başarılı",
        description: "Profil fotoğrafınız güncellendi",
      });
      
      setShowPhotoDialog(false);
      // Force profile refresh
      window.location.reload();
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "Fotoğraf yüklenemedi",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="flex flex-col items-center gap-3">
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center overflow-hidden">
                {profile?.avatar ? (
                  <img 
                    src={profile.avatar} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                    data-testid="img-user-avatar"
                  />
                ) : (
                  <User className="h-12 w-12 text-primary" data-testid="avatar-user" />
                )}
              </div>
              
              <Dialog open={showPhotoDialog} onOpenChange={setShowPhotoDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" data-testid="button-change-photo">
                    <Camera className="h-4 w-4 mr-2" />
                    {t.profile.changePhoto}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t.profile.changePhoto}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="photo">Yeni Fotoğraf Seçin</Label>
                      <Input
                        id="photo"
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        data-testid="input-photo-upload"
                      />
                    </div>
                    {uploading && (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        <span>Yükleniyor...</span>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2" data-testid="text-user-name">
                {profile?.firstName} {profile?.lastName}
              </h1>
              <p className="text-gray-600 mb-2" data-testid="text-user-username">@{profile?.username}</p>
              <p className="text-gray-600 mb-4" data-testid="text-user-email">{user.email}</p>
              
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span data-testid="text-user-location">Türkiye</span>
                </div>
                <div className="flex items-center gap-1">
                  <Package className="h-4 w-4" />
                  <span data-testid="text-user-items-count">{activeItems.length} {t.profile.activeItem}</span>
                </div>
                {!user.emailVerified && (
                  <Badge variant="outline" className="text-yellow-600 border-yellow-300">
                    E-posta doğrulanmamış
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex gap-2">
              <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" data-testid="button-change-password">
                    <Lock className="h-4 w-4 mr-2" />
                    {t.profile.changePassword}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t.profile.changePassword}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="currentPassword">Mevcut Şifre</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Mevcut şifrenizi girin"
                        data-testid="input-current-password"
                      />
                    </div>
                    <div>
                      <Label htmlFor="newPassword">Yeni Şifre</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Yeni şifrenizi girin"
                        data-testid="input-new-password"
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">Yeni Şifre Tekrar</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Yeni şifrenizi tekrar girin"
                        data-testid="input-confirm-password"
                      />
                    </div>
                    <Button 
                      onClick={handlePasswordChange}
                      className="w-full"
                      data-testid="button-save-password"
                    >
                      Şifreyi Güncelle
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Button asChild data-testid="button-add-item">
                <Link href="/add-item">
                  <Plus className="h-4 w-4 mr-2" />
                  {t.nav.addItem}
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-primary" data-testid="stat-active-items">
                    {activeItems.length}
                  </p>
                  <p className="text-gray-600">{t.profile.activeItem}</p>
                </div>
                <Package className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-green-600" data-testid="stat-completed-trades">
                    {tradedItems.length}
                  </p>
                  <p className="text-gray-600">{t.profile.completedTrade}</p>
                </div>
                <Star className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-blue-600" data-testid="stat-rating">
                    {profile?.averageRating?.toFixed(1) || "0.0"}
                  </p>
                  <p className="text-gray-600">
                    {t.profile.averageRating} ({profile?.totalRatings || 0} {t.profile.evaluation})
                  </p>
                </div>
                <Star className="h-8 w-8 text-yellow-500 fill-current" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px grid grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-8">
              <button
                onClick={() => setSelectedTab('pending-items')}
                className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm text-center ${
                  selectedTab === 'pending-items'
                    ? 'border-orange-500 text-orange-500'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                data-testid="tab-pending-items"
              >
                {t.profile.pendingItems} ({pendingItems.length})
              </button>
              <button
                onClick={() => setSelectedTab('active-items')}
                className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm text-center ${
                  selectedTab === 'active-items'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                data-testid="tab-active-items"
              >
                {t.profile.activeItems} ({activeItems.length})
              </button>
              <button
                onClick={() => setSelectedTab('trade-offers')}
                className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm text-center ${
                  selectedTab === 'trade-offers'
                    ? 'border-green-500 text-green-500'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                data-testid="tab-trade-offers"
              >
                <ArrowRightLeft className="h-4 w-4 inline mr-1" />
                {t.profile.tradeOffers}
              </button>
              <button
                onClick={() => setSelectedTab('messages')}
                className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm text-center ${
                  selectedTab === 'messages'
                    ? 'border-blue-500 text-blue-500'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                data-testid="tab-messages"
              >
                <MessageCircle className="h-4 w-4 inline mr-1" />
                {t.profile.messages}
              </button>
              <button
                onClick={() => setSelectedTab('rejected-items')}
                className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm text-center ${
                  selectedTab === 'rejected-items'
                    ? 'border-red-500 text-red-500'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                data-testid="tab-rejected-items"
              >
                {t.profile.rejectedItems} ({rejectedItems.length})
              </button>
              <button
                onClick={() => setSelectedTab('expired-items')}
                className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm text-center ${
                  selectedTab === 'expired-items'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                data-testid="tab-expired-items"
              >
                {t.profile.expiredItems} ({expiredItems.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {selectedTab === 'pending-items' && (
          <div data-testid="content-pending-items">
            {itemsLoading ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-600">{t.profile.loadingPendingItems}</p>
              </div>
            ) : pendingItems.length > 0 ? (
              <div className="space-y-4">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <span className="text-orange-600 text-sm">⏳</span>
                    <span className="text-orange-800 font-medium">{t.profile.pendingInfo}</span>
                  </div>
                  <p className="text-orange-700 text-sm mt-1">
                    {t.profile.pendingInfoDesc}
                  </p>
                </div>
                
                {/* Bulk actions for pending items */}
                <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-4">
                    <Checkbox
                      checked={pendingItems.every(item => selectedItems.has(item.id))}
                      onCheckedChange={(checked) => handleSelectAll(pendingItems, checked as boolean)}
                      data-testid="checkbox-select-all-pending"
                    />
                    <span className="text-sm text-gray-600">
                      {selectedItems.size > 0 
                        ? `${selectedItems.size} ${t.profile.itemsSelected}` 
                        : t.profile.selectAll}
                    </span>
                  </div>
                  {selectedItems.size > 0 && (
                    <Button
                      onClick={handleBulkDelete}
                      disabled={bulkActionLoading}
                      variant="destructive"
                      size="sm"
                      data-testid="button-bulk-delete-pending"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {bulkActionLoading ? t.profile.deleting : t.profile.deleteSelected}
                    </Button>
                  )}
                </div>
                
                <div className="space-y-4">
                  {pendingItems.map(item => (
                    <Card key={item.id} className="mb-4">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div className="mr-3 mt-1">
                            <Checkbox
                              checked={selectedItems.has(item.id)}
                              onCheckedChange={(checked) => handleItemSelection(item.id, checked as boolean)}
                              data-testid={`checkbox-item-${item.id}`}
                            />
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-lg">{item.title}</CardTitle>
                            <p className="text-gray-600 mt-2">{item.description}</p>
                            <div className="flex gap-2 mt-2">
                              <Badge variant="outline">{item.category}</Badge>
                              <Badge variant="outline">{item.condition}</Badge>
                              <Badge variant="secondary">Onay Bekliyor</Badge>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="mx-auto w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-orange-400 text-2xl">⏳</span>
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">Bekleyen ilan yok</h3>
                <p className="text-gray-500 mb-4">Yeni eklediğiniz ilanlar admin onayından sonra burada görünür</p>
                <Button asChild>
                  <Link href="/add-item">
                    <Plus className="h-4 w-4 mr-2" />
                    {t.nav.addItem}
                  </Link>
                </Button>
              </div>
            )}
          </div>
        )}

        {selectedTab === 'active-items' && (
          <div data-testid="content-active-items">
            {itemsLoading ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-600">Aktif ilanlarınız yükleniyor...</p>
              </div>
            ) : activeItems.length > 0 ? (
              <div className="space-y-4">
                {/* Bulk actions for active items */}
                <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-4">
                    <Checkbox
                      checked={activeItems.every(item => selectedItems.has(item.id))}
                      onCheckedChange={(checked) => handleSelectAll(activeItems, checked as boolean)}
                      data-testid="checkbox-select-all-active"
                    />
                    <span className="text-sm text-gray-600">
                      {selectedItems.size > 0 
                        ? `${selectedItems.size} ${t.profile.itemsSelected}` 
                        : t.profile.selectAll}
                    </span>
                  </div>
                  {selectedItems.size > 0 && (
                    <Button
                      onClick={handleBulkDelete}
                      disabled={bulkActionLoading}
                      variant="destructive"
                      size="sm"
                      data-testid="button-bulk-delete-active"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {bulkActionLoading ? t.profile.deleting : t.profile.deleteSelected}
                    </Button>
                  )}
                </div>
                
                <div className="space-y-4">
                  {activeItems.map(item => (
                    <Card key={item.id} className="mb-4">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div className="mr-3 mt-1">
                            <Checkbox
                              checked={selectedItems.has(item.id)}
                              onCheckedChange={(checked) => handleItemSelection(item.id, checked as boolean)}
                              data-testid={`checkbox-item-${item.id}`}
                            />
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-lg">{item.title}</CardTitle>
                            <p className="text-gray-600 mt-2">{item.description}</p>
                            <div className="flex gap-2 mt-2">
                              <Badge variant="outline">{item.category}</Badge>
                              <Badge variant="outline">{item.condition}</Badge>
                              <Badge variant="default">{t.profile.statusActive}</Badge>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button
                              onClick={() => setLocation(`/items/${item.id}/edit`)}
                              size="sm"
                              variant="default"
                              data-testid={`button-edit-${item.id}`}
                            >
                              ✏️ {t.profile.edit}
                            </Button>
                            <Button
                              onClick={() => setLocation(`/item/${item.id}`)}
                              size="sm"
                              variant="outline"
                            >
                              👁️ {t.profile.view}
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Package className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">{t.profile.noActiveItems}</h3>
                <p className="text-gray-500 mb-4">{t.profile.noActiveItemsDesc}</p>
                <Button asChild>
                  <Link href="/add-item">
                    <Plus className="h-4 w-4 mr-2" />
                    {t.nav.addItem}
                  </Link>
                </Button>
              </div>
            )}
          </div>
        )}

        {selectedTab === 'rejected-items' && (
          <div data-testid="content-rejected-items">
            {itemsLoading ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-600">{t.profile.loadingRejectedItems}</p>
              </div>
            ) : rejectedItems.length > 0 ? (
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <span className="text-red-600 text-sm">❌</span>
                    <span className="text-red-800 font-medium">{t.profile.rejectedInfo}</span>
                  </div>
                  <p className="text-red-700 text-sm mt-1">
                    {t.profile.rejectedInfoDesc}
                  </p>
                </div>
                
                {/* Bulk actions for rejected items */}
                <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-4">
                    <Checkbox
                      checked={rejectedItems.every(item => selectedItems.has(item.id))}
                      onCheckedChange={(checked) => handleSelectAll(rejectedItems, checked as boolean)}
                      data-testid="checkbox-select-all-rejected"
                    />
                    <span className="text-sm text-gray-600">
                      {selectedItems.size > 0 
                        ? `${selectedItems.size} ${t.profile.itemsSelected}` 
                        : t.profile.selectAll}
                    </span>
                  </div>
                  {selectedItems.size > 0 && (
                    <Button
                      onClick={handleBulkDelete}
                      disabled={bulkActionLoading}
                      variant="destructive"
                      size="sm"
                      data-testid="button-bulk-delete-rejected"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {bulkActionLoading ? t.profile.deleting : t.profile.deleteSelected}
                    </Button>
                  )}
                </div>
                
                <div className="space-y-4">
                  {rejectedItems.map(item => (
                    <Card key={item.id} className="mb-4">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div className="mr-3 mt-1">
                            <Checkbox
                              checked={selectedItems.has(item.id)}
                              onCheckedChange={(checked) => handleItemSelection(item.id, checked as boolean)}
                              data-testid={`checkbox-item-${item.id}`}
                            />
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-lg">{item.title}</CardTitle>
                            <p className="text-gray-600 mt-2">{item.description}</p>
                            <div className="flex gap-2 mt-2">
                              <Badge variant="outline">{item.category}</Badge>
                              <Badge variant="outline">{item.condition}</Badge>
                              <Badge variant="destructive">{t.profile.statusRejected}</Badge>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => setLocation(`/items/${item.id}/edit`)}
                              size="sm"
                              variant="default"
                              data-testid={`button-edit-${item.id}`}
                            >
                              ✏️ {t.profile.edit}
                            </Button>
                            <Button
                              onClick={() => setLocation(`/item/${item.id}`)}
                              size="sm"
                              variant="outline"
                            >
                              👁️ {t.profile.view}
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-red-400 text-2xl">❌</span>
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">{t.profile.noRejectedItems}</h3>
                <p className="text-gray-500 mb-4">{t.profile.noRejectedItemsDesc}</p>
              </div>
            )}
          </div>
        )}

        {selectedTab === 'expired-items' && (
          <div data-testid="content-expired-items">
            {itemsLoading ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-600">{t.profile.loadingExpiredItems}</p>
              </div>
            ) : expiredItems.length > 0 ? (
              <div className="space-y-4">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <span className="text-orange-600 text-sm">⏰</span>
                    <span className="text-orange-800 font-medium">{t.profile.expiredInfo}</span>
                  </div>
                  <p className="text-orange-700 text-sm mt-1">
                    {t.profile.expiredInfoDesc}
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {expiredItems.map((item) => (
                    <ExpiredItemCard
                      key={item.id}
                      item={item}
                      onRepublish={handleRepublishItem}
                      onDelete={handleDeleteItem}
                      onViewDetails={handleViewDetails}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-gray-400 text-2xl">⏰</span>
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">{t.profile.noExpiredItems}</h3>
                <p className="text-gray-500">{t.profile.noExpiredItemsDesc}</p>
              </div>
            )}
          </div>
        )}

        {selectedTab === 'trade-offers' && (
          <div data-testid="content-trade-offers">
            <TradeOffersList
              onAccept={handleAcceptOffer}
              onReject={handleRejectOffer}
              onCancel={handleCancelOffer}
            />
          </div>
        )}

        {selectedTab === 'messages' && (
          <div data-testid="content-messages">
            <Card className="h-[600px] overflow-hidden">
              <div className="flex h-full">
                {/* Conversations List */}
                <div className="w-1/3 border-r">
                  <ConversationsList
                    onSelectConversation={setSelectedConversation}
                    selectedConversationId={selectedConversation?.id}
                  />
                </div>

                {/* Chat View */}
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
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
