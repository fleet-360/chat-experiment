import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string,
  // measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID as string | undefined,
};

function createApp(): FirebaseApp {
  // Avoid re-initializing during HMR/tests
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

export const app: FirebaseApp = createApp();
export const db: Firestore = getFirestore(app);

// Analytics is optional and only in supported environments
// let analytics: Analytics | undefined;
// void isSupported().then((ok) => {
//   if (ok && firebaseConfig.measurementId) {
//     analytics = getAnalytics(app);
//   }
// });

// export { analytics };

