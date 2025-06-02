
import type { Timestamp } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
}

export interface PollOption {
  id: string; // Can be index as string or a generated ID
  text: string;
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  createdBy: string; // User UID
  creatorDisplayName?: string; // For display purposes
  createdAt: Timestamp;
  status: 'active' | 'closed';
}

// Type for Poll data when passed to client components (createdAt is serialized)
export interface ClientPoll extends Omit<Poll, 'createdAt'> {
  createdAt: string | null; // ISO string representation of the timestamp
}

export interface Vote {
  id?: string; // Firestore document ID
  pollId: string;
  userId: string;
  selectedOptionId: string; // ID of the PollOption
  timestamp: Timestamp;
}

// For displaying results
export interface PollResult extends PollOption {
  votes: number;
  percentage?: number;
}
