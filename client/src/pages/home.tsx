import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

type Item = {
  id: string;
  title: string;
  description: string;
  category: string;
  condition: string;
  location: string;
  images: string[];
  ownerName: string;
  createdAt?: any;
};

export default function Home() {
  const { t } = useLanguage();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/items.json", { cache: "no-store" });
        const data = await res.json();
        setItems(Array.isArray(data) ? data.slice(0,20) : []);
      } catch (e) {
        console.error("items.json okunamadı:", e);
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen">
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">📦 {t.home.recentItems}</h2>
              <p className="text-xl text-gray-600">{t.home.recentItemsCount} {items.length} {t.home.itemsText}</p>
            </div>
          </div>

          {loading ? (
            <div className="text-gray-600">{t.common.loading}...</div>
          ) : items.length === 0 ? (
            <div className="text-center py-16">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-gray-400 text-2xl">📦</span>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">{t.home.noRecentItems}</h3>
              <p className="text-gray-500">{t.items.addItem}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {items.map((it) => (
                <div key={it.id} className="bg-white rounded-lg overflow-hidden shadow-sm group hover:shadow-lg transition-shadow">
                  <div className="relative overflow-hidden">
                    {it.images?.[0] && (
                      <img src={it.images[0]} alt={it.title} className="w-full h-48 object-contain bg-gray-50 group-hover:scale-105 transition-transform duration-300" />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1">{it.title}</h3>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-2">{it.description}</p>
                    <div className="text-xs text-gray-500">{it.location}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
