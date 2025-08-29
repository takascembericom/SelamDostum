import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getSentTradeOffers, getReceivedTradeOffers, deleteTradeOffer, TradeOfferWithItems } from "@/lib/tradeOffers";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, Clock, CheckCircle, XCircle, Package, User, Trash2, Eye } from "lucide-react";
import { CONDITION_LABELS, CATEGORY_LABELS } from "@shared/schema";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface TradeOffersListProps {
  onAccept?: (tradeOfferId: string) => void;
  onReject?: (tradeOfferId: string) => void;
  onCancel?: (tradeOfferId: string) => void;
}

export function TradeOffersList({ onAccept, onReject, onCancel }: TradeOffersListProps) {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState("received");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const navigate = (path: string) => {
    setLocation(path);
  };

  // Delete rejected offer mutation
  const deleteOfferMutation = useMutation({
    mutationFn: deleteTradeOffer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trade-offers"] });
      toast({
        title: "Başarılı",
        description: "Takas teklifi silindi",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Fetch received trade offers
  const { data: receivedOffers = [], isLoading: isLoadingReceived } = useQuery({
    queryKey: ["trade-offers", "received", profile?.id],
    queryFn: () => getReceivedTradeOffers(profile!.id),
    enabled: !!profile?.id
  });

  // Fetch sent trade offers
  const { data: sentOffers = [], isLoading: isLoadingSent } = useQuery({
    queryKey: ["trade-offers", "sent", profile?.id],
    queryFn: () => getSentTradeOffers(profile!.id),
    enabled: !!profile?.id
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "beklemede":
        return <Clock className="h-4 w-4" />;
      case "kabul_edildi":
        return <CheckCircle className="h-4 w-4" />;
      case "reddedildi":
      case "iptal_edildi":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "beklemede":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "kabul_edildi":
        return "bg-green-100 text-green-800 border-green-200";
      case "reddedildi":
      case "iptal_edildi":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "beklemede":
        return "Beklemede";
      case "kabul_edildi":
        return "Kabul Edildi";
      case "reddedildi":
        return "Reddedildi";
      case "iptal_edildi":
        return "İptal Edildi";
      default:
        return status;
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderTradeOfferCard = (offer: TradeOfferWithItems, isReceived: boolean) => (
    <Card key={offer.id} className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Package className="h-5 w-5" />
            Takas Teklifi
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge className={`${getStatusColor(offer.status)} flex items-center gap-1`}>
              {getStatusIcon(offer.status)}
              {getStatusText(offer.status)}
            </Badge>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {formatDate(offer.createdAt)}
          </p>
          <button 
            onClick={() => navigate(`/profile/${isReceived ? offer.fromUserId : offer.toUserId}`)}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            data-testid={`profile-link-${offer.id}`}
          >
            <User className="h-3 w-3" />
            {isReceived ? offer.fromUserName : offer.toUserName}
          </button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          {/* From Item */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">
              {isReceived ? "Teklif Edilen" : "Sizin Eşyanız"}
            </p>
            {offer.fromItem && (
              <div 
                className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => navigate(`/item/${offer.fromItemId}`)}
                data-testid={`from-item-link-${offer.id}`}
              >
                <div className="flex gap-3">
                  <img
                    src={offer.fromItem.images[0]}
                    alt={offer.fromItem.title}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm truncate">{offer.fromItem.title}</h4>
                      <Eye className="h-3 w-3 text-gray-400" />
                    </div>
                    <div className="flex gap-1 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {CONDITION_LABELS[offer.fromItem.condition as keyof typeof CONDITION_LABELS]}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Arrow */}
          <div className="flex justify-center">
            <ArrowRight className="h-6 w-6 text-gray-400" />
          </div>

          {/* To Item */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">
              {isReceived ? "Sizin Eşyanız" : "İstenen Eşya"}
            </p>
            {offer.toItem && (
              <div 
                className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => navigate(`/item/${offer.toItemId}`)}
                data-testid={`to-item-link-${offer.id}`}
              >
                <div className="flex gap-3">
                  <img
                    src={offer.toItem.images[0]}
                    alt={offer.toItem.title}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm truncate">{offer.toItem.title}</h4>
                      <Eye className="h-3 w-3 text-gray-400" />
                    </div>
                    <div className="flex gap-1 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {CONDITION_LABELS[offer.toItem.condition as keyof typeof CONDITION_LABELS]}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Message */}
        {offer.message && (
          <>
            <Separator className="my-4" />
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Mesaj:</p>
              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                {offer.message}
              </p>
            </div>
          </>
        )}

        {/* Actions */}
        {offer.status === "beklemede" && (
          <>
            <Separator className="my-4" />
            <div className="flex gap-2 justify-end">
              {isReceived && onAccept && onReject && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onReject(offer.id)}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reddet
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => onAccept(offer.id)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Kabul Et
                  </Button>
                </>
              )}
              {!isReceived && onCancel && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onCancel(offer.id)}
                  className="text-gray-600 border-gray-200 hover:bg-gray-50"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  İptal Et
                </Button>
              )}
            </div>
          </>
        )}

        {/* Delete button for rejected offers */}
        {(offer.status === "reddedildi" || offer.status === "iptal_edildi") && (
          <>
            <Separator className="my-4" />
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => deleteOfferMutation.mutate(offer.id)}
                disabled={deleteOfferMutation.isPending}
                className="text-red-600 border-red-200 hover:bg-red-50"
                data-testid={`delete-offer-${offer.id}`}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {deleteOfferMutation.isPending ? "Siliniyor..." : "Sil"}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Takas Teklifleri</h2>
        <p className="text-gray-600">
          Gelen ve gönderdiğiniz takas tekliflerini yönetin
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="received" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Gelen Teklifler
            {receivedOffers.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {receivedOffers.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="sent" className="flex items-center gap-2">
            <ArrowRight className="h-4 w-4" />
            Gönderilen Teklifler
            {sentOffers.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {sentOffers.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="received" className="space-y-4">
          {isLoadingReceived ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-32 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : receivedOffers.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Henüz gelen teklif yok</h3>
                <p className="text-gray-600">
                  İlanlarınız için takas teklifleri buraya gelecek
                </p>
              </CardContent>
            </Card>
          ) : (
            receivedOffers.map(offer => renderTradeOfferCard(offer, true))
          )}
        </TabsContent>

        <TabsContent value="sent" className="space-y-4">
          {isLoadingSent ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-32 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : sentOffers.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <ArrowRight className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Henüz teklif göndermediniz</h3>
                <p className="text-gray-600">
                  Beğendiğiniz eşyalar için takas teklifi gönderin
                </p>
              </CardContent>
            </Card>
          ) : (
            sentOffers.map(offer => renderTradeOfferCard(offer, false))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}