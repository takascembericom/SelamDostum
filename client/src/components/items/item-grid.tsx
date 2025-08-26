import { Item } from "@shared/schema";
import { ItemCard } from "./item-card";

interface ItemGridProps {
  items: Item[];
  onViewDetails: (item: Item) => void;
}

export function ItemGrid({ items, onViewDetails }: ItemGridProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-16" data-testid="empty-items">
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <span className="text-gray-400 text-2xl">📦</span>
        </div>
        <h3 className="text-xl font-medium text-gray-900 mb-2">Henüz eşya yok</h3>
        <p className="text-gray-500">İlk eşyanızı ekleyerek başlayın!</p>
      </div>
    );
  }

  return (
    <div 
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      data-testid="grid-items"
    >
      {items.map((item) => (
        <ItemCard
          key={item.id}
          item={item}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
}
