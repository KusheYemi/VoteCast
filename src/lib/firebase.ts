
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
  if (process.env.NODE_ENV === 'development') {
    // Halt execution in development if the API key is missing.
    // This provides a clearer error message than the generic Firebase error.
    throw new Error(
      'CRITICAL FIREBASE CONFIGURATION ERROR:\n' +
      'NEXT_PUBLIC_FIREBASE_API_KEY is missing.\n\n' +
      'Please ensure that:\n' +
      '1. You have a .env.local file in the root of your project.\n' +
      '2. The .env.local file contains a line like: NEXT_PUBLIC_FIREBASE_API_KEY=yourActualApiKeyHere\n' +
      '3. You have restarted your Next.js development server after adding or modifying the .env.local file.\n\n' +
      'The application cannot initialize Firebase and will not function correctly without this key.'
    );
  } else if (process.env.NODE_ENV === 'production') {
    // In production, log a critical error. The app will likely fail,
    // but we avoid immediately crashing the server here.
    console.error(
      'CRITICAL FIREBASE CONFIGURATION ERROR: NEXT_PUBLIC_FIREBASE_API_KEY is missing in the production environment. ' +
      'The application will not function correctly.'
    );
  }
}

let app: FirebaseApp;
if (!getApps().length) {
  // Only initialize if the API key is present.
  // If it was missing in production, initializeApp will likely throw its own error here,
  // but we've already logged our more specific message.
  // In development, the throw above would have already halted execution.
  if (firebaseConfig.apiKey) {
    app = initializeApp(firebaseConfig);
  } else {
    // This case should ideally not be reached in dev due to the throw above.
    // In prod, if apiKey is missing, app remains uninitialized.
    console.error("Firebase app could not be initialized due to missing API key (this log is a fallback).");
    // Assign a dummy or handle this explicitly if needed, though downstream Firebase calls will fail.
    // For now, let it be undefined and cause errors later if not caught by the API key check.
  }
} else {
  app = getApps()[0];
}

// @ts-ignore app could be undefined if apiKey was missing in prod and we didn't throw.
const auth = getAuth(app);
// @ts-ignore app could be undefined if apiKey was missing in prod and we didn't throw.
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Comment out these lines for production
// if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
//   // Check if running in browser context for emulators
//   // It's important to ensure emulators are only connected once and in dev mode.
//   // Firebase docs suggest not to use emulators in production.
//   try {
//     connectAuthEmulator(auth, "http://localhost:9099");
//     connectFirestoreEmulator(db, "localhost", 8080);
//     console.log("Firebase Emulators connected for development.");
//   } catch (error) {
//     console.warn("Firebase Emulators already connected or failed to connect:", error);
//   }
// }


export { app, auth, db, googleProvider };
