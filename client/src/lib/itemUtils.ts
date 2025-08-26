import { doc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

// Süresi biten ilanı tekrar yayına al (ödeme ile)
export const republishItem = async (itemId: string): Promise<void> => {
  try {
    // 30 gün sonrası için yeni expire tarihi hesapla
    const newExpireDate = new Date();
    newExpireDate.setDate(newExpireDate.getDate() + 30);

    await updateDoc(doc(db, "items", itemId), {
      status: "pending", // Admin onayı için pending yapıyoruz
      expireAt: newExpireDate,
      updatedAt: serverTimestamp(),
    });
  } catch (error: any) {
    throw new Error(error.message || "İlan yeniden yayınlanamadı");
  }
};

// İlanı kalıcı olarak sil
export const deleteItem = async (itemId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, "items", itemId));
  } catch (error: any) {
    throw new Error(error.message || "İlan silinemedi");
  }
};

// Süresi biten ilanları otomatik olarak güncelle
export const checkExpiredItems = async (): Promise<void> => {
  // Bu fonksiyon admin paneli veya scheduled job tarafından çalıştırılabilir
  // Şimdilik sadece placeholder olarak bırakıyoruz
};