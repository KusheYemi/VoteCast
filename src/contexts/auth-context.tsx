
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import type { UserProfile } from '@/types';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const firestoreProfile = userSnap.data() as UserProfile;
          
          // Determine the most up-to-date display name.
          // Priority:
          // 1. Firebase Auth's displayName (could have been updated by updateProfile or Google)
          // 2. Firestore profile's displayName (our stored value, if Auth's is null)
          let finalDisplayName = firebaseUser.displayName; 
          if (!finalDisplayName && firestoreProfile.displayName) {
            finalDisplayName = firestoreProfile.displayName;
          }
          
          const userProfileData: UserProfile = {
            uid: firebaseUser.uid, // Always use uid from Auth
            email: firebaseUser.email, // Always use email from Auth
            displayName: finalDisplayName,
            photoURL: firebaseUser.photoURL || firestoreProfile.photoURL, // Prefer Auth's photoURL
          };

          // Update Firestore if its version is different from the effectively determined one
          // or if essential fields like email changed (though unlikely for email with same UID).
          if (userProfileData.displayName !== firestoreProfile.displayName || 
              userProfileData.photoURL !== firestoreProfile.photoURL ||
              userProfileData.email !== firestoreProfile.email) {
             await setDoc(userRef, userProfileData, { merge: true });
          }
          setUser(userProfileData);

        } else {
          // Firestore profile doesn't exist, create it.
          // firebaseUser.displayName should be populated by `updateProfile` (for email/pass) or come from Google.
          const newUserProfile: UserProfile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName, // Directly from Auth object
            photoURL: firebaseUser.photoURL,
          };
          await setDoc(userRef, newUserProfile); 
          setUser(newUserProfile);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <header className="bg-primary text-primary-foreground p-4 shadow-md">
          <div className="container mx-auto flex justify-between items-center">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-20" />
          </div>
        </header>
        <main className="flex-grow container mx-auto px-4 py-8 flex justify-center items-center">
           <div className="w-full max-w-md space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </main>
         <footer className="py-4 text-center text-sm">
          <Skeleton className="h-4 w-48 mx-auto" />
        </footer>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

    
