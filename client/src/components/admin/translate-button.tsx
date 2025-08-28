import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Languages, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface TranslateButtonProps {
  itemId?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "default" | "lg";
  className?: string;
}

export function TranslateButton({ 
  itemId, 
  variant = "outline", 
  size = "sm",
  className = ""
}: TranslateButtonProps) {
  const [isTranslating, setIsTranslating] = useState(false);
  const { toast } = useToast();

  const handleTranslate = async () => {
    if (!itemId) {
      // Tüm ilanları çevir
      setIsTranslating(true);
      try {
        const response = await apiRequest("POST", "/api/translate-all-items");
        const data = await response.json();
        
        toast({
          title: "Çeviri Tamamlandı!",
          description: `${data.translated} ilan başarıyla çevrildi.`,
        });
      } catch (error: any) {
        toast({
          title: "Çeviri Hatası",
          description: error.message || "Çeviri işlemi başarısız oldu",
          variant: "destructive",
        });
      } finally {
        setIsTranslating(false);
      }
    } else {
      // Tek ilan çevir
      setIsTranslating(true);
      try {
        const response = await apiRequest("POST", `/api/translate-item/${itemId}`);
        const data = await response.json();
        
        toast({
          title: "Çeviri Tamamlandı!",
          description: data.message,
        });
        
        // Sayfayı yenile
        window.location.reload();
      } catch (error: any) {
        toast({
          title: "Çeviri Hatası", 
          description: error.message || "Çeviri işlemi başarısız oldu",
          variant: "destructive",
        });
      } finally {
        setIsTranslating(false);
      }
    }
  };

  return (
    <Button 
      onClick={handleTranslate}
      disabled={isTranslating}
      variant={variant}
      size={size}
      className={className}
      data-testid="button-translate"
    >
      {isTranslating ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Languages className="h-4 w-4 mr-2" />
      )}
      {isTranslating ? "Çevriliyor..." : 
       itemId ? "Bu İlanı Çevir" : "Tüm İlanları Çevir"}
    </Button>
  );
}