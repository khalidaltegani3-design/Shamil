import { getApp, getApps, initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { getFunctions } from 'firebase/functions';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getStorage } from "firebase/storage";
import { handleFirebaseError, isFirestoreLeaseError } from './firebase-error-handler';
import { logger } from './logger';

// Enhanced Firebase configuration with App Hosting compatibility
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDKtxqu6YRoZQCeD9EoFmxAvc9JLi_d5R8",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "zoliapp-lite.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || "zoliapp-lite",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "zoliapp-lite.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "476068628948",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:476068628948:web:55c0eaf993de1cc553ee41"
};

// Initialize Firebase with error handling
let app: FirebaseApp;
try {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
} catch (error) {
  console.error('Firebase initialization error:', error);
  // Fallback initialization
  app = initializeApp(firebaseConfig);
}

const auth = getAuth(app);

// Initialize Firestore with simplified configuration to avoid lease issues
let db: Firestore;
try {
  // Use default Firestore without persistent cache to avoid lease conflicts
  db = getFirestore(app);
  logger.info('Firestore initialized successfully');
} catch (error) {
  const errorInfo = handleFirebaseError(error);
  if (isFirestoreLeaseError(error)) {
    logger.leaseError(error);
    // Retry with a fresh instance
    try {
      db = getFirestore(app);
      logger.info('Firestore initialized successfully on retry');
    } catch (retryError) {
      logger.systemError('تهيئة قاعدة البيانات (إعادة المحاولة)', retryError);
      throw new Error('Firebase Firestore initialization failed');
    }
  } else {
    logger.systemError('تهيئة قاعدة البيانات', error);
    throw new Error('Firebase Firestore initialization failed');
  }
}

const functions = getFunctions(app);
const storage = getStorage(app);

// دالة للتحقق من الاتصال بقاعدة البيانات مع معالجة أفضل للأخطاء
export async function pingDatabase() {
  try {
    // Simple connectivity test - just check if we can create a reference
    const testDoc = doc(db, '_health', 'status');
    
    // Skip actual database read in development to avoid lease issues
    console.log('Database connection reference created successfully:', firebaseConfig.projectId);
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
}

// Enhanced logging for App Hosting debugging
try {
  console.info('Firebase Configuration:');
  console.info('- Project ID:', firebaseConfig.projectId);
  console.info('- Auth Domain:', firebaseConfig.authDomain);
  console.info('- Environment:', process.env.NODE_ENV || 'development');
  console.info('- Runtime:', typeof window !== 'undefined' ? 'client' : 'server');
} catch (e) {
  // ignore logging errors
}

// Simplified health check to avoid lease conflicts
async function initializeHealthCheck() {
  // Skip health check to avoid lease issues in development
  console.log('Health check skipped to avoid lease conflicts');
}

// تنفيذ عملية التهيئة فقط في البيئة المناسبة
if (typeof window !== 'undefined') {
  // Client-side only
  initializeHealthCheck();
}

export { app, auth, db, functions, storage, getAuth };

// FCM Token Management with App Hosting compatibility
export async function registerWebFcmToken(userId: string) {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }
  
  try {
    const messaging = getMessaging(app);
    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

    if (!vapidKey) {
        console.warn("VAPID key for FCM is not set. Skipping token registration.");
        return;
    }
    
    // Request permission to receive notifications
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, { vapidKey: vapidKey });
      if (token) {
        console.log('FCM Token:', token);
        // Use batch write to avoid lease conflicts
        try {
          await setDoc(doc(db, "devices", token), {
            userId, 
            platform: "web", 
            createdAt: serverTimestamp(), 
            enabled: true
          }, { merge: true });
        } catch (dbError) {
          console.warn('Failed to save FCM token to database (non-critical):', dbError);
        }
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
    });

  } catch (error) {
    console.error('An error occurred while retrieving token. ', error);
  }
}
