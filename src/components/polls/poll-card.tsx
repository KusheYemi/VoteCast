import Link from 'next/link';
import type { Poll } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Clock, CheckCircle, ListChecks } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface PollCardProps {
  poll: Poll;
}

export default function PollCard({ poll }: PollCardProps) {
  const timeAgo = poll.createdAt ? formatDistanceToNow(poll.createdAt.toDate(), { addSuffix: true }) : 'unknown';

  return (
    <Card className="hover:shadow-xl transition-all duration-300 flex flex-col h-full hover:-translate-y-1">
      <CardHeader>
        <div className="flex justify-between items-start mb-2">
          <ListChecks className="h-8 w-8 text-primary" />
          <Badge variant={poll.status === 'active' ? 'default' : 'secondary'} className={poll.status === 'active' ? 'bg-green-500 text-white' : ''}>
            {poll.status === 'active' ? 'Active' : 'Closed'}
          </Badge>
        </div>
        <CardTitle className="text-xl font-headline leading-tight">
          <Link href={`/polls/${poll.id}`} className="hover:text-primary transition-colors">
            {poll.question}
          </Link>
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground flex items-center gap-2 pt-1">
          <Users className="h-4 w-4" /> By {poll.creatorDisplayName || 'Anonymous'}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <ul className="space-y-1 text-sm">
          {poll.options.slice(0, 3).map(option => (
            <li key={option.id} className="truncate text-muted-foreground"> &#8226; {option.text}</li>
          ))}
          {poll.options.length > 3 && <li className="text-muted-foreground text-xs">...and {poll.options.length - 3} more</li>}
        </ul>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-4 border-t">
        <div className="text-xs text-muted-foreground flex items-center">
          <Clock className="h-4 w-4 mr-1" /> {timeAgo}
        </div>
        <Button asChild variant="outline" size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground w-full sm:w-auto">
          <Link href={`/polls/${poll.id}`}>
            {poll.status === 'active' ? 'Vote / View Results' : 'View Results'} <CheckCircle className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
