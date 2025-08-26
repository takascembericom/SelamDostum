import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDlfvb2sY1Z02Mi9ll7mhWPDiqEWydZZ6I",
  authDomain: "takascemberi-37c23.firebaseapp.com",
  projectId: "takascemberi-37c23",
  storageBucket: "takascemberi-37c23.firebasestorage.app",
  messagingSenderId: "110874342986",
  appId: "1:110874342986:web:0220dc85fe58e6b70b58b3",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
