import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

// Helper function to get user information by ID
export const getUserById = async (userId: string) => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) {
      return userDoc.data();
    }
    return null;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
};

// Helper function to get item information by ID
export const getItemById = async (itemId: string) => {
  try {
    const itemDoc = await getDoc(doc(db, "items", itemId));
    if (itemDoc.exists()) {
      return itemDoc.data();
    }
    return null;
  } catch (error) {
    console.error("Error fetching item:", error);
    return null;
  }
};

/**
 * Kullanıcı adını gizlilik için formatlar
 * Örnek: "Fatma Betül Durmaz" -> "Fatma B. D."
 * Örnek: "Faruk Koç" -> "Faruk K."
 * Örnek: "Ahmet" -> "Ahmet"
 */
export function formatDisplayName(fullName: string): string {
  if (!fullName || fullName.trim() === '') {
    return '';
  }

  const nameParts = fullName.trim().split(' ').filter(part => part.length > 0);
  
  if (nameParts.length === 0) {
    return '';
  }
  
  if (nameParts.length === 1) {
    // Sadece tek isim varsa olduğu gibi döndür
    return nameParts[0];
  }
  
  if (nameParts.length === 2) {
    // İki kelime varsa: "Faruk Koç" -> "Faruk K."
    return `${nameParts[0]} ${nameParts[1].charAt(0).toUpperCase()}.`;
  }
  
  // Üç veya daha fazla kelime varsa: "Fatma Betül Durmaz" -> "Fatma B. D."
  const firstName = nameParts[0];
  const restInitials = nameParts.slice(1).map(name => name.charAt(0).toUpperCase() + '.').join(' ');
  
  return `${firstName} ${restInitials}`;
}