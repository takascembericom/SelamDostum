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