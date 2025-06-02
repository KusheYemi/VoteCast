"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { UserProfile } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { updateUserProfileAction } from "@/actions/profileActions";
import React, { useState, useEffect } from "react";
import { Loader2, User, Mail, UploadCloud, X, Camera } from "lucide-react";
import { storage } from "@/lib/firebase"; // Import Firebase storage instance
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

const profileFormSchema = z.object({
  displayName: z
    .string()
    .min(1, "Display name cannot be empty.")
    .max(50, "Display name is too long.")
    .optional(),
  // photoURL is removed from schema as it's handled by file upload
  email: z.string().email().optional(), // Read-only, but include for form structure
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface EditProfileFormProps {
  currentUser: UserProfile;
}

export default function EditProfileForm({ currentUser }: EditProfileFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(
    currentUser.photoURL || null
  );
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: currentUser.displayName || "",
      email: currentUser.email || "",
    },
  });

  const { watch, setValue } = form;
  const currentDisplayName = watch("displayName");

  useEffect(() => {
    // Update image preview if currentUser.photoURL changes (e.g., after successful update)
    if (!selectedFile) {
      // Only update if no new file is selected, otherwise preview shows selected file
      setImagePreviewUrl(currentUser.photoURL || null);
    }
    setValue("displayName", currentUser.displayName || ""); // Keep form in sync
  }, [currentUser.photoURL, currentUser.displayName, selectedFile, setValue]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast({
          title: "File Too Large",
          description: "Please select an image smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));
    } else {
      setSelectedFile(null);
      // If no file is selected, and we had a preview from a new file, revert to current user photo or null
      setImagePreviewUrl(currentUser.photoURL || null);
    }
  };

  const handleRemoveImage = async () => {
    setIsLoading(true);
    try {
      // Optionally: Delete from Firebase Storage if it's a stored image
      if (
        currentUser.photoURL &&
        currentUser.photoURL.includes("firebasestorage.googleapis.com")
      ) {
        const photoRef = ref(storage, currentUser.photoURL);
        try {
          await deleteObject(photoRef);
        } catch (storageError: any) {
          // If file doesn't exist or other storage error, it might not be critical for removal of URL from profile
          console.warn(
            "Could not delete old image from storage, it might have already been removed:",
            storageError.code
          );
        }
      }

      const result = await updateUserProfileAction({
        userId: currentUser.uid,
        displayName: currentUser.displayName, // Keep current display name
        photoURL: null, // Explicitly set to null to remove
      });

      if (result.success) {
        toast({
          title: "Profile Picture Removed",
          description: "Your profile picture has been removed.",
        });
        setSelectedFile(null);
        setImagePreviewUrl(null);
      } else {
        toast({
          title: "Removal Failed",
          description: result.error || "Could not remove profile picture.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred while removing the image.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: ProfileFormValues) => {
    setIsLoading(true);
    setIsUploading(selectedFile ? true : false);

    let newPhotoURL: string | null | undefined = currentUser.photoURL; // Default to existing, can be undefined

    try {
      if (selectedFile) {
        const filePath = `users_profile_pics/${currentUser.uid}/${selectedFile.name}`;
        const storageRef = ref(storage, filePath);
        await uploadBytes(storageRef, selectedFile);
        newPhotoURL = await getDownloadURL(storageRef);
        setIsUploading(false);
      }

      const updatePayload: {
        userId: string;
        displayName?: string | null;
        photoURL?: string | null;
      } = {
        userId: currentUser.uid,
      };

      let hasChanges = false;

      if (data.displayName !== currentUser.displayName) {
        updatePayload.displayName =
          data.displayName === "" ? null : data.displayName;
        hasChanges = true;
      }

      // Only update photoURL if a new file was uploaded or explicitly removed
      // The 'handleRemoveImage' function handles explicit removal.
      // Here, we only care if a new file resulted in a newPhotoURL.
      if (selectedFile && newPhotoURL !== currentUser.photoURL) {
        updatePayload.photoURL = newPhotoURL;
        hasChanges = true;
      } else if (
        !selectedFile &&
        data.displayName !== currentUser.displayName
      ) {
        // Only display name changed, photoURL remains as is (could be null or existing)
        // No need to set updatePayload.photoURL here, it will retain its current value unless explicitly changed
      }

      if (!hasChanges && !selectedFile) {
        toast({
          title: "No Changes",
          description: "You haven't made any changes to your profile.",
        });
        setIsLoading(false);
        return;
      }

      const result = await updateUserProfileAction({
        userId: currentUser.uid,
        displayName:
          updatePayload.displayName !== undefined
            ? updatePayload.displayName
            : currentUser.displayName,
        photoURL:
          updatePayload.photoURL !== undefined
            ? updatePayload.photoURL
            : currentUser.photoURL,
      });

      if (result.success) {
        toast({
          title: "Profile Updated",
          description: "Your profile has been successfully updated.",
        });
        setSelectedFile(null); // Clear selected file after successful upload
        if (newPhotoURL) setImagePreviewUrl(newPhotoURL); // Update preview to the uploaded image
      } else {
        toast({
          title: "Update Failed",
          description: result.error || "Could not update your profile.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
      if (selectedFile) setIsUploading(false);
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 mt-6">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative group">
          <Avatar className="h-32 w-32 border-2 border-accent shadow-lg">
            <AvatarImage
              src={imagePreviewUrl || undefined}
              alt={currentDisplayName || "User avatar"}
            />
            <AvatarFallback className="text-4xl bg-muted text-muted-foreground">
              {getInitials(currentDisplayName || currentUser.displayName)}
            </AvatarFallback>
          </Avatar>
          {/* Upload Button Overlay */}
          <button
            type="button"
            onClick={() => document.getElementById("photoUpload")?.click()}
            className="absolute bottom-2 right-2 bg-accent text-accent-foreground rounded-full p-2 shadow-lg border-2 border-background hover:bg-accent/90 transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
            aria-label="Change profile picture"
            disabled={isLoading || isUploading}
          >
            <Camera className="h-5 w-5" />
          </button>
          {/* Remove Button Overlay */}
          {imagePreviewUrl && (
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 shadow border-2 border-background hover:bg-destructive/80 transition-colors focus:outline-none focus:ring-2 focus:ring-destructive"
              aria-label="Remove profile picture"
              disabled={isLoading || isUploading}
            >
              <X className="h-4 w-4" />
            </button>
          )}
          {/* Visually hidden file input */}
          <input
            id="photoUpload"
            type="file"
            accept="image/png, image/jpeg, image/gif, image/webp"
            onChange={handleFileChange}
            className="hidden"
            disabled={isLoading || isUploading}
          />
        </div>
        {isUploading && (
          <p className="text-sm text-muted-foreground text-center">
            Uploading image...
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="displayName">Display Name</Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            id="displayName"
            className="pl-10"
            placeholder="Your Name"
            {...form.register("displayName")}
            disabled={isLoading}
          />
        </div>
        {form.formState.errors.displayName && (
          <p className="text-sm text-destructive">
            {form.formState.errors.displayName.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            id="email"
            className="pl-10 bg-muted/50 cursor-not-allowed"
            value={currentUser.email || ""}
            readOnly
            disabled
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Email address cannot be changed here.
        </p>
      </div>

      <Button
        type="submit"
        className="w-full sm:w-auto float-right bg-accent hover:bg-accent/90 text-accent-foreground"
        disabled={isLoading || isUploading}
      >
        {isLoading || isUploading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : null}
        Save Changes
      </Button>
    </form>
  );
}
