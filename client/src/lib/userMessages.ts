import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  setDoc,
  query, 
  where, 
  orderBy, 
  getDocs, 
  getDoc,
  onSnapshot,
  Timestamp,
  serverTimestamp,
  or,
  and
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { UserMessage, InsertUserMessage, Conversation, InsertConversation } from "@shared/schema";

// Helper function to get current user ID from auth
const getCurrentUserId = (): string | null => {
  try {
    if (typeof window !== 'undefined') {
      // Get from Firebase auth or context - for now check localStorage
      const user = localStorage.getItem('currentUser');
      if (user) {
        const parsed = JSON.parse(user);
        return parsed.id || parsed.uid || null;
      }
    }
    return null;
  } catch {
    return null;
  }
};

// Generate conversation ID from two user IDs (always same order)
export const generateConversationId = (userId1: string, userId2: string): string => {
  return [userId1, userId2].sort().join('_');
};

// Create or get existing conversation
export const createOrGetConversation = async (
  userId1: string, 
  userId2: string,
  tradeOfferId?: string
): Promise<string> => {
  try {
    const conversationId = generateConversationId(userId1, userId2);
    
    // Check if conversation already exists
    const conversationDoc = await getDoc(doc(db, "conversations", conversationId));
    
    if (conversationDoc.exists()) {
      // Check if conversation was deleted by any user (unreadCount = -1)
      const data = conversationDoc.data();
      const isDeleted = data.unreadCount?.[userId1] === -1 || data.unreadCount?.[userId2] === -1;
      
      if (isDeleted) {
        console.log("Conversation was deleted, resetting unreadCount...");
        // Reset the unreadCount for both users
        await updateDoc(doc(db, "conversations", conversationId), {
          unreadCount: {
            [userId1]: 0,
            [userId2]: 0,
          },
          updatedAt: Timestamp.now(),
        });
      }
      
      return conversationId;
    }

    // Create new conversation - only add tradeOfferId if provided
    const conversationData: any = {
      participants: [userId1, userId2],
      lastMessage: "",
      lastMessageTime: new Date(),
      unreadCount: {
        [userId1]: 0,
        [userId2]: 0,
      },
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    // Only add tradeOfferId if it's provided and valid
    if (tradeOfferId && tradeOfferId.trim().length > 0) {
      conversationData.tradeOfferId = tradeOfferId;
    }

    await setDoc(doc(db, "conversations", conversationId), conversationData);

    return conversationId;
  } catch (error: any) {
    throw new Error(error.message || "Konuşma oluşturulamadı");
  }
};

// Send a message
export const sendUserMessage = async (messageData: InsertUserMessage): Promise<string> => {
  try {
    // Add message to userMessages collection - use serverTimestamp like admin chat
    const docRef = await addDoc(collection(db, "userMessages"), {
      ...messageData,
      timestamp: serverTimestamp(),
      createdAt: serverTimestamp(),
    });

    // Update conversation's last message
    const conversationRef = doc(db, "conversations", messageData.conversationId);
    const conversationDoc = await getDoc(conversationRef);
    
    if (conversationDoc.exists()) {
      const conversationData = conversationDoc.data();
      const newUnreadCount = { ...conversationData.unreadCount };
      newUnreadCount[messageData.toUserId] = (newUnreadCount[messageData.toUserId] || 0) + 1;

      await updateDoc(conversationRef, {
        lastMessage: messageData.text || '📷 Resim gönderildi',
        lastMessageTime: serverTimestamp(),
        unreadCount: newUnreadCount,
        updatedAt: serverTimestamp(),
      });
    }

    return docRef.id;
  } catch (error: any) {
    throw new Error(error.message || "Mesaj gönderilemedi");
  }
};

// Get messages for a conversation
export const getConversationMessages = async (conversationId: string): Promise<UserMessage[]> => {
  try {
    const q = query(
      collection(db, "userMessages"),
      where("conversationId", "==", conversationId),
      orderBy("createdAt", "asc")
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt.toDate(),
      } as UserMessage;
    });
  } catch (error: any) {
    throw new Error(error.message || "Mesajlar alınamadı");
  }
};

// Get user's conversations
export const getUserConversations = async (userId: string): Promise<Conversation[]> => {
  try {
    // Removed orderBy to avoid Firebase index requirement
    const q = query(
      collection(db, "conversations"),
      where("participants", "array-contains", userId)
    );

    const querySnapshot = await getDocs(q);
    const conversations: Conversation[] = [];

    for (const docSnap of querySnapshot.docs) {
      const data = docSnap.data();
      
      // Get the other participant's name
      const otherUserId = data.participants.find((id: string) => id !== userId);
      const otherUserDoc = await getDoc(doc(db, "users", otherUserId));
      const otherUserData = otherUserDoc.data();
      
      conversations.push({
        ...data,
        id: docSnap.id,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
        lastMessageTime: data.lastMessageTime.toDate(),
        otherUserName: otherUserData ? `${otherUserData.firstName} ${otherUserData.lastName}` : 'Kullanıcı',
        otherUserId,
      } as Conversation & { otherUserName: string; otherUserId: string });
    }

    // Sort conversations by lastMessageTime in memory
    return conversations.sort((a, b) => 
      b.lastMessageTime.getTime() - a.lastMessageTime.getTime()
    );
  } catch (error: any) {
    throw new Error(error.message || "Konuşmalar alınamadı");
  }
};

// Mark messages as read
export const markMessagesAsRead = async (conversationId: string, userId: string): Promise<void> => {
  try {
    const conversationRef = doc(db, "conversations", conversationId);
    const conversationDoc = await getDoc(conversationRef);
    
    if (conversationDoc.exists()) {
      const conversationData = conversationDoc.data();
      const newUnreadCount = { ...conversationData.unreadCount };
      newUnreadCount[userId] = 0;

      await updateDoc(conversationRef, {
        unreadCount: newUnreadCount,
        updatedAt: Timestamp.now(),
      });
    }

    // Also mark individual messages as read
    const q = query(
      collection(db, "userMessages"),
      where("conversationId", "==", conversationId),
      where("toUserId", "==", userId),
      where("isRead", "==", false)
    );

    const querySnapshot = await getDocs(q);
    const updatePromises = querySnapshot.docs.map(docSnap =>
      updateDoc(doc(db, "userMessages", docSnap.id), { isRead: true })
    );

    await Promise.all(updatePromises);
  } catch (error: any) {
    throw new Error(error.message || "Mesajlar okundu olarak işaretlenemedi");
  }
};

// Delete conversation for a user (hide it and mark messages as deleted)
export const deleteConversationForUser = async (conversationId: string, userId: string): Promise<void> => {
  try {
    // Mark conversation as deleted for this user
    const conversationRef = doc(db, "conversations", conversationId);
    const conversationDoc = await getDoc(conversationRef);
    
    if (conversationDoc.exists()) {
      const conversationData = conversationDoc.data();
      const newUnreadCount = { ...conversationData.unreadCount };
      newUnreadCount[userId] = -1; // Mark as deleted for this user

      await updateDoc(conversationRef, {
        unreadCount: newUnreadCount,
        updatedAt: Timestamp.now(),
      });
    }

    // Mark all messages in this conversation as deleted for this user
    const messagesQuery = query(
      collection(db, "userMessages"),
      where("conversationId", "==", conversationId)
    );

    const messagesSnapshot = await getDocs(messagesQuery);
    const deletePromises = messagesSnapshot.docs.map(messageDoc => {
      const messageData = messageDoc.data();
      const deletedBy = messageData.deletedBy || [];
      
      // Add userId to deletedBy array if not already there
      if (!deletedBy.includes(userId)) {
        deletedBy.push(userId);
        return updateDoc(doc(db, "userMessages", messageDoc.id), { 
          deletedBy: deletedBy 
        });
      }
      return Promise.resolve();
    });

    await Promise.all(deletePromises);
  } catch (error: any) {
    throw new Error(error.message || "Konuşma silinemedi");
  }
};

// Listen to conversation messages (real-time)
export const subscribeToConversationMessages = (
  conversationId: string,
  callback: (messages: UserMessage[]) => void,
  currentUserId?: string
) => {
  // Remove orderBy to avoid Firebase index requirement
  const q = query(
    collection(db, "userMessages"),
    where("conversationId", "==", conversationId)
  );

  return onSnapshot(q, (snapshot) => {
    const messages: UserMessage[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      
      // Skip messages that are deleted by the current user
      const userId = currentUserId || getCurrentUserId();
      if (userId && data.deletedBy && Array.isArray(data.deletedBy) && data.deletedBy.includes(userId)) {
        return;
      }
      
      messages.push({
        ...data,
        id: doc.id,
        createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
        timestamp: data.timestamp ? data.timestamp.toDate() : new Date(),
      } as UserMessage);
    });
    
    // Sort exactly like admin chat: by createdAt timestamp only
    messages.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    
    callback(messages);
  }, (error) => {
    console.error("subscribeToConversationMessages hatası:", error);
  });
};

// Listen to user conversations (real-time)
export const subscribeToUserConversations = (
  userId: string,
  callback: (conversations: Conversation[]) => void
) => {
  // Removed orderBy to avoid Firebase index requirement
  const q = query(
    collection(db, "conversations"),
    where("participants", "array-contains", userId)
  );

  return onSnapshot(q, async (snapshot) => {
    console.log("Firebase onSnapshot tetiklendi, doc sayısı:", snapshot.docs.length);
    const conversations: Conversation[] = [];

    try {
      for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      console.log("Processing conversation:", docSnap.id, data);
      
      // Skip conversations that are deleted by this user (unreadCount = -1)
      const userUnreadCount = data.unreadCount?.[userId];
      if (userUnreadCount === -1) {
        console.log("Conversation deleted by user, skipping:", docSnap.id);
        continue; // Skip this conversation as it was deleted by the user
      }
      
      // Get the other participant's name
      const otherUserId = data.participants.find((id: string) => id !== userId);
      console.log("Other user ID:", otherUserId);
      
      if (!otherUserId) {
        console.log("Other user ID bulunamadı, skipping conversation:", docSnap.id);
        continue;
      }
      
      try {
        const otherUserDoc = await getDoc(doc(db, "users", otherUserId));
        const otherUserData = otherUserDoc.data();
        console.log("Other user data:", otherUserData);
        
        conversations.push({
          ...data,
          id: docSnap.id,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
          lastMessageTime: data.lastMessageTime.toDate(),
          otherUserName: otherUserData ? `${otherUserData.firstName} ${otherUserData.lastName}` : 'Kullanıcı',
          otherUserId,
        } as Conversation & { otherUserName: string; otherUserId: string });
        
        console.log("Conversation başarıyla eklendi:", docSnap.id);
      } catch (error) {
        console.error("Other user data çekerken hata:", error);
      }
    }
    } catch (error) {
      console.error("onSnapshot içinde hata:", error);
    }

    // Sort conversations by lastMessageTime in memory
    const sortedConversations = conversations.sort((a, b) => 
      b.lastMessageTime.getTime() - a.lastMessageTime.getTime()
    );
    
    console.log("Firebase conversation callback çağrılıyor, conversation sayısı:", sortedConversations.length);
    callback(sortedConversations);
  }, (error) => {
    console.error("Firebase subscription hatası:", error);
  });
};