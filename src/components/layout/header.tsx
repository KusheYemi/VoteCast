"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { Home, PlusCircle, LogOut, LogIn, Users } from 'lucide-react';
import Image from 'next/image';

export default function Header() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <header className="bg-primary text-primary-foreground p-4 shadow-md sticky top-0 z-50">
      <div className="container mx-auto flex flex-wrap justify-between items-center gap-4">
        <Link href="/" className="hover:text-accent transition-colors">
          <Image 
            src="/logo/votecast-logo-light-horizontal.png" 
            alt="VoteCast Logo" 
            width={120} // Adjust width as needed
            height={32} // Adjust height as needed
            className="h-8 w-auto" // Tailwind classes for height and auto width
          />
        </Link>
        <nav className="flex items-center gap-2 sm:gap-4">
          <Button variant="ghost" size="sm" asChild className="hover:bg-primary/80 hover:text-primary-foreground">
            <Link href="/">
              <Home className="mr-0 sm:mr-2 h-4 w-4" /> <span className="hidden sm:inline">Home</span>
            </Link>
          </Button>
          {user && (
            <Button variant="ghost" size="sm" asChild className="hover:bg-primary/80 hover:text-primary-foreground">
              <Link href="/create-poll">
                <PlusCircle className="mr-0 sm:mr-2 h-4 w-4" /> <span className="hidden sm:inline">Create Poll</span>
              </Link>
            </Button>
          )}
          {loading ? (
            <div className="w-20 h-8 bg-primary/50 animate-pulse rounded-md"></div>
          ) : user ? (
            <>
              <span className="text-sm hidden md:inline">Hi, {user.displayName || user.email}</span>
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="hover:bg-red-500/80 hover:text-primary-foreground">
                <LogOut className="mr-0 sm:mr-2 h-4 w-4" /> <span className="hidden sm:inline">Logout</span>
              </Button>
            </>
          ) : (
            <Button variant="ghost" size="sm" asChild className="hover:bg-primary/80 hover:text-primary-foreground">
              <Link href="/login">
                <LogIn className="mr-0 sm:mr-2 h-4 w-4" /> <span className="hidden sm:inline">Login</span>
              </Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
