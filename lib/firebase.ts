// lib/firebase.ts

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAyUc1K-JXWXavczHpbfM6z8sG6f4U9OPM",
  authDomain: "weather-dashboard-1d01f.firebaseapp.com",
  projectId: "weather-dashboard-1d01f",
  storageBucket: "weather-dashboard-1d01f.appspot.com",
  messagingSenderId: "242337234322",
  appId: "1:242337234322:web:3416bb3afe0ddfc83d954b",
};

// Prevent re-initializing if already initialized (important in Next.js)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Get Firestore instance
const db = getFirestore(app);

export { db };
