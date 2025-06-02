import PollList from '@/components/polls/poll-list';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-4xl font-bold font-headline text-primary">
          Welcome to VoteCast
        </h1>
        <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <Link href="/create-poll">
            <PlusCircle className="mr-2 h-5 w-5" /> Create New Poll
          </Link>
        </Button>
      </div>
      <p className="text-lg text-muted-foreground mb-10 text-center sm:text-left">
        Explore active polls, cast your vote, or create your own to gather opinions!
      </p>
      <PollList />
    </div>
  );
}
