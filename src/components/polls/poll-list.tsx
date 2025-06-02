"use client";

import { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Poll } from '@/types';
import PollCard from './poll-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle } from 'lucide-react';

export default function PollList() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, 'polls'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const pollsData: Poll[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        pollsData.push({ 
          id: doc.id, 
          ...data,
          createdAt: data.createdAt as Timestamp // Ensure createdAt is Timestamp
        } as Poll);
      });
      setPolls(pollsData);
      setLoading(false);
      setError(null);
    }, (err) => {
      console.error("Error fetching polls: ", err);
      setError("Failed to load polls. Please try again later.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 text-destructive flex flex-col items-center gap-2">
        <AlertTriangle className="h-12 w-12" />
        <p className="text-xl">{error}</p>
      </div>
    );
  }
  
  const activePolls = polls.filter(poll => poll.status === 'active');
  const closedPolls = polls.filter(poll => poll.status === 'closed');

  return (
    <Tabs defaultValue="active" className="w-full">
      <TabsList className="mb-6 grid w-full grid-cols-2 md:w-1/2 mx-auto">
        <TabsTrigger value="active">Active Polls</TabsTrigger>
        <TabsTrigger value="closed">Closed Polls</TabsTrigger>
      </TabsList>
      <TabsContent value="active">
        {activePolls.length === 0 ? (
          <p className="text-center text-muted-foreground py-10 text-lg">No active polls at the moment. Why not create one?</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activePolls.map(poll => (
              <PollCard key={poll.id} poll={poll} />
            ))}
          </div>
        )}
      </TabsContent>
      <TabsContent value="closed">
        {closedPolls.length === 0 ? (
          <p className="text-center text-muted-foreground py-10 text-lg">No closed polls yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {closedPolls.map(poll => (
              <PollCard key={poll.id} poll={poll} />
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}

function CardSkeleton() {
  return (
    <div className="border bg-card text-card-foreground shadow-sm rounded-lg p-6 space-y-4">
      <div className="flex justify-between items-start">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-md" />
      </div>
      <Skeleton className="h-6 w-3/4 rounded-md" />
      <Skeleton className="h-4 w-1/2 rounded-md" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full rounded-md" />
        <Skeleton className="h-4 w-5/6 rounded-md" />
      </div>
      <div className="flex justify-between items-center pt-4 border-t">
        <Skeleton className="h-4 w-24 rounded-md" />
        <Skeleton className="h-8 w-32 rounded-md" />
      </div>
    </div>
  );
}
