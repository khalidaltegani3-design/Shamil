type PendingOperation = {
  id: string;
  operation: 'create' | 'update' | 'delete';
  collection: string;
  data: any;
  timestamp: number;
  retryCount: number;
};

class OfflineStorage {
  private static STORAGE_KEY = 'SHAMIL_OFFLINE_OPERATIONS';
  private static MAX_RETRIES = 5;

  static getPendingOperations(): PendingOperation[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  static addPendingOperation(operation: Omit<PendingOperation, 'id' | 'timestamp' | 'retryCount'>) {
    const pendingOps = this.getPendingOperations();
    const newOp: PendingOperation = {
      ...operation,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      retryCount: 0
    };
    pendingOps.push(newOp);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(pendingOps));
    return newOp.id;
  }

  static removePendingOperation(id: string) {
    const pendingOps = this.getPendingOperations();
    const filteredOps = pendingOps.filter(op => op.id !== id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredOps));
  }

  static updateOperationRetryCount(id: string) {
    const pendingOps = this.getPendingOperations();
    const updatedOps = pendingOps.map(op => {
      if (op.id === id) {
        return { ...op, retryCount: op.retryCount + 1 };
      }
      return op;
    });
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedOps));
  }

  static hasReachedMaxRetries(id: string): boolean {
    const pendingOps = this.getPendingOperations();
    const operation = pendingOps.find(op => op.id === id);
    return operation ? operation.retryCount >= this.MAX_RETRIES : false;
  }

  static clearAllPendingOperations() {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

export default OfflineStorage;