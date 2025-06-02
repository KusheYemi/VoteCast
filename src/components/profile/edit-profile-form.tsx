
"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { UserProfile } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { updateUserProfileAction } from '@/actions/profileActions';
import { useState } from 'react';
import { Loader2, User, Mail, Image as ImageIcon } from 'lucide-react';

const profileFormSchema = z.object({
  displayName: z.string().min(1, "Display name cannot be empty.").max(50, "Display name is too long.").optional(),
  photoURL: z.string().url("Please enter a valid URL for your photo.").or(z.literal("")).optional(),
  email: z.string().email().optional(), // Read-only, but include for form structure
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface EditProfileFormProps {
  currentUser: UserProfile;
}

export default function EditProfileForm({ currentUser }: EditProfileFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: currentUser.displayName || '',
      email: currentUser.email || '',
      photoURL: currentUser.photoURL || '',
    },
  });

  const { watch } = form;
  const currentPhotoUrl = watch('photoURL');
  const currentDisplayName = watch('displayName');


  const onSubmit = async (data: ProfileFormValues) => {
    setIsLoading(true);
    try {
      const updateData: { displayName?: string; photoURL?: string } = {};
      if (data.displayName !== currentUser.displayName) {
        updateData.displayName = data.displayName === "" ? null : data.displayName; // Allow unsetting
      }
      if (data.photoURL !== currentUser.photoURL) {
         updateData.photoURL = data.photoURL === "" ? null : data.photoURL; // Allow unsetting by providing empty string
      }

      if (Object.keys(updateData).length === 0) {
        toast({ title: "No Changes", description: "You haven't made any changes to your profile." });
        setIsLoading(false);
        return;
      }
      
      // Pass null if the field should be cleared
      const result = await updateUserProfileAction({
        userId: currentUser.uid,
        displayName: updateData.displayName === undefined ? undefined : (updateData.displayName || null),
        photoURL: updateData.photoURL === undefined ? undefined : (updateData.photoURL || null),
      });

      if (result.success) {
        toast({ title: "Profile Updated", description: "Your profile has been successfully updated." });
        // The AuthContext should pick up changes, or revalidatePath will refresh server components
      } else {
        toast({ title: "Update Failed", description: result.error || "Could not update your profile.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 mt-6">
      <div className="flex flex-col items-center space-y-4">
        <Avatar className="h-32 w-32 border-2 border-accent shadow-lg">
          <AvatarImage src={currentPhotoUrl || undefined} alt={currentDisplayName || "User avatar"} />
          <AvatarFallback className="text-4xl bg-muted text-muted-foreground">
            {getInitials(currentDisplayName || currentUser.displayName)}
          </AvatarFallback>
        </Avatar>
      </div>

      <div className="space-y-2">
        <Label htmlFor="displayName">Display Name</Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            id="displayName"
            className="pl-10"
            placeholder="Your Name"
            {...form.register('displayName')}
          />
        </div>
        {form.formState.errors.displayName && (
          <p className="text-sm text-destructive">{form.formState.errors.displayName.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="photoURL">Profile Picture URL</Label>
         <div className="relative">
          <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            id="photoURL"
            className="pl-10"
            type="url"
            placeholder="https://example.com/your-image.png"
            {...form.register('photoURL')}
          />
        </div>
        {form.formState.errors.photoURL && (
          <p className="text-sm text-destructive">{form.formState.errors.photoURL.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
         <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="email"
              className="pl-10 bg-muted/50 cursor-not-allowed"
              value={currentUser.email || ''}
              readOnly
              disabled
            />
        </div>
        <p className="text-xs text-muted-foreground">Email address cannot be changed here.</p>
      </div>

      <Button type="submit" className="w-full sm:w-auto float-right bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isLoading}>
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Save Changes
      </Button>
    </form>
  );
}
