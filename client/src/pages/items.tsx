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
        // Use backend API to get items with translations
        const params = new URLSearchParams();
        if (searchQuery) params.append('search', searchQuery);
        if (categoryFilter && categoryFilter !== 'all') params.append('category', categoryFilter);
        if (conditionFilter && conditionFilter !== 'all') params.append('condition', conditionFilter);
        
        const url = `/api/items${params.toString() ? `?${params.toString()}` : ''}`;
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('Failed to fetch items');
        }
        
        return await response.json();
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.common.error}</h2>
          <p className="text-gray-600">
            {t.common.language === 'English' ? 'Loading error.' : 
             t.common.language === 'العربية' ? 'خطأ في التحميل.' : 'Yükleme hatası.'}
          </p>
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
                    <SelectItem value="all">{t.categories.all}</SelectItem>
                    <SelectItem value="araba_group">🚗 {t.categories.araba_group}</SelectItem>
                    <SelectItem value="tasinmazlar">🏡 {t.categories.tasinmazlar}</SelectItem>
                    <SelectItem value="elektronik">📱 {t.categories.elektronik}</SelectItem>
                    <SelectItem value="mobilya">🪑 {t.categories.mobilya}</SelectItem>
                    <SelectItem value="giyim">👕 {t.categories.giyim}</SelectItem>
                    <SelectItem value="kitap">📚 {t.categories.kitap}</SelectItem>
                    <SelectItem value="oyuncak">🧸 {t.categories.oyuncak}</SelectItem>
                    <SelectItem value="spor">⚽ {t.categories.spor}</SelectItem>
                    <SelectItem value="beyaz_esya">🏠 {t.categories.beyaz_esya}</SelectItem>
                    <SelectItem value="diger">📦 {t.categories.diger}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Select value={conditionFilter} onValueChange={setConditionFilter}>
                  <SelectTrigger data-testid="select-condition">
                    <SelectValue placeholder={t.items.condition} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.conditions.all}</SelectItem>
                    <SelectItem value="yeni">{t.conditions.yeni}</SelectItem>
                    <SelectItem value="kullanilmis">{t.conditions.kullanilmis}</SelectItem>
                    <SelectItem value="orta">{t.conditions.orta}</SelectItem>
                    <SelectItem value="cok_iyi">{t.conditions.cok_iyi}</SelectItem>
                    <SelectItem value="kusurlu">{t.conditions.kusurlu}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </form>
        </div>

        {/* Results */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-gray-600" data-testid="text-results-count">
            {isLoading ? t.common.loading : 
             `${items.length} ${t.common.language === 'English' ? 'items found' : 
              t.common.language === 'العربية' ? 'عناصر موجودة' : 'ilan bulundu'}`}
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
