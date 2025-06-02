
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, connectAuthEmulator, type Auth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
const googleProvider = new GoogleAuthProvider(); // Can be initialized regardless

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
    // Log an error in development if the API key is missing.
    // The app will likely still fail later, but this makes the root cause clearer.
    console.error(errorMessage);
  } else if (process.env.NODE_ENV === 'production') {
    // In production, log a critical error. The app will likely fail.
    console.error(errorMessage);
  }
  // app, auth, and db will remain undefined
} else {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }

  if (app) {
    auth = getAuth(app);
    db = getFirestore(app);
  }
}


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
