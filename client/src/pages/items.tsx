import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { collection, query, orderBy, limit, getDocs, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Item } from "@shared/schema";
import { ItemGrid } from "@/components/items/item-grid";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import { CATEGORY_LABELS, CONDITION_LABELS } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Items() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [conditionFilter, setConditionFilter] = useState<string>("all");
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const { t } = useLanguage();

  // Get URL search params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const search = urlParams.get('search');
    const category = urlParams.get('category');
    
    if (search) {
      setSearchQuery(search);
    }
    
    if (category) {
      // Handle special group categories
      if (category === 'araba_group') {
        // Show both araba and araba_yedek_parca
        setCategoryFilter('araba_group');
      } else if (category === 'tasinmazlar_group') {
        setCategoryFilter('tasinmazlar');
      } else {
        setCategoryFilter(category);
      }
    }
  }, []);

  const { data: items = [], isLoading, error } = useQuery({
    queryKey: ['items', searchQuery, categoryFilter, conditionFilter],
    queryFn: async (): Promise<Item[]> => {
      try {
        let q = query(
          collection(db, 'items'),
          where('status', '==', 'aktif'),
          limit(50)
        );

        if (categoryFilter !== 'all') {
          if (categoryFilter === 'araba_group') {
            // For araba group, get both araba and araba_yedek_parca
            const arabaQuery = query(
              collection(db, 'items'),
              where('status', '==', 'aktif'),
              where('category', '==', 'araba'),
              limit(25)
            );
            
            const yedekParcaQuery = query(
              collection(db, 'items'),
              where('status', '==', 'aktif'),
              where('category', '==', 'araba_yedek_parca'),
              limit(25)
            );
            
            const [arabaSnapshot, yedekParcaSnapshot] = await Promise.all([
              getDocs(arabaQuery),
              getDocs(yedekParcaQuery)
            ]);
            
            const arabaItems = arabaSnapshot.docs.map(doc => {
              const data = doc.data();
              return {
                ...data,
                id: doc.id,
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
                updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
              } as Item;
            });
            
            const yedekParcaItems = yedekParcaSnapshot.docs.map(doc => {
              const data = doc.data();
              return {
                ...data,
                id: doc.id,
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
                updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
              } as Item;
            });
            
            const allArabaItems = [...arabaItems, ...yedekParcaItems].sort((a, b) => 
              b.createdAt.getTime() - a.createdAt.getTime()
            );
            
            // Client-side filtering for search and condition
            let filteredItems = allArabaItems;

            if (searchQuery.trim()) {
              const searchStr = searchQuery.toLowerCase();
              filteredItems = filteredItems.filter(item =>
                item.title.toLowerCase().includes(searchStr) ||
                item.description.toLowerCase().includes(searchStr) ||
                item.category.toLowerCase().includes(searchStr)
              );
            }

            if (conditionFilter !== 'all') {
              filteredItems = filteredItems.filter(item => item.condition === conditionFilter);
            }

            return filteredItems;
          } else {
            q = query(
              collection(db, 'items'),
              where('status', '==', 'aktif'),
              where('category', '==', categoryFilter),
              limit(50)
            );
          }
        }

        const querySnapshot = await getDocs(q);
        const itemsData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            ...data,
            id: doc.id,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
          } as Item;
        }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        // Client-side filtering for search and condition
        let filteredItems = itemsData;

        if (searchQuery.trim()) {
          const searchStr = searchQuery.toLowerCase();
          filteredItems = filteredItems.filter(item =>
            item.title.toLowerCase().includes(searchStr) ||
            item.description.toLowerCase().includes(searchStr) ||
            item.category.toLowerCase().includes(searchStr)
          );
        }

        if (conditionFilter !== 'all') {
          filteredItems = filteredItems.filter(item => item.condition === conditionFilter);
        }

        return filteredItems;
      } catch (error) {
        console.error('Error fetching items:', error);
        return [];
      }
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Query will automatically refetch due to dependency
  };

  const handleViewDetails = (item: Item) => {
    setSelectedItem(item);
    window.location.href = `/item/${item.id}`;
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center" data-testid="error-state">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Hata</h2>
          <p className="text-gray-600">Yükleme hatası.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4" data-testid="title-items">
            {t.nav.items}
          </h1>
          <p className="text-gray-600">
            {t.items.searchItems.replace('...', '')}
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            {/* Search */}
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder={t.items.searchItems}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                  data-testid="input-search-items"
                />
              </div>
              <Button type="submit" data-testid="button-search-items">
                <Search className="h-4 w-4 mr-2" />
                {t.common.search}
              </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger data-testid="select-category">
                    <SelectValue placeholder={t.items.category} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.common.language === 'English' ? 'All' : t.common.language === 'العربية' ? 'الكل' : 'Tümü'}</SelectItem>
                    <SelectItem value="araba_group">🚗 Araba & Yedek Parça</SelectItem>
                    <SelectItem value="tasinmazlar">🏡 Taşınmazlar</SelectItem>
                    {Object.entries(CATEGORY_LABELS).filter(([key]) => 
                      !['araba', 'araba_yedek_parca', 'tasinmazlar'].includes(key)
                    ).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Select value={conditionFilter} onValueChange={setConditionFilter}>
                  <SelectTrigger data-testid="select-condition">
                    <SelectValue placeholder={t.items.condition} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.common.language === 'English' ? 'All Conditions' : t.common.language === 'العربية' ? 'جميع الحالات' : 'Tüm Durumlar'}</SelectItem>
                    {Object.entries(CONDITION_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </form>
        </div>

        {/* Results */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-gray-600" data-testid="text-results-count">
            {isLoading ? 'Yükleniyor...' : `${items.length} ilan bulundu`}
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <Skeleton className="w-full h-48" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Items Grid */}
        {!isLoading && (
          <ItemGrid
            items={items}
            onViewDetails={handleViewDetails}
          />
        )}
      </div>
    </div>
  );
}
