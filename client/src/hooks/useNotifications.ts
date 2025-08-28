import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { Notification } from "@shared/schema";

export function useNotifications() {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!profile?.id) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    setLoading(true);

    // Listen to notifications for the current user
    const notificationsRef = collection(db, 'notifications');
    // Simplified query without orderBy to avoid index requirement
    const q = query(
      notificationsRef,
      where('userId', '==', profile.id)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notificationList: Notification[] = [];
      let unreadNotifications = 0;
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        const notification: Notification = {
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
        } as Notification;
        
        notificationList.push(notification);
        
        if (!notification.isRead) {
          unreadNotifications++;
        }
      });
      
      // Sort notifications by date in code since we can't use orderBy without index
      notificationList.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      setNotifications(notificationList);
      setUnreadCount(unreadNotifications);
      setLoading(false);
    }, (error) => {
      console.error("Error listening to notifications:", error);
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [profile?.id]);

  return { 
    notifications: notifications.slice(0, 20), // Limit to last 20 notifications 
    unreadCount, 
    loading 
  };
}