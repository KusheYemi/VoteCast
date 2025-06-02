
"use client";

import { useState, type FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, signInWithPopup, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, googleProvider, db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import { Github, Mail, KeyRound, User } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { doc, setDoc, getDoc } from 'firebase/firestore';
import type { UserProfile } from '@/types';
import Image from 'next/image';

function getFriendlyAuthErrorMessage(code?: string, defaultMessage?: string): string {
  switch (code) {
    case 'auth/user-not-found':
      return "Hmm, we couldn't find an account with that email. Maybe try signing up?";
    case 'auth/wrong-password':
      return "That password doesn't look right. Give it another try!";
    case 'auth/invalid-email':
      return "The email address you entered doesn't seem valid. Please double-check it.";
    case 'auth/email-already-in-use':
      return "This email is already registered. Try logging in, or use a different email to sign up.";
    case 'auth/weak-password':
      return "For better security, please choose a stronger password (at least 6 characters).";
    case 'auth/requires-recent-login':
      return "For your security, please log in again before doing that.";
    case 'auth/too-many-requests':
        return "Looks like there have been too many attempts. Please wait a bit and try again.";
    default:
      if (defaultMessage && defaultMessage.startsWith("Firebase: ")) {
        const friendlyPart = defaultMessage.substring("Firebase: ".length).split(" (auth/")[0];
        return `Something went wrong: ${friendlyPart}. If this keeps happening, let us know!`;
      }
      return defaultMessage || "An unexpected hiccup occurred. Please try again.";
  }
}


export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState(''); // For sign up
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && user) {
      const queryParams = new URLSearchParams(window.location.search);
      const redirectPath = queryParams.get('redirect');
      router.push(redirectPath || '/');
    }
  }, [user, authLoading, router]);

  const handleEmailPasswordSignIn = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: "Login Successful!", description: "Welcome back!" });
      const queryParams = new URLSearchParams(window.location.search);
      const redirect = queryParams.get('redirect');
      router.push(redirect || '/');
    } catch (err: any) {
      const friendlyMessage = getFriendlyAuthErrorMessage(err.code, err.message);
      setError(err.message); // Keep detailed error for on-page display if needed
      toast({ title: "Login Problem", description: friendlyMessage, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailPasswordSignUp = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    if (password.length < 6) {
      setError("Password should be at least 6 characters.");
      toast({ title: "Password Check", description: "Your password needs to be at least 6 characters long for good security.", variant: "destructive" });
      setIsLoading(false);
      return;
    }
    const trimmedDisplayName = displayName.trim();

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      const newDisplayName = trimmedDisplayName || firebaseUser.email?.split('@')[0] || "User";

      if (firebaseUser) {
        await updateProfile(firebaseUser, { 
          displayName: newDisplayName,
        });
      }

      const newUserProfile: UserProfile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: newDisplayName, 
        photoURL: firebaseUser.photoURL, 
      };
      await setDoc(doc(db, 'users', firebaseUser.uid), newUserProfile, { merge: true });

      toast({ title: "Sign Up Successful!", description: "Welcome to VoteCast! You're all set." });
      const queryParams = new URLSearchParams(window.location.search);
      const redirect = queryParams.get('redirect');
      router.push(redirect || '/');
    } catch (err: any) {
      const friendlyMessage = getFriendlyAuthErrorMessage(err.code, err.message);
      setError(err.message); 
      toast({ title: "Sign Up Problem", description: friendlyMessage, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;

      const userRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userRef);
      
      let profileDisplayName = firebaseUser.displayName;
      if (!profileDisplayName && userSnap.exists()) {
        profileDisplayName = userSnap.data()?.displayName || profileDisplayName;
      }
      if (!profileDisplayName) {
        profileDisplayName = firebaseUser.email?.split('@')[0] || "User";
      }

      const userProfileData: UserProfile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: profileDisplayName, 
        photoURL: firebaseUser.photoURL,
      };
      await setDoc(userRef, userProfileData, { merge: true });
      
      toast({ title: "Google Sign-In Successful!", description: "Welcome! You're signed in with Google." });
      const queryParams = new URLSearchParams(window.location.search);
      const redirect = queryParams.get('redirect');
      router.push(redirect || '/');
    } catch (err: any) {
      setError(err.message); 
      if (err.code === 'auth/popup-closed-by-user') {
        toast({ title: "Google Sign-In Incomplete", description: "The Google sign-in window was closed or didn't complete. If you'd like to try again, just click the Google button.", variant: "default" });
      } else if (err.code === 'auth/popup-blocked') {
        toast({ title: "Google Popup Blocked", description: "Your browser blocked the Google sign-in pop-up. Please check your pop-up blocker settings and allow pop-ups for our site, then try signing in with Google again.", variant: "destructive" });
      } else {
        const friendlyMessage = getFriendlyAuthErrorMessage(err.code, err.message);
        toast({ title: "Google Sign-In Issue", description: friendlyMessage, variant: "destructive" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || (!authLoading && user)) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><p>Loading...</p></div>;
  }

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-200px)] py-12">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Image 
              src="/logo/votecast-logo-light-horizontal.png" 
              alt="VoteCast Logo" 
              width={180} 
              height={48} 
              priority
            />
          </div>
          <CardTitle className="text-3xl font-headline">Welcome to VoteCast</CardTitle>
          <CardDescription>Sign in or create an account to participate</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <form onSubmit={handleEmailPasswordSignIn} className="space-y-6 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="email-login">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input id="email-login" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="pl-10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-login">Password</Label>
                   <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input id="password-login" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="pl-10" />
                  </div>
                </div>
                {error && <p className="text-sm text-destructive">{getFriendlyAuthErrorMessage(undefined, error)}</p>}
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading}>
                  {isLoading ? 'Logging in...' : 'Login'}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="signup">
              <form onSubmit={handleEmailPasswordSignUp} className="space-y-6 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName-signup">Display Name (Optional)</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input id="displayName-signup" type="text" placeholder="Your Name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="pl-10"/>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-signup">Email</Label>
                   <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input id="email-signup" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="pl-10"/>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-signup">Password</Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input id="password-signup" type="password" placeholder="Choose a strong password" value={password} onChange={(e) => setPassword(e.target.value)} required className="pl-10"/>
                  </div>
                </div>
                {error && <p className="text-sm text-destructive">{getFriendlyAuthErrorMessage(undefined, error)}</p>}
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading}>
                  {isLoading ? 'Signing up...' : 'Sign Up'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          
          <div className="my-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
          </div>

          <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isLoading}>
             <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor" data-ai-hint="google logo"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.13-3.13A11.944 11.944 0 0012 1 12.025 12.025 0 001.13 6.75l3.71 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /><path fill="none" d="M1 1h22v22H1z" /></svg>
            Google
          </Button>
        </CardContent>
        <CardFooter className="text-center text-sm">
          <p className="text-muted-foreground">
            By continuing, you agree to our Terms of Service.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
    

    



    
