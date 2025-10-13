// Firebase Error Handler for better error management
import { FirebaseError } from 'firebase/app';

export interface FirebaseErrorInfo {
  code: string;
  message: string;
  isRetryable: boolean;
  userFriendlyMessage: string;
  source: string; // مصدر الخطأ
}

const SYSTEM_NAME = 'نظام بلدية الريان';
const SYSTEM_DOMAIN = 'بلدية الريان';

export function handleFirebaseError(error: any): FirebaseErrorInfo {
  let errorInfo: FirebaseErrorInfo = {
    code: 'unknown',
    message: error?.message || 'Unknown error occurred',
    isRetryable: false,
    userFriendlyMessage: 'حدث خطأ غير متوقع في النظام',
    source: SYSTEM_NAME
  };

  if (error instanceof FirebaseError) {
    switch (error.code) {
      case 'firestore/failed-precondition':
      case 'firestore/unavailable':
        errorInfo = {
          code: error.code,
          message: error.message,
          isRetryable: true,
          userFriendlyMessage: `${SYSTEM_DOMAIN}: خدمة قاعدة البيانات غير متاحة مؤقتاً. يرجى المحاولة مرة أخرى.`,
          source: SYSTEM_NAME
        };
        break;
      
      case 'firestore/permission-denied':
        errorInfo = {
          code: error.code,
          message: error.message,
          isRetryable: false,
          userFriendlyMessage: `${SYSTEM_DOMAIN}: ليس لديك صلاحية للوصول إلى هذه البيانات`,
          source: SYSTEM_NAME
        };
        break;
      
      case 'auth/user-not-found':
        errorInfo = {
          code: error.code,
          message: error.message,
          isRetryable: false,
          userFriendlyMessage: `${SYSTEM_DOMAIN}: المستخدم غير موجود في النظام`,
          source: SYSTEM_NAME
        };
        break;
      
      case 'auth/wrong-password':
        errorInfo = {
          code: error.code,
          message: error.message,
          isRetryable: false,
          userFriendlyMessage: `${SYSTEM_DOMAIN}: كلمة المرور غير صحيحة`,
          source: SYSTEM_NAME
        };
        break;
      
      case 'auth/invalid-email':
        errorInfo = {
          code: error.code,
          message: error.message,
          isRetryable: false,
          userFriendlyMessage: `${SYSTEM_DOMAIN}: عنوان البريد الإلكتروني غير صحيح`,
          source: SYSTEM_NAME
        };
        break;
      
      case 'auth/user-disabled':
        errorInfo = {
          code: error.code,
          message: error.message,
          isRetryable: false,
          userFriendlyMessage: `${SYSTEM_DOMAIN}: تم تعطيل هذا الحساب`,
          source: SYSTEM_NAME
        };
        break;
      
      case 'auth/email-already-in-use':
        errorInfo = {
          code: error.code,
          message: error.message,
          isRetryable: false,
          userFriendlyMessage: `${SYSTEM_DOMAIN}: هذا البريد الإلكتروني مستخدم بالفعل`,
          source: SYSTEM_NAME
        };
        break;
      
      case 'auth/weak-password':
        errorInfo = {
          code: error.code,
          message: error.message,
          isRetryable: false,
          userFriendlyMessage: `${SYSTEM_DOMAIN}: كلمة المرور ضعيفة جداً. يجب أن تكون 6 أحرف على الأقل`,
          source: SYSTEM_NAME
        };
        break;
      
      case 'auth/too-many-requests':
        errorInfo = {
          code: error.code,
          message: error.message,
          isRetryable: true,
          userFriendlyMessage: `${SYSTEM_DOMAIN}: تم تجاوز الحد المسموح من المحاولات. يرجى الانتظار قليلاً ثم المحاولة مرة أخرى`,
          source: SYSTEM_NAME
        };
        break;
      
      case 'auth/network-request-failed':
        errorInfo = {
          code: error.code,
          message: error.message,
          isRetryable: true,
          userFriendlyMessage: `${SYSTEM_DOMAIN}: فشل في الاتصال بالإنترنت. يرجى التحقق من الاتصال والمحاولة مرة أخرى`,
          source: SYSTEM_NAME
        };
        break;
      
      case 'auth/invalid-credential':
        errorInfo = {
          code: error.code,
          message: error.message,
          isRetryable: false,
          userFriendlyMessage: `${SYSTEM_DOMAIN}: بيانات الاعتماد غير صحيحة`,
          source: SYSTEM_NAME
        };
        break;
      
      case 'auth/operation-not-allowed':
        errorInfo = {
          code: error.code,
          message: error.message,
          isRetryable: false,
          userFriendlyMessage: `${SYSTEM_DOMAIN}: هذه العملية غير مسموحة`,
          source: SYSTEM_NAME
        };
        break;
      
      default:
        errorInfo = {
          code: error.code,
          message: error.message,
          isRetryable: false,
          userFriendlyMessage: `${SYSTEM_DOMAIN}: حدث خطأ في النظام. يرجى المحاولة مرة أخرى`,
          source: SYSTEM_NAME
        };
    }
  }

  // Log error details for debugging (only in development)
  if (process.env.NODE_ENV === 'development') {
    console.error('System Error:', errorInfo);
  }

  return errorInfo;
}

export function isFirestoreLeaseError(error: any): boolean {
  return error?.message?.includes('Failed to obtain primary lease') ||
         error?.message?.includes('lease') ||
         error?.code === 'firestore/failed-precondition';
}

export function shouldRetryFirebaseOperation(error: any): boolean {
  const errorInfo = handleFirebaseError(error);
  return errorInfo.isRetryable;
}
