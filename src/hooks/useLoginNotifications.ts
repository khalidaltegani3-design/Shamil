// Hook for automatic login failure notifications
import { useState, useEffect } from 'react';
import { NotificationService } from '@/lib/notification-service';

interface LoginAttempt {
  email: string;
  timestamp: Date;
  success: boolean;
  attempts: number;
}

export function useLoginNotifications() {
  const [loginAttempts, setLoginAttempts] = useState<Map<string, LoginAttempt>>(new Map());

  // Track login attempt
  const trackLoginAttempt = async (email: string, success: boolean) => {
    const now = new Date();
    const currentAttempts = loginAttempts.get(email) || {
      email,
      timestamp: now,
      success: false,
      attempts: 0
    };

    if (!success) {
      currentAttempts.attempts += 1;
      currentAttempts.timestamp = now;
      currentAttempts.success = false;

      // Send notification after 3 failed attempts
      if (currentAttempts.attempts >= 3) {
        try {
          await NotificationService.sendLoginIssueNotification(email, 1);
          console.log(`📧 Login issue notification sent to ${email}`);
        } catch (error) {
          console.error('Failed to send login notification:', error);
        }
      }
    } else {
      // Reset attempts on successful login
      currentAttempts.attempts = 0;
      currentAttempts.success = true;
    }

    setLoginAttempts(new Map(loginAttempts.set(email, currentAttempts)));
  };

  // Send immediate notification for critical login issues
  const sendCriticalLoginNotification = async (email: string, attemptsLeft: number) => {
    try {
      await NotificationService.sendLoginIssueNotification(email, attemptsLeft);
      console.log(`🚨 Critical login notification sent to ${email}`);
    } catch (error) {
      console.error('Failed to send critical login notification:', error);
    }
  };

  // Send password reset notification
  const sendPasswordResetNotification = async (email: string) => {
    try {
      await NotificationService.sendPasswordResetNotification(email);
      console.log(`🔑 Password reset notification sent to ${email}`);
    } catch (error) {
      console.error('Failed to send password reset notification:', error);
    }
  };

  // Get attempts for specific user
  const getUserAttempts = (email: string): LoginAttempt | undefined => {
    return loginAttempts.get(email);
  };

  // Clear attempts for user (after successful login)
  const clearUserAttempts = (email: string) => {
    const newAttempts = new Map(loginAttempts);
    newAttempts.delete(email);
    setLoginAttempts(newAttempts);
  };

  return {
    trackLoginAttempt,
    sendCriticalLoginNotification,
    sendPasswordResetNotification,
    getUserAttempts,
    clearUserAttempts
  };
}



