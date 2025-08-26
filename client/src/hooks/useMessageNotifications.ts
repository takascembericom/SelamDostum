import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";

export function useMessageNotifications() {
  const { profile } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!profile?.id) {
      setUnreadCount(0);
      return;
    }

    // Listen to conversations where the user is a participant
    const conversationsRef = collection(db, 'conversations');
    const q = query(
      conversationsRef,
      where('participants', 'array-contains', profile.id)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let totalUnread = 0;
      
      snapshot.forEach((doc) => {
        const conversation = doc.data();
        const userUnreadCount = conversation.unreadCount?.[profile.id] || 0;
        totalUnread += userUnreadCount;
      });
      
      setUnreadCount(totalUnread);
    }, (error) => {
      console.error("Error listening to conversations:", error);
      setUnreadCount(0);
    });

    return () => unsubscribe();
  }, [profile?.id]);

  return { unreadCount };
}