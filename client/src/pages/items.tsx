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

export default function Items() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [conditionFilter, setConditionFilter] = useState<string>("all");
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  // Get URL search params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const search = urlParams.get('search');
    if (search) {
      setSearchQuery(search);
    }
  }, []);

  const { data: items = [], isLoading, error } = useQuery({
    queryKey: ['items', searchQuery, categoryFilter, conditionFilter],
    queryFn: async (): Promise<Item[]> => {
      let q = query(
        collection(db, 'items'),
        where('status', '==', 'aktif'),
        orderBy('createdAt', 'desc'),
        limit(50)
      );

      if (categoryFilter !== 'all') {
        q = query(
          collection(db, 'items'),
          where('status', '==', 'aktif'),
          where('category', '==', categoryFilter),
          orderBy('createdAt', 'desc'),
          limit(50)
        );
      }

      const querySnapshot = await getDocs(q);
      const itemsData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as Item;
      });

      // Client-side filtering for search and condition
      let filteredItems = itemsData;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filteredItems = filteredItems.filter(item =>
          item.title.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query)
        );
      }

      if (conditionFilter !== 'all') {
        filteredItems = filteredItems.filter(item => item.condition === conditionFilter);
      }

      return filteredItems;
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Query will automatically refetch due to dependency
  };

  const handleViewDetails = (item: Item) => {
    setSelectedItem(item);
    // In a real app, this would navigate to item detail page
    console.log("View item details:", item);
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
            Eşyalar
          </h1>
          <p className="text-gray-600">
            Eşya bulun ve takas edin
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
                  placeholder="Eşya ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                  data-testid="input-search-items"
                />
              </div>
              <Button type="submit" data-testid="button-search-items">
                <Search className="h-4 w-4 mr-2" />
                Ara
              </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger data-testid="select-category">
                    <SelectValue placeholder="Kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tümü</SelectItem>
                    {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Select value={conditionFilter} onValueChange={setConditionFilter}>
                  <SelectTrigger data-testid="select-condition">
                    <SelectValue placeholder="Durum seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Durumlar</SelectItem>
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
