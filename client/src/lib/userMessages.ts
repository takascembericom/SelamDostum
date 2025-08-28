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
  or,
  and
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { UserMessage, InsertUserMessage, Conversation, InsertConversation } from "@shared/schema";

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
    // Add message to userMessages collection
    const docRef = await addDoc(collection(db, "userMessages"), {
      ...messageData,
      timestamp: Timestamp.now(),
      createdAt: Timestamp.now(),
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
        lastMessageTime: Timestamp.now(),
        unreadCount: newUnreadCount,
        updatedAt: Timestamp.now(),
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

// Delete conversation for a user (hide it)
export const deleteConversationForUser = async (conversationId: string, userId: string): Promise<void> => {
  try {
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
  } catch (error: any) {
    throw new Error(error.message || "Konuşma silinemedi");
  }
};

// Listen to conversation messages (real-time)
export const subscribeToConversationMessages = (
  conversationId: string,
  callback: (messages: UserMessage[]) => void
) => {
  // Remove orderBy to avoid Firebase index requirement
  const q = query(
    collection(db, "userMessages"),
    where("conversationId", "==", conversationId)
  );

  return onSnapshot(q, (snapshot) => {
    console.log("subscribeToConversationMessages tetiklendi, conversation:", conversationId, "mesaj sayısı:", snapshot.docs.length);
    const messages: UserMessage[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      console.log("Mesaj data:", doc.id, data);
      messages.push({
        ...data,
        id: doc.id,
        createdAt: data.createdAt.toDate(),
      } as UserMessage);
    });
    
    // Sort messages by createdAt in memory
    const sortedMessages = messages.sort((a, b) => 
      a.createdAt.getTime() - b.createdAt.getTime()
    );
    
    console.log("Sorted messages callback çağrılıyor, mesaj sayısı:", sortedMessages.length);
    callback(sortedMessages);
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