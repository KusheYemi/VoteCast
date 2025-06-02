"use client";
import CreatePollForm from '@/components/polls/create-poll-form';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function CreatePollPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/create-poll');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <div className="text-center py-10">Loading or redirecting...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-3xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-headline text-center text-primary">Create a New Poll</CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Engage your audience by asking a question with multiple choices.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreatePollForm />
        </CardContent>
      </Card>
    </div>
  );
}
