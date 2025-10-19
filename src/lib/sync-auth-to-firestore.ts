// خدمة مزامنة مستخدمي Firebase Auth إلى Firestore
import { collection, doc, setDoc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  emailVerified: boolean;
  createdAt: string;
}

export interface SyncResult {
  success: boolean;
  synced: number;
  skipped: number;
  errors: string[];
  syncedUsers: AuthUser[];
}

export class AuthFirestoreSync {
  
  /**
   * مزامنة مستخدم واحد من Auth إلى Firestore
   */
  static async syncSingleUser(authUser: AuthUser): Promise<{ success: boolean; error?: string }> {
    try {
      const userDocRef = doc(db, 'users', authUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        console.log(`✅ المستخدم ${authUser.email} موجود بالفعل في Firestore`);
        return { success: true };
      }
      
      // إنشاء مستند جديد للمستخدم
      const userData = {
        uid: authUser.uid,
        email: authUser.email || '',
        displayName: authUser.displayName || authUser.email?.split('@')[0] || 'مستخدم',
        name: authUser.displayName || authUser.email?.split('@')[0] || 'مستخدم',
        role: 'employee', // الدور الافتراضي
        status: 'active',
        createdAt: new Date(authUser.createdAt),
        emailVerified: authUser.emailVerified,
        isActive: true,
        homeDepartmentId: '', // سيتم تحديده لاحقاً
        employeeId: '', // سيتم تحديده لاحقاً
        syncedFromAuth: true,
        syncedAt: new Date()
      };
      
      await setDoc(userDocRef, userData);
      console.log(`✅ تم مزامنة المستخدم ${authUser.email} إلى Firestore`);
      
      return { success: true };
    } catch (error: any) {
      console.error(`❌ فشل في مزامنة المستخدم ${authUser.email}:`, error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * مزامنة جميع المستخدمين من Auth إلى Firestore
   * ملاحظة: هذه الدالة تحتاج إلى قائمة المستخدمين من Auth
   * يجب استدعاؤها من واجهة المستخدم بعد جلب المستخدمين
   */
  static async syncAllUsers(authUsers: AuthUser[]): Promise<SyncResult> {
    const result: SyncResult = {
      success: true,
      synced: 0,
      skipped: 0,
      errors: [],
      syncedUsers: []
    };
    
    console.log(`🔄 بدء مزامنة ${authUsers.length} مستخدم من Auth إلى Firestore...`);
    
    for (const authUser of authUsers) {
      try {
        const syncResult = await this.syncSingleUser(authUser);
        
        if (syncResult.success) {
          // التحقق إذا كان المستخدم موجود مسبقاً أم تم إنشاؤه
          const userDoc = await getDoc(doc(db, 'users', authUser.uid));
          if (userDoc.exists() && !userDoc.data().syncedFromAuth) {
            result.skipped++;
          } else {
            result.synced++;
            result.syncedUsers.push(authUser);
          }
        } else {
          result.errors.push(`${authUser.email}: ${syncResult.error}`);
          result.success = false;
        }
      } catch (error: any) {
        result.errors.push(`${authUser.email}: ${error.message}`);
        result.success = false;
      }
    }
    
    console.log(`📊 نتائج المزامنة:`);
    console.log(`   ✅ تم المزامنة: ${result.synced}`);
    console.log(`   ⏭️ تم التخطي: ${result.skipped}`);
    console.log(`   ❌ أخطاء: ${result.errors.length}`);
    
    return result;
  }
  
  /**
   * التحقق من المستخدمين المفقودين (موجودين في Auth لكن ليس في Firestore)
   */
  static async findMissingUsers(authUsers: AuthUser[]): Promise<AuthUser[]> {
    const missingUsers: AuthUser[] = [];
    
    for (const authUser of authUsers) {
      try {
        const userDoc = await getDoc(doc(db, 'users', authUser.uid));
        if (!userDoc.exists()) {
          missingUsers.push(authUser);
        }
      } catch (error) {
        console.error(`خطأ في التحقق من المستخدم ${authUser.email}:`, error);
      }
    }
    
    console.log(`🔍 تم العثور على ${missingUsers.length} مستخدم مفقود في Firestore`);
    return missingUsers;
  }
  
  /**
   * جلب جميع المستخدمين من Firestore
   */
  static async getAllFirestoreUsers(): Promise<any[]> {
    try {
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('خطأ في جلب المستخدمين من Firestore:', error);
      return [];
    }
  }
}




