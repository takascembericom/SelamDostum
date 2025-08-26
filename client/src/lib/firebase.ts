import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCUMCFDqoP4U3hIdMF7fC3k-vBH0MDEQo0",
  authDomain: "takascemberi-6ae26.firebaseapp.com",
  projectId: "takascemberi-6ae26",
  storageBucket: "takascemberi-6ae26.firebasestorage.app",
  messagingSenderId: "892452755647",
  appId: "1:892452755647:web:7d69c183d0a7a405114e0a",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
