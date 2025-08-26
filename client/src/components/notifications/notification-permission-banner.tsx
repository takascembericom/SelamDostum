import { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { requestNotificationPermission, hasNotificationPermission } from "@/lib/notifications";
import { useToast } from "@/hooks/use-toast";

export function NotificationPermissionBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if notifications are supported and permission is not already granted
    const checkPermission = () => {
      if ('Notification' in window && !hasNotificationPermission() && Notification.permission === 'default') {
        // Don't show immediately, wait a bit for user to settle in
        const timer = setTimeout(() => {
          setShowBanner(true);
        }, 3000);
        return () => clearTimeout(timer);
      }
    };

    checkPermission();
  }, []);

  const handleRequestPermission = async () => {
    setIsRequesting(true);
    
    try {
      const permission = await requestNotificationPermission();
      
      if (permission === 'granted') {
        toast({
          title: "Bildirimler Aktif!",
          description: "Takas teklifleri için bildirim alacaksınız",
        });
        setShowBanner(false);
      } else if (permission === 'denied') {
        toast({
          title: "Bildirim İzni Reddedildi",
          description: "Tarayıcı ayarlarından izni açabilirsiniz",
          variant: "destructive",
        });
        setShowBanner(false);
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "Bildirim izni istenirken hata oluştu",
        variant: "destructive",
      });
    } finally {
      setIsRequesting(false);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    // Store in localStorage to not show again for a while
    localStorage.setItem('notification-banner-dismissed', Date.now().toString());
  };

  // Don't show if recently dismissed
  useEffect(() => {
    const dismissedTime = localStorage.getItem('notification-banner-dismissed');
    if (dismissedTime) {
      const hoursSinceDismissed = (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60);
      if (hoursSinceDismissed < 24) { // Don't show for 24 hours
        setShowBanner(false);
      }
    }
  }, []);

  if (!showBanner) return null;

  return (
    <Card className="mx-4 my-2 border-blue-200 bg-blue-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="p-2 bg-blue-100 rounded-full">
              <Bell className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-1">
                Takas Bildirimlerini Aç
              </h3>
              <p className="text-sm text-blue-700">
                Yeni takas teklifleri ve cevaplar için anlık bildirim alın
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 ml-4">
            <Button
              onClick={handleRequestPermission}
              size="sm"
              disabled={isRequesting}
              data-testid="button-enable-notifications"
            >
              {isRequesting ? "İzin İsteniyor..." : "Bildirimlerini Aç"}
            </Button>
            <Button
              onClick={handleDismiss}
              variant="ghost"
              size="sm"
              className="p-1 h-8 w-8"
              data-testid="button-dismiss-banner"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}