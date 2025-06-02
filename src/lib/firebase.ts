
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, connectAuthEmulator, type Auth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, type Firestore } from 'firebase/firestore';
import { getStorage, connectStorageEmulator, type FirebaseStorage } from 'firebase/storage';

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
let storage: FirebaseStorage | undefined;
const googleProvider = new GoogleAuthProvider(); // Can be initialized regardless

// Critical check for the API Key before attempting to initialize Firebase
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) { // Added projectId check for storage bucket
  const errorMessages = [];
  if (!firebaseConfig.apiKey) {
    errorMessages.push('NEXT_PUBLIC_FIREBASE_API_KEY is missing.');
  }
  if (!firebaseConfig.projectId) {
    errorMessages.push('NEXT_PUBLIC_FIREBASE_PROJECT_ID is missing (required for Storage).');
  }
  if (!firebaseConfig.storageBucket && firebaseConfig.projectId) {
    // Infer storage bucket if projectId is present but storageBucket is missing.
    // This might not always be the desired bucket, but it's a common pattern.
    console.warn(`NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET is missing. Attempting to infer as '${firebaseConfig.projectId}.appspot.com'. Please verify this is correct.`);
    firebaseConfig.storageBucket = `${firebaseConfig.projectId}.appspot.com`;
  } else if (!firebaseConfig.storageBucket) {
     errorMessages.push('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET is missing.');
  }


  const fullErrorMessage =
    'CRITICAL FIREBASE CONFIGURATION ERROR:\n' +
    errorMessages.join('\n') + '\n\n' +
    'Please ensure that:\n' +
    '1. You have a .env.local file in the root of your project.\n' +
    '2. The .env.local file contains the necessary Firebase configuration variables.\n' +
    '3. You have restarted your Next.js development server after adding or modifying the .env.local file.\n\n' +
    'The application cannot initialize Firebase and will not function correctly without these keys.';

  if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'production') {
    console.error(fullErrorMessage);
  }
  // app, auth, db, and storage will remain undefined
} else {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }

  if (app) {
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app); // Initialize Firebase Storage
  }
}


// Comment out these lines for production
// if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined' && auth && db && storage) {
//   // Check if running in browser context for emulators and if auth/db/storage are initialized
//   try {
//     if (auth.emulatorConfig === null) connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
//     // @ts-ignore The `_isInitialized` property is not part of the public type but useful for checking
//     if (db.INTERNAL.settings.host !== "localhost:8080") connectFirestoreEmulator(db, "localhost", 8080);
//     // @ts-ignore The `_bucket` property can indicate emulator connection
//     if (!storage?.INTERNAL.bucket?.includes('localhost')) connectStorageEmulator(storage, "localhost", 9199);
//     console.log("Firebase Emulators potentially connected for development.");
//   } catch (error) {
//     console.warn("Firebase Emulators already connected or failed to connect:", error);
//   }
// }


export { app, auth, db, storage, googleProvider };
