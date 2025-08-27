import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Item, InsertTradeOffer } from "@shared/schema";
import { createTradeOffer } from "@/lib/tradeOffers";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CONDITION_LABELS, CATEGORY_LABELS } from "@shared/schema";
import { Loader2, Package, X } from "lucide-react";

interface TradeOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetItem: Item;
}

export function TradeOfferModal({ isOpen, onClose, targetItem }: TradeOfferModalProps) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedItemId, setSelectedItemId] = useState<string>("");
  const [message, setMessage] = useState("");

  // Fetch user's active items
  const { data: userItems = [], isLoading: isLoadingItems } = useQuery({
    queryKey: ["user-items", profile?.id],
    queryFn: async (): Promise<Item[]> => {
      if (!profile?.id) return [];

      const q = query(
        collection(db, "items"),
        where("ownerId", "==", profile.id),
        where("status", "==", "aktif")
      );

      const querySnapshot = await getDocs(q);
      const items = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as Item;
      });

      // Sort by createdAt in memory instead of database
      return items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    },
    enabled: isOpen && !!profile?.id
  });

  // Create trade offer mutation
  const createTradeOfferMutation = useMutation({
    mutationFn: createTradeOffer,
    onSuccess: () => {
      toast({
        title: "Takas Teklifi Gönderildi!",
        description: "Teklifiniz ilan sahibine iletildi. Profil sayfanızdan durumunu takip edebilirsiniz.",
      });
      queryClient.invalidateQueries({ queryKey: ["trade-offers"] });
      onClose();
      setSelectedItemId("");
      setMessage("");
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: error.message || "Takas teklifi gönderilemedi",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async () => {
    if (!selectedItemId || !profile?.id) return;

    const selectedItem = userItems.find(item => item.id === selectedItemId);
    if (!selectedItem) return;

    const tradeOfferData: InsertTradeOffer = {
      fromUserId: profile.id,
      toUserId: targetItem.ownerId,
      fromItemId: selectedItemId,
      toItemId: targetItem.id,
      message: message.trim() || undefined,
      status: "beklemede",
    };

    createTradeOfferMutation.mutate(tradeOfferData);
  };

  const selectedItem = userItems.find(item => item.id === selectedItemId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Takas Teklifi Ver
          </DialogTitle>
          <DialogDescription>
            <strong>{targetItem.title}</strong> için hangi eşyanızı takas etmek istiyorsunuz?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Target Item Display */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex gap-4">
                <img
                  src={targetItem.images[0]}
                  alt={targetItem.title}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-900">{targetItem.title}</h3>
                  <p className="text-sm text-blue-700 mb-2">Takas edilecek eşya</p>
                  <div className="flex gap-2">
                    <Badge variant="outline">{CATEGORY_LABELS[targetItem.category as keyof typeof CATEGORY_LABELS]}</Badge>
                    <Badge variant="outline">{CONDITION_LABELS[targetItem.condition]}</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User's Items Selection */}
          <div>
            <Label className="text-base font-semibold mb-4 block">
              Takas için sunacağınız eşya:
            </Label>
            
            {isLoadingItems ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Eşyalarınız yükleniyor...</span>
              </div>
            ) : userItems.length === 0 ? (
              <Card className="bg-yellow-50 border-yellow-200">
                <CardContent className="p-6 text-center">
                  <Package className="h-12 w-12 mx-auto text-yellow-600 mb-4" />
                  <h3 className="font-semibold text-yellow-800 mb-2">Henüz aktif ilanınız yok</h3>
                  <p className="text-yellow-700 mb-4">
                    Takas yapmak için önce bir ilan vermeniz gerekiyor.
                  </p>
                  <Button
                    onClick={() => window.location.href = "/add-item"}
                    variant="outline"
                    className="border-yellow-300 text-yellow-800 hover:bg-yellow-100"
                  >
                    İlan Ver
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <RadioGroup value={selectedItemId} onValueChange={setSelectedItemId}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userItems.map((item) => (
                    <div key={item.id} className="relative">
                      <RadioGroupItem
                        value={item.id}
                        id={item.id}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={item.id}
                        className="cursor-pointer block"
                      >
                        <Card className="transition-all duration-200 peer-checked:ring-2 peer-checked:ring-blue-500 peer-checked:border-blue-500 hover:shadow-md">
                          <CardContent className="p-4">
                            <div className="flex gap-3">
                              <img
                                src={item.images[0]}
                                alt={item.title}
                                className="w-16 h-16 object-cover rounded-lg"
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm truncate">{item.title}</h4>
                                <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                                  {item.description}
                                </p>
                                <div className="flex gap-1 mt-2">
                                  <Badge variant="outline" className="text-xs">
                                    {CONDITION_LABELS[item.condition]}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            )}
          </div>

          {/* Message */}
          {selectedItem && (
            <div className="space-y-3">
              <Label htmlFor="message" className="text-base font-semibold">
                Mesaj (İsteğe bağlı)
              </Label>
              <Textarea
                id="message"
                placeholder="Takas teklifiniz hakkında bir mesaj yazabilirsiniz..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-[100px]"
                maxLength={500}
              />
              <p className="text-xs text-gray-500">
                {message.length}/500 karakter
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={createTradeOfferMutation.isPending}
          >
            <X className="h-4 w-4 mr-2" />
            İptal
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedItemId || createTradeOfferMutation.isPending || userItems.length === 0}
            className="min-w-[120px]"
          >
            {createTradeOfferMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Gönderiliyor...
              </>
            ) : (
              "Teklif Gönder"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}