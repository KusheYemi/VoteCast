import { db } from '@/lib/firebase';
import type { Poll } from '@/types';
import { doc, getDoc } from 'firebase/firestore';
import PollDetailClient from '@/components/polls/poll-detail-client';
import { AlertTriangle } from 'lucide-react';

interface PollPageProps {
  params: { id: string };
}

async function getPoll(id: string): Promise<Poll | null> {
  try {
    const pollRef = doc(db, 'polls', id);
    const pollSnap = await getDoc(pollRef);
    if (pollSnap.exists()) {
      return { id: pollSnap.id, ...pollSnap.data() } as Poll;
    }
    return null;
  } catch (error) {
    console.error("Error fetching poll:", error);
    return null;
  }
}

export default async function PollPage({ params }: PollPageProps) {
  const poll = await getPoll(params.id);

  if (!poll) {
    return (
      <div className="container mx-auto py-12 text-center">
        <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-destructive mb-2">Poll Not Found</h1>
        <p className="text-lg text-muted-foreground">
          The poll you are looking for does not exist or could not be loaded.
        </p>
        <a href="/" className="mt-6 inline-block px-6 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90">
          Go to Homepage
        </a>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <PollDetailClient initialPoll={poll} />
    </div>
  );
}

// Optional: Generate static paths if you have a known, small number of polls
// export async function generateStaticParams() {
//   // Fetch all poll IDs, e.g., from Firestore (not recommended for large datasets)
//   // const pollsCol = collection(db, 'polls');
//   // const pollSnapshot = await getDocs(pollsCol);
//   // const paths = pollSnapshot.docs.map(doc => ({
//   //   id: doc.id,
//   // }));
//   // return paths;
//   return []; // Default to SSR if not pre-generating
// }
