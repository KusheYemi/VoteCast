"use server";

import { auth, db } from '@/lib/firebase';
import type { Vote } from '@/types';
import { collection, addDoc, serverTimestamp, query, where, getDocs, doc, getDoc, runTransaction } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

export async function submitVoteAction(pollId: string, selectedOptionId: string): Promise<{ success: boolean; error?: string }> {
  const user = auth.currentUser;
  if (!user) {
    return { success: false, error: "User not authenticated." };
  }

  try {
    // Check if poll exists and is active
    const pollRef = doc(db, 'polls', pollId);
    const pollSnap = await getDoc(pollRef);
    if (!pollSnap.exists() || pollSnap.data()?.status !== 'active') {
      return { success: false, error: "Poll is not active or does not exist." };
    }
    
    // Check if user has already voted on this poll
    const votesQuery = query(collection(db, 'votes'), where('pollId', '==', pollId), where('userId', '==', user.uid));
    const existingVotesSnap = await getDocs(votesQuery);
    if (!existingVotesSnap.empty) {
      return { success: false, error: "You have already voted on this poll." };
    }

    // Add the new vote
    const voteData: Omit<Vote, 'id' | 'timestamp'> & { timestamp: any } = {
      pollId,
      userId: user.uid,
      selectedOptionId,
      timestamp: serverTimestamp(),
    };
    await addDoc(collection(db, 'votes'), voteData);

    revalidatePath(`/polls/${pollId}`);
    return { success: true };

  } catch (error: any) {
    console.error("Error submitting vote:", error);
    return { success: false, error: error.message || "Failed to submit vote." };
  }
}
