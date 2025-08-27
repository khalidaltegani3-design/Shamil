"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, KeyRound } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { app } from '@/lib/firebase';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from "firebase/auth";

// Define recaptcha verifier on the window object
declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier;
  }
}

export default function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  
  const [auth, setAuth] = useState<any>(null);
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const authInstance = getAuth(app);
    // For testing purposes, you can disable app verification.
    // In a production environment, you would not do this.
    authInstance.settings.appVerificationDisabledForTesting = true;
    setAuth(authInstance);
  }, []);
  
  useEffect(() => {
    if (!auth || !recaptchaContainerRef.current) return;

    if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, recaptchaContainerRef.current, {
            'size': 'invisible',
            'callback': (response: any) => {
              // reCAPTCHA solved, allow signInWithPhoneNumber.
            }
        });
    }
  }, [auth]);

  const handleSendCode = async () => {
    if (!auth) {
        toast({ variant: 'destructive', title: 'Firebase not initialized.'});
        return;
    }
    if (phoneNumber.length < 10) {
      toast({
        variant: 'destructive',
        title: 'Invalid Phone Number',
        description: 'Please enter a valid phone number with country code.',
      });
      return;
    }

    setIsLoading(true);
    try {
        const appVerifier = window.recaptchaVerifier;
        const result = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
        setConfirmationResult(result);
        toast({
            title: 'Code Sent!',
            description: 'A verification code has been sent to your phone.',
        });
    } catch (error) {
         console.error("Error sending verification code: ", error);
         toast({
            variant: 'destructive',
            title: 'Failed to Send Code',
            description: (error as Error).message || 'Could not send verification code. Please try again.',
        });
    } finally {
        setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!confirmationResult) {
        toast({ variant: 'destructive', title: 'Verification process not started.'});
        return;
    }
     if (verificationCode.length !== 6) {
      toast({
        variant: 'destructive',
        title: 'Invalid Code',
        description: 'Verification code must be 6 digits.',
      });
      return;
    }
    setIsLoading(true);
    try {
        await confirmationResult.confirm(verificationCode);
        toast({
            title: 'Success!',
            description: 'You have been successfully logged in.',
        });
        router.push('/chats');
    } catch(error) {
         console.error("Error verifying code: ", error);
         toast({
            variant: 'destructive',
            title: 'Verification Failed',
            description: 'The code you entered is incorrect. Please try again.',
        });
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background p-4">
      <div id="recaptcha-container" ref={recaptchaContainerRef}></div>
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome to Zoliapp</CardTitle>
          <CardDescription>
            {confirmationResult ? 'Enter the code sent to your phone.' : 'Enter your phone number to get started.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!confirmationResult ? (
            <div className="space-y-4">
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="tel"
                  placeholder="+1 123 456 7890"
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
          ) : (
             <div className="space-y-4">
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Verification Code"
                  className="pl-10"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <Button onClick={handleVerifyCode} className="w-full" disabled={isLoading}>
                {isLoading ? 'Verifying...' : 'Verify Code'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
