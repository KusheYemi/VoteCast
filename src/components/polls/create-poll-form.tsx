
"use client";

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createPollAction } from '@/actions/pollActions';
import { useToast } from "@/hooks/use-toast";
import { XCircle, PlusCircle } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

export default function CreatePollForm() {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    if (options.length < 10) { 
      setOptions([...options, '']);
    } else {
      toast({ title: "Option Limit", description: "Maximum 10 options allowed.", variant: "default" });
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) { 
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    } else {
      toast({ title: "Option Minimum", description: "At least 2 options are required.", variant: "default" });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!user) {
      toast({ title: "Authentication Error", description: "You must be logged in to create a poll.", variant: "destructive" });
      setIsLoading(false);
      return;
    }

    const validOptions = options.map(opt => opt.trim()).filter(opt => opt !== '');
    if (validOptions.length < 2) {
      toast({ title: "Validation Error", description: "Please provide at least two valid options.", variant: "destructive" });
      setIsLoading(false);
      return;
    }
    if (!question.trim()) {
      toast({ title: "Validation Error", description: "Question cannot be empty.", variant: "destructive" });
      setIsLoading(false);
      return;
    }
     if (new Set(validOptions.map(opt => opt.toLowerCase())).size !== validOptions.length) {
      toast({ title: "Validation Error", description: "Options must be unique.", variant: "destructive" });
      setIsLoading(false);
      return;
    }

    const userDisplayName = user.displayName || user.email || 'Anonymous';

    const result = await createPollAction({ 
      question, 
      options: validOptions, 
      userId: user.uid, 
      userDisplayName 
    });

    if (result.success && result.pollId) {
      toast({ title: "Poll Created!", description: "Your poll is now live." });
      router.push(`/polls/${result.pollId}`);
    } else {
      toast({ title: "Error Creating Poll", description: result.error || "An unknown error occurred.", variant: "destructive" });
    }
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      <div>
        <Label htmlFor="question" className="text-lg font-medium">Poll Question</Label>
        <Textarea
          id="question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="What's your favorite color?"
          required
          className="mt-2 min-h-[100px] text-base"
        />
      </div>

      <div>
        <Label className="text-lg font-medium">Options</Label>
        <div className="space-y-3 mt-2">
          {options.map((option, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                type="text"
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                placeholder={`Option ${index + 1}`}
                required
                className="text-base"
              />
              {options.length > 2 && (
                <Button type="button" variant="ghost" size="icon" onClick={() => removeOption(index)} aria-label="Remove option">
                  <XCircle className="h-5 w-5 text-destructive" />
                </Button>
              )}
            </div>
          ))}
        </div>
        <Button type="button" variant="outline" onClick={addOption} className="mt-3 text-sm" disabled={options.length >= 10}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Option
        </Button>
      </div>

      <Button type="submit" className="w-full sm:w-auto text-base py-3 px-6 bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isLoading || !user}>
        {isLoading ? 'Creating Poll...' : 'Create Poll'}
      </Button>
    </form>
  );
}
