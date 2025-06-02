"use server";

import { auth, db } from '@/lib/firebase';
import type { Poll, PollOption } from '@/types';
import { collection, addDoc, serverTimestamp, doc, updateDoc, getDoc, query, where, getDocs } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

interface CreatePollInput {
  question: string;
  options: string[]; // Array of option texts
}

export async function createPollAction(data: CreatePollInput): Promise<{ success: boolean; pollId?: string; error?: string }> {
  const user = auth.currentUser;
  if (!user) {
    return { success: false, error: "User not authenticated." };
  }

  if (!data.question.trim()) {
    return { success: false, error: "Question cannot be empty." };
  }
  if (data.options.length < 2) {
    return { success: false, error: "At least two options are required." };
  }
  if (data.options.some(opt => !opt.trim())) {
    return { success: false, error: "Options cannot be empty." };
  }
  if (new Set(data.options.map(opt => opt.trim().toLowerCase())).size !== data.options.length) {
     return { success: false, error: "Options must be unique." };
  }


  const pollOptions: PollOption[] = data.options.map((optionText, index) => ({
    id: index.toString(), // Simple index-based ID for options
    text: optionText.trim(),
  }));

  try {
    const pollData: Omit<Poll, 'id' | 'createdAt'> & { createdAt: any } = {
      question: data.question.trim(),
      options: pollOptions,
      createdBy: user.uid,
      creatorDisplayName: user.displayName || user.email || 'Anonymous',
      status: 'active',
      createdAt: serverTimestamp(),
    };
    const docRef = await addDoc(collection(db, 'polls'), pollData);
    revalidatePath('/');
    return { success: true, pollId: docRef.id };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create poll." };
  }
}

export async function closePollAction(pollId: string): Promise<{ success: boolean; error?: string }> {
  const user = auth.currentUser;
  if (!user) {
    return { success: false, error: "User not authenticated." };
  }

  try {
    const pollRef = doc(db, 'polls', pollId);
    const pollSnap = await getDoc(pollRef);

    if (!pollSnap.exists()) {
      return { success: false, error: "Poll not found." };
    }

    const pollData = pollSnap.data() as Poll;
    if (pollData.createdBy !== user.uid) {
      return { success: false, error: "You are not authorized to close this poll." };
    }

    if (pollData.status === 'closed') {
      return { success: false, error: "Poll is already closed." };
    }

    await updateDoc(pollRef, { status: 'closed' });
    revalidatePath('/');
    revalidatePath(`/polls/${pollId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to close poll." };
  }
}
