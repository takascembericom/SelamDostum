import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Item } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ItemGrid } from "@/components/items/item-grid";
import { User, Package, Star, MapPin, Plus } from "lucide-react";
import { Link, Redirect } from "wouter";
import { useState } from "react";

export default function Profile() {
  const { user, profile, loading } = useAuth();
  const [selectedTab, setSelectedTab] = useState<'my-items' | 'offers'>('my-items');

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
  const tradedItems = userItems.filter(item => item.status === 'takas_edildi');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="h-12 w-12 text-primary" data-testid="avatar-user" />
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
                  <span data-testid="text-user-items-count">{activeItems.length} aktif eşya</span>
                </div>
                {!user.emailVerified && (
                  <Badge variant="outline" className="text-yellow-600 border-yellow-300">
                    E-posta doğrulanmamış
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button asChild data-testid="button-add-item">
                <Link href="/add-item">
                  <Plus className="h-4 w-4 mr-2" />
                  Eşya Ekle
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
                  <p className="text-gray-600">Aktif Eşya</p>
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
                onClick={() => setSelectedTab('my-items')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === 'my-items'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                data-testid="tab-my-items"
              >
                Eşyalarım ({userItems.length})
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
        {selectedTab === 'my-items' && (
          <div data-testid="content-my-items">
            {itemsLoading ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-600">Eşyalarınız yükleniyor...</p>
              </div>
            ) : (
              <ItemGrid
                items={userItems}
                onViewDetails={handleViewDetails}
              />
            )}
          </div>
        )}

        {selectedTab === 'offers' && (
          <div className="text-center py-16" data-testid="content-offers">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-gray-400 text-2xl">🤝</span>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Henüz teklif yok</h3>
            <p className="text-gray-500">Diğer kullanıcıların eşyalarına teklif verin!</p>
          </div>
        )}
      </div>
    </div>
  );
}
