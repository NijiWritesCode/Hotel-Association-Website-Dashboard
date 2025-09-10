import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDSTDYF4234k1ia_BfAs1AqGM35VqYbA3w",
  authDomain: "hotel-admin-61822.firebaseapp.com",
  projectId: "hotel-admin-61822",
  storageBucket: "hotel-admin-61822.firebasestorage.app",
  messagingSenderId: "698785262355",
  appId: "1:698785262355:web:8c653aff5e8002d03188e6",
  measurementId: "G-FX746J50NS"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);