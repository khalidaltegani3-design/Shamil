import { db } from './firebase';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import OfflineStorage from './offline-storage';

type RetryConfig = {
  maxAttempts: number;
  initialDelay: number;
  maxDelay: number;
};

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 5,
  initialDelay: 1000,
  maxDelay: 30000,
};

class DatabaseManager {
  private static retryConfig: RetryConfig = DEFAULT_RETRY_CONFIG;

  private static async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private static getBackoffDelay(attempt: number): number {
    const { initialDelay, maxDelay } = this.retryConfig;
    const delay = Math.min(
      initialDelay * Math.pow(2, attempt),
      maxDelay
    );
    return delay + (Math.random() * 1000); // Add jitter
  }

  static async executeWithRetry<T>(
    operation: () => Promise<T>,
    customConfig?: Partial<RetryConfig>
  ): Promise<T> {
    const config = { ...this.retryConfig, ...customConfig };
    let lastError: any;
    
    for (let attempt = 0; attempt < config.maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error: any) {
        lastError = error;
        
        // لا نحاول مجدداً إذا كان الخطأ متعلقاً بالصلاحيات
        if (error.code === 'permission-denied') {
          throw new Error('ليس لديك صلاحية للقيام بهذه العملية');
        }

        if (attempt === config.maxAttempts - 1) {
          throw new Error('فشل الاتصال بقاعدة البيانات بعد عدة محاولات');
        }

        const delay = this.getBackoffDelay(attempt);
        await this.delay(delay);
      }
    }

    throw lastError;
  }

  static async safeRead<T>(
    collectionPath: string,
    docId: string
  ): Promise<T | null> {
    return this.executeWithRetry(async () => {
      const docRef = doc(db, collectionPath, docId);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? (docSnap.data() as T) : null;
    });
  }

  static async safeWrite(
    collectionPath: string,
    docId: string,
    data: any
  ): Promise<void> {
    try {
      await this.executeWithRetry(async () => {
        await setDoc(doc(db, collectionPath, docId), {
          ...data,
          updatedAt: new Date(),
        }, { merge: true });
      });
    } catch (error) {
      // تخزين العملية محلياً إذا فشل الاتصال
      OfflineStorage.addPendingOperation({
        operation: 'update',
        collection: collectionPath,
        data: { id: docId, ...data }
      });
      throw error;
    }
  }

  static async safeDelete(
    collectionPath: string,
    docId: string
  ): Promise<void> {
    try {
      await this.executeWithRetry(async () => {
        await deleteDoc(doc(db, collectionPath, docId));
      });
    } catch (error) {
      OfflineStorage.addPendingOperation({
        operation: 'delete',
        collection: collectionPath,
        data: { id: docId }
      });
      throw error;
    }
  }

  static async processPendingOperations(): Promise<void> {
    const pendingOps = OfflineStorage.getPendingOperations();
    
    for (const op of pendingOps) {
      try {
        switch (op.operation) {
          case 'create':
          case 'update':
            await this.safeWrite(op.collection, op.data.id, op.data);
            break;
          case 'delete':
            await this.safeDelete(op.collection, op.data.id);
            break;
        }
        OfflineStorage.removePendingOperation(op.id);
      } catch (error) {
        if (!OfflineStorage.hasReachedMaxRetries(op.id)) {
          OfflineStorage.updateOperationRetryCount(op.id);
        } else {
          // إزالة العملية بعد تجاوز الحد الأقصى للمحاولات
          OfflineStorage.removePendingOperation(op.id);
          console.error(`Operation ${op.id} failed after max retries`);
        }
      }
    }
  }
}

export default DatabaseManager;