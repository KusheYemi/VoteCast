
"use client";

import type { ClientPoll, Vote, PollResult, Poll as FirestorePoll } from '@/types'; // Use ClientPoll for props and state, FirestorePoll for Firestore data
import { useEffect, useState } from 'react';
import { doc, onSnapshot, collection, query, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import PollResultsChart from './poll-results-chart';
import { submitVoteAction } from '@/actions/voteActions'; 
import { closePollAction } from '@/actions/pollActions';
import { useToast } from "@/hooks/use-toast";
import { Loader2, Lock, AlertTriangle, UserCheck, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';


interface PollDetailClientProps {
  initialPoll: ClientPoll; // Expect createdAt as ISO string
}

export default function PollDetailClient({ initialPoll }: PollDetailClientProps) {
  const [poll, setPoll] = useState<ClientPoll>(initialPoll); // State stores createdAt as ISO string
  const [votes, setVotes] = useState<Vote[]>([]);
  const [selectedOptionId, setSelectedOptionId] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const unsubPoll = onSnapshot(doc(db, 'polls', initialPoll.id), (docSnap) => {
      if (docSnap.exists()) {
        const firestoreData = docSnap.data() as Omit<FirestorePoll, 'id'>; // Data from Firestore has Timestamp
        setPoll({
          id: docSnap.id,
          question: firestoreData.question,
          options: firestoreData.options,
          createdBy: firestoreData.createdBy,
          creatorDisplayName: firestoreData.creatorDisplayName,
          status: firestoreData.status,
          createdAt: firestoreData.createdAt ? (firestoreData.createdAt as Timestamp).toDate().toISOString() : null, // Convert to ISO string for state
        } as ClientPoll);
      } else {
        setError("Poll not found.");
      }
    }, (err) => {
      console.error("Error fetching poll details:", err);
      setError("Could not load poll details.");
    });

    const votesQuery = query(collection(db, 'votes'), where('pollId', '==', initialPoll.id));
    const unsubVotes = onSnapshot(votesQuery, (snapshot) => {
      const votesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Vote));
      setVotes(votesData);
    }, (err) => {
      console.error("Error fetching votes:", err);
    });
    
    return () => {
      unsubPoll();
      unsubVotes();
    };
  }, [initialPoll.id]);

  useEffect(() => {
    if (user && votes.length > 0) {
      setHasVoted(votes.some(vote => vote.userId === user.uid));
    } else if (!user) {
      setHasVoted(false); 
    }
  }, [user, votes]);

  const handleVote = async () => {
    if (!user) {
      toast({ title: "Authentication Required", description: "Please login to vote.", variant: "destructive" });
      return;
    }
    if (!selectedOptionId) {
      toast({ title: "No Option Selected", description: "Please select an option to vote.", variant: "default" });
      return;
    }
    setIsLoading(true);
    const result = await submitVoteAction(poll.id, selectedOptionId, user.uid);
    if (result.success) {
      toast({ title: "Vote Submitted!", description: "Your vote has been recorded.", icon: <CheckCircle className="h-5 w-5 text-green-500" /> });
    } else {
      toast({ title: "Voting Failed", description: result.error || "Could not submit your vote.", variant: "destructive", icon: <XCircle className="h-5 w-5 text-red-500" /> });
    }
    setIsLoading(false);
  };

  const handleClosePoll = async () => {
    if (!user || user.uid !== poll.createdBy) {
      toast({ title: "Unauthorized", description: "You are not allowed to close this poll.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    const result = await closePollAction(poll.id, user.uid);
    if (result.success) {
      toast({ title: "Poll Closed", description: "This poll is now closed for voting." });
    } else {
      toast({ title: "Failed to Close Poll", description: result.error || "An unknown error occurred.", variant: "destructive" });
    }
    setIsLoading(false);
  };

  const pollResults: PollResult[] = poll.options.map(option => {
    const optionVotes = votes.filter(vote => vote.selectedOptionId === option.id).length;
    return { ...option, votes: optionVotes };
  });
  const totalVotes = votes.length;

  if (error) {
    return <div className="text-center py-10 text-destructive flex flex-col items-center gap-2"> <AlertTriangle className="h-12 w-12" /> <p className="text-xl">{error}</p></div>;
  }

  const canVote = poll.status === 'active' && user && !hasVoted && !authLoading;
  const isCreator = user && user.uid === poll.createdBy;

  return (
    <div className="space-y-8">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-headline text-accent">{poll.question}</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Created by {poll.creatorDisplayName || 'Anonymous'} on {poll.createdAt ? format(new Date(poll.createdAt), 'PPP p') : 'N/A'} {/* Parse ISO string to Date */}
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${poll.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {poll.status.toUpperCase()}
            </span>
          </CardDescription>
        </CardHeader>

        {poll.status === 'active' && (
          <CardContent>
            {authLoading ? (
              <div className="flex justify-center py-4"><Loader2 className="h-8 w-8 animate-spin text-accent" /></div>
            ) : !user ? (
              <p className="text-center text-muted-foreground py-4">Please <a href="/login" className="text-accent underline">login</a> to vote.</p>
            ) : hasVoted ? (
              <div className="text-center py-4 text-green-600 flex items-center justify-center gap-2">
                <UserCheck className="h-6 w-6" /> You've already voted on this poll.
              </div>
            ) : (
              <RadioGroup value={selectedOptionId} onValueChange={setSelectedOptionId} className="space-y-3 my-4">
                {poll.options.map(option => (
                  <Label 
                    key={option.id} 
                    htmlFor={option.id} 
                    className="flex items-center gap-3 p-4 border rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer has-[:checked]:bg-accent/10 has-[:checked]:border-accent"
                  >
                    <RadioGroupItem 
                      value={option.id} 
                      id={option.id} 
                      className="h-5 w-5 border-muted-foreground border-2 data-[state=checked]:border-accent data-[state=checked]:text-accent"
                    />
                    <span className="text-base font-medium">{option.text}</span>
                  </Label>
                ))}
              </RadioGroup>
            )}
          </CardContent>
        )}

        <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t">
          {canVote && (
            <Button onClick={handleVote} disabled={isLoading || !selectedOptionId} className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-3 px-6">
              {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
              Submit Vote
            </Button>
          )}
          {isCreator && poll.status === 'active' && (
            <Button variant="destructive" onClick={handleClosePoll} disabled={isLoading} className="w-full sm:w-auto">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
              Close Poll
            </Button>
          )}
        </CardFooter>
      </Card>

      <PollResultsChart results={pollResults} totalVotes={totalVotes} />
    </div>
  );
}
