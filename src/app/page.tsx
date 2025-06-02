import PollList from "@/components/polls/poll-list";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import Image from "next/image";
import { Sparkles, ShieldCheck, BarChart3 } from "lucide-react";

export default function HomePage() {
  return (
    <div className="container mx-auto py-8">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-accent/20 via-primary/10 to-background rounded-2xl shadow-lg p-8 flex flex-col items-center mb-10">
        <Image
          src="/logo/votecast-logo-light-horizontal.png"
          alt="VoteCast Logo"
          width={220}
          height={60}
          className="mb-4 drop-shadow-lg"
          priority
        />
        <h1 className="text-4xl sm:text-5xl font-bold font-headline text-accent text-center mb-4">
          Welcome to VoteCast
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground text-center mb-6 max-w-2xl">
          Explore active polls, cast your vote, or create your own to gather
          opinions!
        </p>
        <Button
          asChild
          size="lg"
          className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-8 py-4 text-lg shadow-md"
        >
          <Link href="/create-poll">
            <PlusCircle className="mr-2 h-6 w-6" /> Create New Poll
          </Link>
        </Button>
      </div>

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
        <div className="flex flex-col items-center bg-card rounded-xl shadow p-6">
          <Sparkles className="h-8 w-8 text-accent mb-2" />
          <span className="font-semibold text-lg">Create Polls Instantly</span>
          <span className="text-muted-foreground text-sm text-center mt-1">
            Set up a poll in seconds and share it with anyone.
          </span>
        </div>
        <div className="flex flex-col items-center bg-card rounded-xl shadow p-6">
          <ShieldCheck className="h-8 w-8 text-accent mb-2" />
          <span className="font-semibold text-lg">Vote Anonymously</span>
          <span className="text-muted-foreground text-sm text-center mt-1">
            Your privacy is protected. Vote without revealing your identity.
          </span>
        </div>
        <div className="flex flex-col items-center bg-card rounded-xl shadow p-6">
          <BarChart3 className="h-8 w-8 text-accent mb-2" />
          <span className="font-semibold text-lg">See Live Results</span>
          <span className="text-muted-foreground text-sm text-center mt-1">
            Watch poll results update in real time as votes come in.
          </span>
        </div>
      </div>

      {/* Poll List Section */}
      <div className="bg-card/80 rounded-2xl shadow-lg p-6">
        <PollList />
      </div>
    </div>
  );
}
