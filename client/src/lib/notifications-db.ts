import { collection, addDoc, query, where, getDocs, doc, updateDoc, orderBy, Timestamp } from "firebase/firestore";
import { db } from "./firebase";
import { Notification, InsertNotification } from "@shared/schema";

// Create a new notification
export const createNotification = async (notificationData: InsertNotification): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, "notifications"), {
      ...notificationData,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error: any) {
    throw new Error(error.message || "Bildirim oluşturulamadı");
  }
};

// Get all notifications for a user
export const getUserNotifications = async (userId: string): Promise<Notification[]> => {
  try {
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
      } as Notification;
    });
  } catch (error: any) {
    throw new Error(error.message || "Bildirimler alınamadı");
  }
};

// Get unread notification count for a user
export const getUnreadNotificationCount = async (userId: string): Promise<number> => {
  try {
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", userId),
      where("isRead", "==", false)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error: any) {
    console.error("Error getting unread notification count:", error);
    return 0;
  }
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  try {
    await updateDoc(doc(db, "notifications", notificationId), {
      isRead: true,
    });
  } catch (error: any) {
    throw new Error(error.message || "Bildirim okundu olarak işaretlenemedi");
  }
};

// Mark all notifications as read for a user
export const markAllNotificationsAsRead = async (userId: string): Promise<void> => {
  try {
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", userId),
      where("isRead", "==", false)
    );
    
    const querySnapshot = await getDocs(q);
    const updatePromises = querySnapshot.docs.map(doc => 
      updateDoc(doc.ref, { isRead: true })
    );
    
    await Promise.all(updatePromises);
  } catch (error: any) {
    throw new Error(error.message || "Bildirimler okundu olarak işaretlenemedi");
  }
};

// Helper functions to create specific notification types
export const createTradeOfferNotification = async (
  toUserId: string,
  fromUserName: string,
  itemTitle: string,
  tradeOfferId: string
): Promise<string> => {
  return createNotification({
    userId: toUserId,
    type: "trade_offer",
    title: "Yeni Takas Teklifi",
    message: `${fromUserName} "${itemTitle}" ilanınız için takas teklifi gönderdi`,
    data: {
      tradeOfferId,
      fromUserName,
      itemTitle,
    },
    isRead: false,
  });
};

export const createTradeAcceptedNotification = async (
  toUserId: string,
  itemTitle: string,
  tradeOfferId: string
): Promise<string> => {
  return createNotification({
    userId: toUserId,
    type: "trade_accepted",
    title: "Takas Teklifi Kabul Edildi",
    message: `"${itemTitle}" için yaptığınız takas teklifi kabul edildi`,
    data: {
      tradeOfferId,
      itemTitle,
    },
    isRead: false,
  });
};

export const createTradeRejectedNotification = async (
  toUserId: string,
  itemTitle: string,
  tradeOfferId: string
): Promise<string> => {
  return createNotification({
    userId: toUserId,
    type: "trade_rejected",
    title: "Takas Teklifi Reddedildi",
    message: `"${itemTitle}" için yaptığınız takas teklifi reddedildi`,
    data: {
      tradeOfferId,
      itemTitle,
    },
    isRead: false,
  });
};

export const createTradeCompletedNotification = async (
  toUserId: string,
  itemTitle: string,
  tradeOfferId: string
): Promise<string> => {
  return createNotification({
    userId: toUserId,
    type: "trade_completed",
    title: "Takas Tamamlandı",
    message: `"${itemTitle}" takasınız başarıyla tamamlandı`,
    data: {
      tradeOfferId,
      itemTitle,
    },
    isRead: false,
  });
};