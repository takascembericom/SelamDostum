// Browser Push Notification System for Trade Offers

export type NotificationType = 'new_trade_offer' | 'trade_accepted' | 'trade_rejected' | 'trade_completed';

export interface NotificationData {
  type: NotificationType;
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: any;
}

class NotificationManager {
  private static instance: NotificationManager;
  private permission: NotificationPermission = 'default';

  private constructor() {
    this.checkPermission();
  }

  public static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  private checkPermission(): void {
    if ('Notification' in window) {
      this.permission = Notification.permission;
    }
  }

  public async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('Bu tarayıcı bildirim özelliğini desteklemiyor');
      return 'denied';
    }

    if (this.permission === 'default') {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission;
    }

    return this.permission;
  }

  public hasPermission(): boolean {
    return this.permission === 'granted';
  }

  public async showNotification(data: NotificationData): Promise<void> {
    // Check if notifications are supported and permission is granted
    if (!('Notification' in window)) {
      console.warn('Bu tarayıcı bildirim özelliğini desteklemiyor');
      return;
    }

    if (this.permission !== 'granted') {
      console.warn('Bildirim izni verilmemiş');
      return;
    }

    // Check if user is already on the page (don't spam with notifications)
    if (document.visibilityState === 'visible') {
      console.log('Kullanıcı sayfada, bildirim gösterilmiyor:', data.title);
      return;
    }

    try {
      const notification = new Notification(data.title, {
        body: data.body,
        icon: data.icon || '/favicon.ico',
        badge: data.badge || '/favicon.ico',
        tag: `takas-${data.type}-${Date.now()}`,
        requireInteraction: true,
        data: data.data
      });

      // Auto close after 7 seconds
      setTimeout(() => {
        notification.close();
      }, 7000);

      // Handle notification click
      notification.onclick = (event) => {
        event.preventDefault();
        window.focus();
        
        // Navigate based on notification type
        if (data.data?.redirectUrl) {
          window.location.href = data.data.redirectUrl;
        } else {
          // Default redirect to profile trade offers
          window.location.href = '/profile?tab=trade-offers';
        }
        
        notification.close();
      };

    } catch (error) {
      console.error('Bildirim gösterilemedi:', error);
    }
  }

  public createTradeOfferNotification(fromUserName: string, itemName: string): NotificationData {
    return {
      type: 'new_trade_offer',
      title: '🔄 Yeni Takas Teklifi!',
      body: `${fromUserName} size "${itemName}" için takas teklifi gönderdi`,
      data: {
        redirectUrl: '/profile?tab=trade-offers'
      }
    };
  }

  public createTradeAcceptedNotification(toUserName: string, itemName: string): NotificationData {
    return {
      type: 'trade_accepted',
      title: '✅ Takas Kabul Edildi!',
      body: `${toUserName} takas teklifinizi kabul etti - "${itemName}"`,
      data: {
        redirectUrl: '/profile?tab=trade-offers'
      }
    };
  }

  public createTradeRejectedNotification(toUserName: string, itemName: string): NotificationData {
    return {
      type: 'trade_rejected',
      title: '❌ Takas Reddedildi',
      body: `${toUserName} takas teklifinizi reddetti - "${itemName}"`,
      data: {
        redirectUrl: '/profile?tab=trade-offers'
      }
    };
  }

  public createTradeCompletedNotification(itemName: string): NotificationData {
    return {
      type: 'trade_completed',
      title: '🎉 Takas Tamamlandı!',
      body: `"${itemName}" takasınız başarıyla tamamlandı`,
      data: {
        redirectUrl: '/profile?tab=active-items'
      }
    };
  }
}

// Export singleton instance
export const notificationManager = NotificationManager.getInstance();

// Utility functions for easier use
export const requestNotificationPermission = () => notificationManager.requestPermission();
export const hasNotificationPermission = () => notificationManager.hasPermission();
export const showNotification = (data: NotificationData) => notificationManager.showNotification(data);

// Specific notification senders
export const sendNewTradeOfferNotification = (fromUserName: string, itemName: string) => {
  const notification = notificationManager.createTradeOfferNotification(fromUserName, itemName);
  return notificationManager.showNotification(notification);
};

export const sendTradeAcceptedNotification = (toUserName: string, itemName: string) => {
  const notification = notificationManager.createTradeAcceptedNotification(toUserName, itemName);
  return notificationManager.showNotification(notification);
};

export const sendTradeRejectedNotification = (toUserName: string, itemName: string) => {
  const notification = notificationManager.createTradeRejectedNotification(toUserName, itemName);
  return notificationManager.showNotification(notification);
};

export const sendTradeCompletedNotification = (itemName: string) => {
  const notification = notificationManager.createTradeCompletedNotification(itemName);
  return notificationManager.showNotification(notification);
};