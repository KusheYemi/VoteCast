
"use client";

import EditProfileForm from '@/components/profile/edit-profile-form';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import FormCardSkeleton from '@/components/layout/form-card-skeleton'; // Reusing for general loading
import { UserCircle2 } from 'lucide-react';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/profile');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="container mx-auto py-8">
        {/* Using a generic skeleton, can be customized further if needed */}
        <Card className="max-w-2xl mx-auto shadow-lg">
          <CardHeader className="text-center">
             <UserCircle2 className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <CardTitle className="text-2xl sm:text-3xl font-headline text-accent">Your Profile</CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              View and update your profile information.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mt-6">
                <div className="flex items-center space-x-4">
                    <div className="h-24 w-24 rounded-full bg-muted animate-pulse"></div>
                    <div className="space-y-2 flex-1">
                        <div className="h-4 bg-muted animate-pulse rounded w-3/4"></div>
                        <div className="h-4 bg-muted animate-pulse rounded w-1/2"></div>
                    </div>
                </div>
                <div className="h-10 bg-muted animate-pulse rounded w-full mt-2"></div>
                <div className="h-10 bg-muted animate-pulse rounded w-full mt-2"></div>
                <div className="h-10 bg-muted animate-pulse rounded w-full mt-2"></div>
                <div className="h-12 bg-muted animate-pulse rounded w-1/3 ml-auto mt-4"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader className="text-center">
          <UserCircle2 className="h-12 w-12 mx-auto text-accent mb-2" />
          <CardTitle className="text-2xl sm:text-3xl font-headline text-accent">Your Profile</CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            View and update your personal information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EditProfileForm currentUser={user} />
        </CardContent>
      </Card>
    </div>
  );
}
