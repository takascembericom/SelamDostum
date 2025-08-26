import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  User as FirebaseUser,
  updateProfile
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { User, InsertUser } from "@shared/schema";

export const registerUser = async (userData: InsertUser & { password: string }) => {
  try {
    const { email, password, ...profileData } = userData;
    
    // Create Firebase user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    
    // Update Firebase profile
    await updateProfile(firebaseUser, {
      displayName: `${profileData.firstName} ${profileData.lastName}`
    });
    
    // Create user document in Firestore
    const userDoc: User = {
      id: firebaseUser.uid,
      email: firebaseUser.email!,
      emailVerified: firebaseUser.emailVerified,
      createdAt: new Date(),
      ...profileData
    };
    
    await setDoc(doc(db, "users", firebaseUser.uid), userDoc);
    
    // Send email verification
    await sendEmailVerification(firebaseUser);
    
    // Sign out user immediately after registration so they must verify email
    await signOut(auth);
    
    return userDoc;
  } catch (error: any) {
    throw new Error(error.message || "Kayıt işlemi başarısız oldu");
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    if (!user.emailVerified) {
      await signOut(auth);
      throw new Error("E-posta adresinizi doğrulamanız gerekiyor. Lütfen e-postanızı (SPAM klasörü dahil) kontrol edin ve doğrulama linkine tıklayın.");
    }
    
    return user;
  } catch (error: any) {
    throw new Error(error.message || "Giriş işlemi başarısız oldu");
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw new Error(error.message || "Çıkış işlemi başarısız oldu");
  }
};

export const getUserProfile = async (uid: string): Promise<User | null> => {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        ...data,
        createdAt: data.createdAt.toDate(),
      } as User;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
};
