
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function FormCardSkeleton() {
  return (
    <Card className="w-full max-w-3xl mx-auto shadow-lg">
      <CardHeader className="space-y-3 text-center">
        <Skeleton className="h-8 w-3/5 mx-auto" /> {/* Title */}
        <Skeleton className="h-4 w-4/5 mx-auto" /> {/* Description */}
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="space-y-2">
          <Skeleton className="h-5 w-1/4" /> {/* Label */}
          <Skeleton className="h-16 w-full" /> {/* Textarea (like question) */}
        </div>
        <div className="space-y-3">
          <Skeleton className="h-5 w-1/5" /> {/* Label for options */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 flex-grow" /> {/* Option Input */}
            <Skeleton className="h-10 w-10" /> {/* Remove Button (icon) */}
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 flex-grow" /> {/* Option Input */}
            <Skeleton className="h-10 w-10" /> {/* Remove Button (icon) */}
          </div>
          <Skeleton className="h-9 w-32" /> {/* Add Option Button */}
        </div>
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
            <Skeleton className="h-12 w-full sm:w-24" /> {/* Cancel Button */}
            <Skeleton className="h-12 w-full sm:w-32" /> {/* Create Button */}
        </div>
      </CardContent>
    </Card>
  );
}
