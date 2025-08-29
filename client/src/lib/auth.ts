import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
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
      totalListings: 0,
      averageRating: 0,
      totalRatings: 0,
      isAdmin: false,
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
    // Firebase hata kodlarını Türkçe'ye çevir
    if (error.code === 'auth/invalid-credential') {
      throw new Error("E-posta adresi veya şifre yanlış.");
    }
    if (error.code === 'auth/user-not-found') {
      throw new Error("Bu e-posta adresi ile kayıtlı bir kullanıcı bulunamadı.");
    }
    if (error.code === 'auth/wrong-password') {
      throw new Error("Şifre yanlış.");
    }
    if (error.code === 'auth/too-many-requests') {
      throw new Error("Çok fazla başarısız giriş denemesi. Lütfen daha sonra tekrar deneyin.");
    }
    if (error.code === 'auth/user-disabled') {
      throw new Error("Bu hesap devre dışı bırakılmış.");
    }
    if (error.code === 'auth/invalid-email') {
      throw new Error("Geçersiz e-posta adresi.");
    }
    
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

export const sendPasswordReset = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    if (error.code === 'auth/user-not-found') {
      throw new Error("Bu e-posta adresi ile kayıtlı bir kullanıcı bulunamadı.");
    }
    throw new Error(error.message || "Şifre sıfırlama e-postası gönderilemedi");
  }
};

// Google ile giriş için yardımcı fonksiyon - displayName'i firstName/lastName'e ayırır
const parseDisplayName = (displayName: string | null): { firstName: string; lastName: string } => {
  if (!displayName) {
    return { firstName: 'Kullanıcı', lastName: '' };
  }
  
  const nameParts = displayName.trim().split(' ');
  if (nameParts.length === 1) {
    return { firstName: nameParts[0], lastName: '' };
  }
  
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(' ');
  return { firstName, lastName };
};

// Google ile giriş fonksiyonu
export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');
    
    const result = await signInWithPopup(auth, provider);
    const firebaseUser = result.user;
    
    // Kullanıcının veritabanında olup olmadığını kontrol et
    const userDocRef = doc(db, "users", firebaseUser.uid);
    const userDocSnap = await getDoc(userDocRef);
    
    if (!userDocSnap.exists()) {
      // Yeni kullanıcı - Firestore'da profil oluştur
      const { firstName, lastName } = parseDisplayName(firebaseUser.displayName);
      
      const userDoc: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        username: firebaseUser.email!.split('@')[0], // Email'den username oluştur
        firstName,
        lastName,
        phone: '', // Google'dan telefon gelmiyor, boş bırak
        emailVerified: firebaseUser.emailVerified,
        createdAt: new Date(),
        totalListings: 0,
        averageRating: 0,
        totalRatings: 0,
        isAdmin: false,
      };
      
      await setDoc(userDocRef, userDoc);
      return userDoc;
    } else {
      // Mevcut kullanıcı - sadece giriş yap
      return userDocSnap.data() as User;
    }
  } catch (error: any) {
    // Google giriş hatalarını Türkçe'ye çevir
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Google giriş penceresi kapatıldı.');
    }
    if (error.code === 'auth/popup-blocked') {
      throw new Error('Popup engellendi. Lütfen popup engelleyicinizi devre dışı bırakın.');
    }
    if (error.code === 'auth/cancelled-popup-request') {
      throw new Error('Giriş işlemi iptal edildi.');
    }
    
    throw new Error(error.message || 'Google ile giriş başarısız oldu');
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
