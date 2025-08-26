import { Item } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, RefreshCw, Trash2, Eye, Calendar } from "lucide-react";
import { CONDITION_LABELS, CATEGORY_LABELS } from "@shared/schema";
import { useState } from "react";

interface ExpiredItemCardProps {
  item: Item;
  onRepublish: (itemId: string) => void;
  onDelete: (itemId: string) => void;
  onViewDetails: (item: Item) => void;
}

export function ExpiredItemCard({ item, onRepublish, onDelete, onViewDetails }: ExpiredItemCardProps) {
  const [isRepublishing, setIsRepublishing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('tr-TR');
  };

  const handleRepublish = async () => {
    setIsRepublishing(true);
    try {
      await onRepublish(item.id);
    } finally {
      setIsRepublishing(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Bu ilanı kalıcı olarak silmek istediğinizden emin misiniz?')) {
      setIsDeleting(true);
      try {
        await onDelete(item.id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-300 relative" data-testid={`card-expired-item-${item.id}`}>
      {/* Expired badge */}
      <div className="absolute top-2 left-2 z-10">
        <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300">
          Süresi Dolmuş
        </Badge>
      </div>
      
      <div className="relative overflow-hidden opacity-75">
        {item.images.length > 0 && (
          <img
            src={item.images[0]}
            alt={item.title}
            className="w-full h-48 object-cover"
            data-testid={`img-expired-item-${item.id}`}
          />
        )}
        <Badge 
          className="absolute top-2 right-2" 
          variant="secondary"
          data-testid={`badge-condition-${item.id}`}
        >
          {CONDITION_LABELS[item.condition]}
        </Badge>
      </div>
      
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 line-clamp-2" data-testid={`title-expired-item-${item.id}`}>
            {item.title}
          </h3>
        </div>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2" data-testid={`description-expired-item-${item.id}`}>
          {item.description}
        </p>
        
        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <div className="flex items-center space-x-1">
            <MapPin className="h-4 w-4" />
            <span data-testid={`location-expired-item-${item.id}`}>{item.location}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            <span data-testid={`expire-date-${item.id}`}>
              {item.expireAt ? formatDate(new Date(item.expireAt)) : formatDate(item.createdAt)}
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-3">
          <Badge variant="outline" data-testid={`category-expired-item-${item.id}`}>
            {CATEGORY_LABELS[item.category as keyof typeof CATEGORY_LABELS] || item.category}
          </Badge>
        </div>
        
        {/* Action buttons */}
        <div className="grid grid-cols-3 gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onViewDetails(item)}
            data-testid={`button-view-${item.id}`}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            onClick={handleRepublish}
            disabled={isRepublishing}
            className="bg-green-600 hover:bg-green-700"
            data-testid={`button-republish-${item.id}`}
          >
            {isRepublishing ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            data-testid={`button-delete-${item.id}`}
          >
            {isDeleting ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}