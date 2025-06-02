
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { Home, PlusCircle, LogOut, LogIn, UserCircle2 } from 'lucide-react'; // Added UserCircle2
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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

  const getInitials = (name?: string | null) => {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <header className="bg-primary text-primary-foreground p-4 shadow-md sticky top-0 z-50">
      <div className="container mx-auto flex flex-wrap justify-between items-center gap-4">
        <Link href="/" className="hover:text-accent transition-colors">
          <Image 
            src="/logo/votecast-logo-light-horizontal.png" 
            alt="VoteCast Logo" 
            width={120}
            height={32}
            className="h-8 w-auto"
          />
        </Link>
        <nav className="flex items-center gap-2 sm:gap-3">
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
              <Button variant="ghost" size="sm" asChild className="hover:bg-primary/80 hover:text-primary-foreground px-2 sm:px-3">
                <Link href="/profile" className="flex items-center gap-2">
                  <Avatar className="h-6 w-6 sm:h-7 sm:w-7 border-2 border-accent/50">
                    <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                    <AvatarFallback className="text-xs bg-accent text-accent-foreground">
                      {getInitials(user.displayName)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline text-sm">{user.displayName || user.email?.split('@')[0]}</span>
                </Link>
              </Button>
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
