import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  getDoc,
  Timestamp 
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { TradeOffer, InsertTradeOffer } from "@shared/schema";

export interface TradeOfferWithItems extends TradeOffer {
  fromItem?: {
    id: string;
    title: string;
    images: string[];
    category: string;
    condition: string;
  };
  toItem?: {
    id: string;
    title: string;
    images: string[];
    category: string;
    condition: string;
  };
  fromUserName?: string;
  toUserName?: string;
}

// Create a new trade offer
export const createTradeOffer = async (tradeOfferData: InsertTradeOffer): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, "tradeOffers"), {
      ...tradeOfferData,
      timestamp: Timestamp.now(),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error: any) {
    throw new Error(error.message || "Takas teklifi oluşturulamadı");
  }
};

// Get trade offers sent by a user
export const getSentTradeOffers = async (userId: string): Promise<TradeOfferWithItems[]> => {
  try {
    const q = query(
      collection(db, "tradeOffers"),
      where("fromUserId", "==", userId),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    const tradeOffers: TradeOfferWithItems[] = [];

    for (const docSnap of querySnapshot.docs) {
      const data = docSnap.data();
      const tradeOffer: TradeOfferWithItems = {
        ...data,
        id: docSnap.id,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as TradeOfferWithItems;

      // Fetch item details
      await enrichTradeOfferWithItemDetails(tradeOffer);
      tradeOffers.push(tradeOffer);
    }

    return tradeOffers;
  } catch (error: any) {
    throw new Error(error.message || "Gönderilen teklifler alınamadı");
  }
};

// Get trade offers received by a user
export const getReceivedTradeOffers = async (userId: string): Promise<TradeOfferWithItems[]> => {
  try {
    const q = query(
      collection(db, "tradeOffers"),
      where("toUserId", "==", userId),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    const tradeOffers: TradeOfferWithItems[] = [];

    for (const docSnap of querySnapshot.docs) {
      const data = docSnap.data();
      const tradeOffer: TradeOfferWithItems = {
        ...data,
        id: docSnap.id,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as TradeOfferWithItems;

      // Fetch item details
      await enrichTradeOfferWithItemDetails(tradeOffer);
      tradeOffers.push(tradeOffer);
    }

    return tradeOffers;
  } catch (error: any) {
    throw new Error(error.message || "Alınan teklifler alınamadı");
  }
};

// Update trade offer status
export const updateTradeOfferStatus = async (
  tradeOfferId: string, 
  status: 'beklemede' | 'kabul_edildi' | 'reddedildi' | 'iptal_edildi'
): Promise<void> => {
  try {
    await updateDoc(doc(db, "tradeOffers", tradeOfferId), {
      status,
      updatedAt: Timestamp.now(),
    });
  } catch (error: any) {
    throw new Error(error.message || "Takas teklifi durumu güncellenemedi");
  }
};

// Helper function to enrich trade offer with item details
const enrichTradeOfferWithItemDetails = async (tradeOffer: TradeOfferWithItems): Promise<void> => {
  try {
    // Get fromItem details
    const fromItemDoc = await getDoc(doc(db, "items", tradeOffer.fromItemId));
    if (fromItemDoc.exists()) {
      const fromItemData = fromItemDoc.data();
      tradeOffer.fromItem = {
        id: fromItemDoc.id,
        title: fromItemData.title,
        images: fromItemData.images,
        category: fromItemData.category,
        condition: fromItemData.condition,
      };
    }

    // Get toItem details
    const toItemDoc = await getDoc(doc(db, "items", tradeOffer.toItemId));
    if (toItemDoc.exists()) {
      const toItemData = toItemDoc.data();
      tradeOffer.toItem = {
        id: toItemDoc.id,
        title: toItemData.title,
        images: toItemData.images,
        category: toItemData.category,
        condition: toItemData.condition,
      };
    }

    // Get user names
    const fromUserDoc = await getDoc(doc(db, "users", tradeOffer.fromUserId));
    if (fromUserDoc.exists()) {
      const fromUserData = fromUserDoc.data();
      tradeOffer.fromUserName = `${fromUserData.firstName} ${fromUserData.lastName}`;
    }

    const toUserDoc = await getDoc(doc(db, "users", tradeOffer.toUserId));
    if (toUserDoc.exists()) {
      const toUserData = toUserDoc.data();
      tradeOffer.toUserName = `${toUserData.firstName} ${toUserData.lastName}`;
    }
  } catch (error) {
    console.error("Error enriching trade offer:", error);
  }
};

// Complete a trade (mark items as traded and update offer)
export const completeTrade = async (tradeOfferId: string): Promise<void> => {
  try {
    // Get trade offer details
    const tradeOfferDoc = await getDoc(doc(db, "tradeOffers", tradeOfferId));
    if (!tradeOfferDoc.exists()) {
      throw new Error("Takas teklifi bulunamadı");
    }

    const tradeOfferData = tradeOfferDoc.data();

    // Update both items status to 'takas_edildi'
    await updateDoc(doc(db, "items", tradeOfferData.fromItemId), {
      status: "takas_edildi",
      updatedAt: Timestamp.now(),
    });

    await updateDoc(doc(db, "items", tradeOfferData.toItemId), {
      status: "takas_edildi", 
      updatedAt: Timestamp.now(),
    });

    // Update trade offer status
    await updateTradeOfferStatus(tradeOfferId, "kabul_edildi");

  } catch (error: any) {
    throw new Error(error.message || "Takas tamamlanamadı");
  }
};