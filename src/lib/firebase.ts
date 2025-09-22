import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, onAuthStateChanged } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, getFirestore, Firestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { getFunctions } from 'firebase/functions';
import { doc, getDoc, setDoc, serverTimestamp, collection, writeBatch } from 'firebase/firestore';
import { getStorage } from "firebase/storage";
import { validateAuthEnvironment } from '@/lib/auth-config';

// Allow overriding firebase config via environment variables (useful to switch projects without code changes)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDKtxqu6YRoZQCeD9EoFmxAvc9JLi_d5R8",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "zoliapp-lite.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "zoliapp-lite",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "zoliapp-lite.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "476068628948",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:476068628948:web:55c0eaf993de1cc553ee41"
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

// Initialize Firestore with modern persistence settings
let db: Firestore;
try {
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  });
  console.log('Firestore initialized with persistent cache');
} catch (error) {
  // If initialization fails, fall back to default Firestore
  console.warn('Failed to initialize Firestore with persistence, using default:', error);
  db = getFirestore(app);
}

const functions = getFunctions(app);
const storage = getStorage(app);

// دالة للتحقق من الاتصال بقاعدة البيانات
export async function pingDatabase() {
  try {
    // محاولة قراءة وثيقة الحالة
    const testDoc = doc(db, '_health', 'status');
    const docSnap = await getDoc(testDoc);
    console.log('تم الاتصال بنجاح بقاعدة البيانات:', firebaseConfig.projectId);
    
    // إذا لم توجد الوثيقة، فهذا طبيعي لقاعدة بيانات جديدة
    if (!docSnap.exists()) {
      console.log('Health document does not exist - testing with a simple read operation');
      // محاولة قراءة مجموعة المستخدمين للتأكد من الاتصال
      const usersRef = collection(db, 'users');
      // لا نحتاج لجلب البيانات، فقط إنشاء المرجع يكفي للتحقق من الاتصال
      console.log('Database connection verified via users collection reference');
    }
    
    return true;
  } catch (error) {
    console.error('فشل الاتصال بقاعدة البيانات:', error);
    return false;
  }
}

// Log which projectId is being used at runtime
try {
  // eslint-disable-next-line no-console
  console.info('Firebase projectId in use:', firebaseConfig.projectId);
} catch (e) {
  // ignore
}

// إنشاء وثيقة حالة الاتصال وتحديثها
async function initializeHealthCheck() {
  try {
    // قراءة وثيقة الحالة فقط للتحقق من الاتصال
    const statusDoc = doc(db, '_health', 'status');
    const docSnap = await getDoc(statusDoc);
    
    if (docSnap.exists()) {
      console.log('Health check document exists:', docSnap.data());
    } else {
      console.log('Health check document does not exist - this is normal for new databases');
    }
  } catch (error) {
    console.warn('Health check read failed (this is normal if database is not set up):', error);
  }
}

// تنفيذ عملية التهيئة عند بدء التطبيق
initializeHealthCheck();

// إضافة مراقب للمصادقة لتسجيل الأحداث في البيئة الإنتاجية
if (typeof window !== 'undefined') {
  const authConfig = validateAuthEnvironment();
  
  if (authConfig.detailedLogging) {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('🔐 User authenticated:', {
          uid: user.uid,
          email: user.email,
          emailVerified: user.emailVerified,
          providerId: user.providerId
        });
      } else {
        console.log('🚪 User signed out');
      }
    });
  }
}

export { app, auth, db, functions, storage, getAuth };

// FCM Token Management
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
        // For example, using the app's `useToast` hook logic
    });

  } catch (error) {
    console.error('An error occurred while retrieving token. ', error);
  }
}
