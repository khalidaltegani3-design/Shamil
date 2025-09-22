import { getApp, getApps, initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, getFirestore, Firestore } from 'firebase/firestore';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { getFunctions } from 'firebase/functions';
import { doc, getDoc, setDoc, serverTimestamp, collection, writeBatch } from 'firebase/firestore';
import { getStorage } from "firebase/storage";

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

// Initialize Firestore with enhanced error handling for App Hosting
let db: Firestore;
try {
  // Try to initialize with persistent cache
  if (typeof window !== 'undefined') {
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
      })
    });
    console.log('Firestore initialized with persistent cache');
  } else {
    // Server-side: use default Firestore without persistence
    db = getFirestore(app);
    console.log('Firestore initialized for server-side rendering');
  }
} catch (error) {
  // If initialization fails, fall back to default Firestore
  console.warn('Failed to initialize Firestore with persistence, using default:', error);
  try {
    db = getFirestore(app);
  } catch (fallbackError) {
    console.error('Critical: Failed to initialize Firestore:', fallbackError);
    throw new Error('Firebase Firestore initialization failed');
  }
}

const functions = getFunctions(app);
const storage = getStorage(app);

// دالة للتحقق من الاتصال بقاعدة البيانات مع معالجة أفضل للأخطاء
export async function pingDatabase() {
  try {
    // Simple connectivity test
    const testDoc = doc(db, '_health', 'status');
    
    // In production, just try to create a reference - don't read
    if (process.env.NODE_ENV === 'production') {
      console.log('Production environment: Database reference created successfully');
      return true;
    }
    
    // In development, perform actual read test
    const docSnap = await getDoc(testDoc);
    console.log('Database connection successful:', firebaseConfig.projectId);
    
    if (!docSnap.exists()) {
      console.log('Health document does not exist - normal for new databases');
    }
    
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

// إنشاء وثيقة حالة الاتصال مع معالجة محسنة للأخطاء
async function initializeHealthCheck() {
  // Skip health check in production builds to avoid unnecessary database calls
  if (process.env.NODE_ENV === 'production' && typeof window === 'undefined') {
    return;
  }
  
  try {
    const statusDoc = doc(db, '_health', 'status');
    const docSnap = await getDoc(statusDoc);
    
    if (docSnap.exists()) {
      console.log('Health check document exists:', docSnap.data());
    } else {
      console.log('Health check document does not exist - this is normal for new databases');
    }
  } catch (error) {
    console.warn('Health check read failed (normal if database is not set up):', error);
  }
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
    });

  } catch (error) {
    console.error('An error occurred while retrieving token. ', error);
  }
}
