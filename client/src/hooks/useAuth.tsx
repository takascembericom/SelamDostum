import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User as FirebaseUser, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { User } from "@shared/schema";
import { getUserProfile } from "@/lib/auth";

interface AuthContextType {
  user: FirebaseUser | null;
  profile: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // If user exists but email is not verified, sign them out immediately
      if (firebaseUser && !firebaseUser.emailVerified) {
        await auth.signOut();
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }
      
      setUser(firebaseUser);
      
      if (firebaseUser && firebaseUser.emailVerified) {
        const userProfile = await getUserProfile(firebaseUser.uid);
        setProfile(userProfile);
      } else {
        setProfile(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
