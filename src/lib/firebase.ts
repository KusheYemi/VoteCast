
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Critical check for the API Key before attempting to initialize Firebase
if (!firebaseConfig.apiKey) {
  const errorMessage =
    'CRITICAL FIREBASE CONFIGURATION ERROR:\n' +
    'NEXT_PUBLIC_FIREBASE_API_KEY is missing.\n\n' +
    'Please ensure that:\n' +
    '1. You have a .env.local file in the root of your project.\n' +
    '2. The .env.local file contains a line like: NEXT_PUBLIC_FIREBASE_API_KEY=yourActualApiKeyHere\n' +
    '3. You have restarted your Next.js development server after adding or modifying the .env.local file.\n\n' +
    'The application cannot initialize Firebase and will not function correctly without this key.';

  if (process.env.NODE_ENV === 'development') {
    // Log an error in development if the API key is missing, instead of throwing.
    // Firebase will still fail to initialize correctly later.
    console.error(errorMessage);
  } else if (process.env.NODE_ENV === 'production') {
    // In production, log a critical error. The app will likely fail,
    // but we avoid immediately crashing the server here.
    console.error(errorMessage);
  }
}

let app: FirebaseApp;
if (!getApps().length) {
  // Only initialize if the API key is present.
  // If it was missing, initializeApp will likely throw its own error here,
  // but we've already logged our more specific message.
  if (firebaseConfig.apiKey) {
    app = initializeApp(firebaseConfig);
  } else {
    // This case means API key is missing. App remains uninitialized.
    // Downstream Firebase calls will fail.
    console.error("Firebase app could not be initialized due to missing API key (this log is a fallback). App will be undefined.");
    // Explicitly setting app to a type that reflects it might be uninitialized,
    // though practically, subsequent getAuth/getFirestore calls will fail.
    app = undefined as any; // Or handle more gracefully if your app structure allows
  }
} else {
  app = getApps()[0];
}

// It's possible 'app' is undefined here if the API key was missing.
// Subsequent calls to getAuth/getFirestore will fail if 'app' is not a valid FirebaseApp instance.
const auth = app ? getAuth(app) : undefined as any;
const db = app ? getFirestore(app) : undefined as any;
const googleProvider = new GoogleAuthProvider();


// Comment out these lines for production
// if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined' && auth && db) {
//   // Check if running in browser context for emulators and if auth/db are initialized
//   try {
//     connectAuthEmulator(auth, "http://localhost:9099");
//     connectFirestoreEmulator(db, "localhost", 8080);
//     console.log("Firebase Emulators connected for development.");
//   } catch (error) {
//     console.warn("Firebase Emulators already connected or failed to connect:", error);
//   }
// }


export { app, auth, db, googleProvider };

