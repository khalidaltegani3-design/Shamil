
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleSendCode = () => {
    // Basic phone number validation
    if (phoneNumber.length < 10) {
      toast({
        variant: 'destructive',
        title: 'Invalid Phone Number',
        description: 'Please enter a valid phone number.',
      });
      return;
    }

    setIsLoading(true);
    // Placeholder for Firebase auth logic
    console.log(`Sending verification code to ${phoneNumber}`);
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: 'Code Sent!',
        description: 'A verification code has been sent to your phone.',
      });
      // Navigate to a verification page (to be created)
      // router.push('/verify'); 
    }, 2000);
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome to Zoliapp</CardTitle>
          <CardDescription>Enter your phone number to get started.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="tel"
                placeholder="Phone number"
                className="pl-10"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <Button onClick={handleSendCode} className="w-full" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send Verification Code'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
