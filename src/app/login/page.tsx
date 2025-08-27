
"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, KeyRound } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { app } from '@/lib/firebase';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult, type Auth } from "firebase/auth";

// Define recaptcha verifier on the window object
declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult;
  }
}

export default function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  
  const auth = getAuth(app);

  // This function sets up the reCAPTCHA verifier
  const setupRecaptcha = () => {
    // It is important to create a new verifier each time.
    return new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': (response: any) => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
          console.log("reCAPTCHA solved, ready to send code.");
        }
    });
  }

  const handleSendCode = async () => {
    if (phoneNumber.length < 10) {
      toast({
        variant: 'destructive',
        title: 'Invalid Phone Number',
        description: 'Please enter a valid phone number with country code.',
      });
      return;
    }

    setIsLoading(true);
    const appVerifier = setupRecaptcha();
    
    try {
      const result = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      
      // SMS sent. Prompt user to type the code from the message.
      setConfirmationResult(result);
      window.confirmationResult = result; // Persist in window object for robustness
      window.recaptchaVerifier = appVerifier;

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
      // It's important to render the verifier again if it fails.
      appVerifier.render().then((widgetId) => {
          // @ts-ignore
          if (window.grecaptcha) {
            // @ts-ignore
            window.grecaptcha.reset(widgetId);
          }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    // Prefer confirmationResult from state, but fallback to window object
    const result = confirmationResult || window.confirmationResult;
    if (!result) {
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
        await result.confirm(verificationCode);
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
      {/* The reCAPTCHA container, it will be invisible */}
      <div id="recaptcha-container"></div>
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
              <Button id="sign-in-button" onClick={handleSendCode} className="w-full" disabled={isLoading}>
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
                  maxLength={6}
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
