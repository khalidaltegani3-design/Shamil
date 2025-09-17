import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };

// FCM Token Management
export async function registerWebFcmToken(userId: string) {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }
  
  try {
    const messaging = getMessaging(app);
    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

    if (!vapidKey || vapidKey === "YOUR_VAPID_KEY_HERE") {
        console.warn("VAPID key for FCM is not set. Skipping token registration.");
        return;
    }
    
    // Request permission to receive notifications
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, { vapidKey: vapidKey });
      if (token) {
        console.log('FCM Token:', token);
        await setDoc(doc(db, "devices", token), {
          userId, 
          platform: "web", 
          createdAt: serverTimestamp(), 
          enabled: true
        }, { merge: true });
      } else {
        console.log('No registration token available. Request permission to generate one.');
      }
    } else {
      console.log('Unable to get permission to notify.');
    }

    // Handle incoming messages while the app is in the foreground
    onMessage(messaging, (payload) => {
        console.log('Message received. ', payload);
        // You can display a toast or a custom notification here
        // For example, using the app's `useToast` hook logic
    });

  } catch (error) {
    console.error('An error occurred while retrieving token. ', error);
  }
}
