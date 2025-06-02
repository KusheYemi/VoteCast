
"use server";

import { auth, db } from '@/lib/firebase';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

interface UpdateUserProfileActionInput {
  userId: string;
  displayName?: string | null; // Allow null to signify clearing the field
  photoURL?: string | null;    // Allow null to signify clearing the field
}

export async function updateUserProfileAction(
  data: UpdateUserProfileActionInput
): Promise<{ success: boolean; error?: string }> {
  const currentUser = auth.currentUser;

  if (!currentUser || currentUser.uid !== data.userId) {
    return { success: false, error: "User not authenticated or mismatch." };
  }

  const profileUpdates: { displayName?: string | null; photoURL?: string | null } = {};
  const firestoreUpdates: { displayName?: string | null; photoURL?: string | null } = {};

  if (data.displayName !== undefined) {
    profileUpdates.displayName = data.displayName;
    firestoreUpdates.displayName = data.displayName;
  }
  if (data.photoURL !== undefined) {
    profileUpdates.photoURL = data.photoURL;
    firestoreUpdates.photoURL = data.photoURL;
  }

  if (Object.keys(profileUpdates).length === 0) {
    return { success: false, error: "No changes provided." };
  }
  
  try {
    // Update Firebase Auth profile
    // For updateProfile, explicitly pass null if you want to remove a field value.
    // An empty string for photoURL is often treated as "no photo" by UIs.
    // An empty string for displayName is a valid display name.
    // We will pass null to Firebase Auth if the intent is to clear, matching our Firestore update.
    const authProfileUpdatePayload: { displayName?: string | null; photoURL?: string | null } = {};
    if (profileUpdates.displayName !== undefined) {
        authProfileUpdatePayload.displayName = profileUpdates.displayName;
    }
    if (profileUpdates.photoURL !== undefined) {
        authProfileUpdatePayload.photoURL = profileUpdates.photoURL;
    }

    await updateProfile(currentUser, authProfileUpdatePayload);

    // Update Firestore 'users' collection
    const userDocRef = doc(db, 'users', currentUser.uid);
    await updateDoc(userDocRef, firestoreUpdates);

    revalidatePath('/profile');
    revalidatePath('/'); // Revalidate home if display name/pic shows up in header/cards

    return { success: true };
  } catch (error: any) {
    console.error("Error updating profile:", error);
    // Provide a more generic error for security, but log specific one
    let friendlyMessage = "Failed to update profile. Please try again.";
    if (error.code === 'auth/requires-recent-login') {
        friendlyMessage = "For security, please sign out and sign back in before updating your profile."
    }
    return { success: false, error: friendlyMessage };
  }
}
