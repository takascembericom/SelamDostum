import { Item } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Star } from "lucide-react";
import { CONDITION_LABELS, CATEGORY_LABELS } from "@shared/schema";
import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";

interface ItemCardProps {
  item: Item;
  onViewDetails: (item: Item) => void;
}

export function ItemCard({ item, onViewDetails }: ItemCardProps) {
  const { t } = useLanguage();
  
  const formatDate = (date: Date) => {
    const locale = t.common.language === 'English' ? 'en-US' : 
                  t.common.language === 'العربية' ? 'ar-SA' : 'tr-TR';
    return new Date(date).toLocaleDateString(locale);
  };

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-300" data-testid={`card-item-${item.id}`}>
      <div className="relative overflow-hidden">
        {item.images.length > 0 && (
          <img
            src={item.images[0]}
            alt={item.title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            data-testid={`img-item-${item.id}`}
          />
        )}
        <Badge 
          className="absolute top-2 right-2" 
          variant="secondary"
          data-testid={`badge-condition-${item.id}`}
        >
          {t.conditions[item.condition as keyof typeof t.conditions] || item.condition}
        </Badge>
      </div>
      
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-500 font-mono" data-testid={`item-number-${item.id}`}>
            #{item.itemNumber || '----'}
          </span>
          <Badge variant="outline" data-testid={`category-item-${item.id}`}>
            {t.categories[item.category as keyof typeof t.categories] || item.category}
          </Badge>
        </div>
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 line-clamp-2" data-testid={`title-item-${item.id}`}>
            {item.title}
          </h3>
        </div>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2" data-testid={`description-item-${item.id}`}>
          {item.description}
        </p>
        
        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <div className="flex items-center space-x-1">
            <MapPin className="h-4 w-4" />
            <span data-testid={`location-item-${item.id}`}>{item.location}</span>
          </div>
          {item.rating && (
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span data-testid={`rating-item-${item.id}`}>{item.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gray-300 rounded-full" data-testid={`avatar-item-${item.id}`}></div>
            <Link href={`/user/${item.ownerId}`} className="text-sm text-gray-600 hover:text-primary hover:underline" data-testid={`owner-item-${item.id}`}>
              {item.ownerName}
            </Link>
          </div>
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-gray-500" data-testid={`date-item-${item.id}`}>
            {formatDate(item.createdAt)}
          </span>
          <Button
            size="sm"
            onClick={() => onViewDetails(item)}
            data-testid={`button-details-${item.id}`}
          >
            {t.common.view}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
