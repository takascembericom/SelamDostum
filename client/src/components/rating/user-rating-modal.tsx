import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@shared/schema";

interface UserRatingModalProps {
  open: boolean;
  onClose: () => void;
  targetUser: User;
  tradeOfferId?: string;
  onRatingSubmitted?: () => void;
}

export function UserRatingModal({ 
  open, 
  onClose, 
  targetUser, 
  tradeOfferId,
  onRatingSubmitted 
}: UserRatingModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: "Hata",
        description: "Lütfen bir yıldız puanı seçin",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/user-ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toUserId: targetUser.id,
          rating,
          tradeOfferId,
        }),
      });

      if (!response.ok) {
        throw new Error("Değerlendirme gönderilemedi");
      }

      toast({
        title: "Başarılı",
        description: `${targetUser.firstName} için değerlendirmeniz gönderildi`,
      });

      // Reset form
      setRating(0);
      onRatingSubmitted?.();
      onClose();
    } catch (error) {
      toast({
        title: "Hata",
        description: "Değerlendirme gönderilemedi",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Kullanıcıyı Değerlendir</DialogTitle>
          <DialogDescription>
            {targetUser.firstName} {targetUser.lastName} için değerlendirmenizi paylaşın
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Star Rating */}
          <div className="flex flex-col items-center space-y-2">
            <p className="text-sm font-medium">Puan verin:</p>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="p-1 hover:scale-110 transition-transform"
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                  data-testid={`star-${star}`}
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoveredRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-gray-600">
                {rating === 1 && "Çok Kötü"}
                {rating === 2 && "Kötü"}
                {rating === 3 && "Orta"}
                {rating === 4 && "İyi"}
                {rating === 5 && "Mükemmel"}
              </p>
            )}
          </div>

        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            İptal
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || rating === 0}
            data-testid="button-submit-rating"
          >
            {isSubmitting ? "Gönderiliyor..." : "Değerlendir"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}