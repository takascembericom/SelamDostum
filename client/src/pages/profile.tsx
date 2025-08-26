import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { collection, query, where, orderBy, getDocs, doc, updateDoc } from "firebase/firestore";
import { db, storage } from "@/lib/firebase";
import { Item } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ItemGrid } from "@/components/items/item-grid";
import { User, Package, Star, MapPin, Plus, Camera, Settings, Lock } from "lucide-react";
import { Link, Redirect } from "wouter";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { updatePassword } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function Profile() {
  const { user, profile, loading } = useAuth();
  const [selectedTab, setSelectedTab] = useState<'active-items' | 'expired-items' | 'offers'>('active-items');
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showPhotoDialog, setShowPhotoDialog] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const { data: userItems = [], isLoading: itemsLoading } = useQuery({
    queryKey: ['user-items', user?.uid],
    queryFn: async (): Promise<Item[]> => {
      if (!user?.uid) return [];

      const q = query(
        collection(db, 'items'),
        where('ownerId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as Item;
      });
    },
    enabled: !!user?.uid,
  });

  const handleViewDetails = (item: Item) => {
    console.log("View item details:", item);
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

  const activeItems = userItems.filter(item => item.status === 'aktif');
  const expiredItems = userItems.filter(item => {
    // Check if item is older than 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return item.createdAt < thirtyDaysAgo;
  });
  const tradedItems = userItems.filter(item => item.status === 'takas_edildi');

  const handlePasswordChange = async () => {
    if (!newPassword || newPassword !== confirmPassword) {
      toast({
        title: "Hata",
        description: "Şifreler eşleşmiyor",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Hata", 
        description: "Şifre en az 6 karakter olmalı",
        variant: "destructive",
      });
      return;
    }

    try {
      if (user) {
        await updatePassword(user, newPassword);
        toast({
          title: "Başarılı",
          description: "Şifreniz güncellendi",
        });
        setShowPasswordDialog(false);
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "Şifre güncellenemedi",
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
            <div className="relative w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center overflow-hidden group">
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
              <Dialog open={showPhotoDialog} onOpenChange={setShowPhotoDialog}>
                <DialogTrigger asChild>
                  <button className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera className="h-6 w-6 text-white" />
                  </button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Profil Fotoğrafı Değiştir</DialogTitle>
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
                  <span data-testid="text-user-items-count">{activeItems.length} aktif ilan</span>
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
                    Şifre Değiştir
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Şifre Değiştir</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
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
                      <Label htmlFor="confirmPassword">Şifre Tekrar</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Şifrenizi tekrar girin"
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
                  İlan Ekle
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
                  <p className="text-gray-600">Aktif İlan</p>
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
                  <p className="text-gray-600">Tamamlanan Takas</p>
                </div>
                <Star className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-blue-600" data-testid="stat-rating">4.8</p>
                  <p className="text-gray-600">Ortalama Puan</p>
                </div>
                <Star className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setSelectedTab('active-items')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === 'active-items'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                data-testid="tab-active-items"
              >
                Aktif İlanlarım ({activeItems.length})
              </button>
              <button
                onClick={() => setSelectedTab('expired-items')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === 'expired-items'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                data-testid="tab-expired-items"
              >
                Süresi Dolan İlanlarım ({expiredItems.length})
              </button>
              <button
                onClick={() => setSelectedTab('offers')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === 'offers'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                data-testid="tab-offers"
              >
                Tekliflerim
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {selectedTab === 'active-items' && (
          <div data-testid="content-active-items">
            {itemsLoading ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-600">Aktif ilanlarınız yükleniyor...</p>
              </div>
            ) : activeItems.length > 0 ? (
              <ItemGrid
                items={activeItems}
                onViewDetails={handleViewDetails}
              />
            ) : (
              <div className="text-center py-16">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Package className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">Henüz aktif ilan yok</h3>
                <p className="text-gray-500 mb-4">İlk ilanınızı ekleyin ve takas yapmaya başlayın!</p>
                <Button asChild>
                  <Link href="/add-item">
                    <Plus className="h-4 w-4 mr-2" />
                    İlan Ekle
                  </Link>
                </Button>
              </div>
            )}
          </div>
        )}

        {selectedTab === 'expired-items' && (
          <div data-testid="content-expired-items">
            {itemsLoading ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-600">Süresi dolan ilanlar yükleniyor...</p>
              </div>
            ) : expiredItems.length > 0 ? (
              <ItemGrid
                items={expiredItems}
                onViewDetails={handleViewDetails}
              />
            ) : (
              <div className="text-center py-16">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-gray-400 text-2xl">⏰</span>
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">Süresi dolan ilan yok</h3>
                <p className="text-gray-500">30 günden eski ilanlarınız burada görünür</p>
              </div>
            )}
          </div>
        )}

        {selectedTab === 'offers' && (
          <div className="text-center py-16" data-testid="content-offers">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-gray-400 text-2xl">🤝</span>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Henüz teklif yok</h3>
            <p className="text-gray-500">Diğer kullanıcıların ilanlarına teklif verin!</p>
          </div>
        )}
      </div>
    </div>
  );
}
