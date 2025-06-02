
"use server";

import { db } from '@/lib/firebase'; // Removed auth import
import type { Vote } from '@/types';
import { collection, addDoc, serverTimestamp, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

export async function submitVoteAction(pollId: string, selectedOptionId: string, userId: string): Promise<{ success: boolean; error?: string }> {
  if (!userId) {
    return { success: false, error: "User not authenticated." };
  }

  try {
    const pollRef = doc(db, 'polls', pollId);
    const pollSnap = await getDoc(pollRef);
    if (!pollSnap.exists() || pollSnap.data()?.status !== 'active') {
      return { success: false, error: "Poll is not active or does not exist." };
    }
    
    const votesQuery = query(collection(db, 'votes'), where('pollId', '==', pollId), where('userId', '==', userId));
    const existingVotesSnap = await getDocs(votesQuery);
    if (!existingVotesSnap.empty) {
      return { success: false, error: "You have already voted on this poll." };
    }

    const voteData: Omit<Vote, 'id' | 'timestamp'> & { timestamp: any } = {
      pollId,
      userId: userId,
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
