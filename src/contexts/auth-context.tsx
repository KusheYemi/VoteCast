
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
          // Prioritize Firebase Auth's displayName if Firestore's is missing or different
          // This ensures that if updateProfile ran, its value is preferred.
          const displayNameFromAuth = firebaseUser.displayName;
          let effectiveDisplayName = firestoreProfile.displayName;

          if (displayNameFromAuth && displayNameFromAuth !== firestoreProfile.displayName) {
            effectiveDisplayName = displayNameFromAuth;
          }
          
          const userProfileData: UserProfile = {
            ...firestoreProfile, // Spread existing fields first
            uid: firebaseUser.uid, // Ensure uid is from firebaseUser
            email: firebaseUser.email, // Ensure email is from firebaseUser
            displayName: effectiveDisplayName, // Use the determined effectiveDisplayName
            photoURL: firebaseUser.photoURL || firestoreProfile.photoURL, // Prefer Auth's photoURL
          };

          // If Firestore profile needs update based on Auth object (e.g., displayName changed)
          if (userProfileData.displayName !== firestoreProfile.displayName || userProfileData.photoURL !== firestoreProfile.photoURL) {
             await setDoc(userRef, userProfileData, { merge: true });
          }
          setUser(userProfileData);

        } else {
          // Firestore profile doesn't exist, create it.
          // firebaseUser.displayName should be populated by updateProfile (for email) or from Google.
          const newUserProfile: UserProfile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName, 
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

    