// خدمة إنشاء المستخدمين مع معاملات Firebase
import { 
  createUserWithEmailAndPassword, 
  updateProfile, 
  UserCredential,
  User 
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  runTransaction, 
  getDoc,
  deleteDoc,
  writeBatch,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { checkEmployeeIdUniqueness } from './employee-utils';

export interface UserCreationData {
  name: string;
  email: string;
  password: string;
  employeeId?: string; // اختياري - يمكن للمدير إضافته لاحقاً
  homeDepartmentId: string;
}

export interface UserCreationResult {
  success: boolean;
  user?: User;
  error?: string;
  cleanupNeeded?: boolean;
}

export class UserCreationService {
  
  /**
   * إنشاء مستخدم جديد مع معاملة Firebase
   */
  static async createUserWithTransaction(userData: UserCreationData): Promise<UserCreationResult> {
    const { name, email, password, employeeId, homeDepartmentId } = userData;
    
    try {
      // التحقق من تفرد الرقم الوظيفي فقط إذا تم توفيره
      if (employeeId && employeeId.trim()) {
        const isUnique = await checkEmployeeIdUniqueness(employeeId.trim());
        if (!isUnique) {
          return {
            success: false,
            error: 'هذا الرقم الوظيفي مستخدم بالفعل. يرجى إدخال رقم وظيفي آخر.',
            cleanupNeeded: false
          };
        }
      }

      // إنشاء حساب Firebase Auth
      let userCredential: UserCredential;
      try {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      } catch (authError: any) {
        return {
          success: false,
          error: `فشل في إنشاء الحساب: ${authError.message}`,
          cleanupNeeded: false
        };
      }

      const user = userCredential.user;
      let authCleanupNeeded = false;

      try {
        // تحديث ملف التعريف
        await updateProfile(user, {
          displayName: name
        });

        // استخدام معاملة Firebase لحفظ بيانات المستخدم
        const result = await runTransaction(db, async (transaction) => {
          const userDocRef = doc(db, 'users', user.uid);
          
          // التحقق مرة أخرى من تفرد الرقم الوظيفي داخل المعاملة (فقط إذا تم توفيره)
          if (employeeId && employeeId.trim()) {
            const employeeIdQuery = await getDocs(
              query(collection(db, 'users'), where('employeeId', '==', employeeId.trim()))
            );
            
            if (!employeeIdQuery.empty) {
              throw new Error('الرقم الوظيفي مستخدم بالفعل');
            }
          }

          // إنشاء بيانات المستخدم
          const userData: any = {
            uid: user.uid,
            name: name.trim(),
            email: email.trim().toLowerCase(),
            homeDepartmentId,
            role: 'employee',
            createdAt: new Date(),
            isActive: true,
            emailVerified: false
          };
          
          // إضافة الرقم الوظيفي فقط إذا تم توفيره
          if (employeeId && employeeId.trim()) {
            userData.employeeId = employeeId.trim();
          }

          // حفظ بيانات المستخدم
          transaction.set(userDocRef, userData);
          
          return { success: true, userData };
        });

        // تسجيل الخروج من Firebase Auth
        await auth.signOut();

        return {
          success: true,
          user: user,
          error: undefined,
          cleanupNeeded: false
        };

      } catch (transactionError: any) {
        authCleanupNeeded = true;
        
        // محاولة حذف حساب Firebase Auth في حالة فشل المعاملة
        try {
          await user.delete();
        } catch (deleteError) {
          console.error('فشل في حذف حساب Firebase Auth:', deleteError);
        }

        return {
          success: false,
          error: `فشل في حفظ بيانات المستخدم: ${transactionError.message}`,
          cleanupNeeded: authCleanupNeeded
        };
      }

    } catch (error: any) {
      return {
        success: false,
        error: `خطأ غير متوقع: ${error.message}`,
        cleanupNeeded: false
      };
    }
  }

  /**
   * إنشاء مستخدم باستخدام Batch (بديل للمعاملة)
   */
  static async createUserWithBatch(userData: UserCreationData): Promise<UserCreationResult> {
    const { name, email, password, employeeId, homeDepartmentId } = userData;
    
    try {
      // التحقق من تفرد الرقم الوظيفي فقط إذا تم توفيره
      if (employeeId && employeeId.trim()) {
        const isUnique = await checkEmployeeIdUniqueness(employeeId.trim());
        if (!isUnique) {
          return {
            success: false,
            error: 'هذا الرقم الوظيفي مستخدم بالفعل. يرجى إدخال رقم وظيفي آخر.',
            cleanupNeeded: false
          };
        }
      }

      // إنشاء حساب Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      try {
        // تحديث ملف التعريف
        await updateProfile(user, {
          displayName: name
        });

        // استخدام Batch لحفظ البيانات
        const batch = writeBatch(db);
        
        const userDocRef = doc(db, 'users', user.uid);
        const userDocData: any = {
          uid: user.uid,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          homeDepartmentId,
          role: 'employee',
          createdAt: new Date(),
          isActive: true,
          emailVerified: false
        };
        
        // إضافة الرقم الوظيفي فقط إذا تم توفيره
        if (employeeId && employeeId.trim()) {
          userDocData.employeeId = employeeId.trim();
        }

        batch.set(userDocRef, userDocData);
        
        // حفظ الرقم الوظيفي في المجموعة الآمنة إذا تم توفيره
        if (employeeId && employeeId.trim()) {
          const employeeIdRef = doc(db, 'employeeIds', employeeId.trim());
          batch.set(employeeIdRef, {
            employeeId: employeeId.trim(),
            userId: user.uid,
            createdAt: new Date()
          });
        }
        
        // تنفيذ Batch
        await batch.commit();

        // تسجيل الخروج من Firebase Auth
        await auth.signOut();

        return {
          success: true,
          user: user,
          error: undefined,
          cleanupNeeded: false
        };

      } catch (batchError: any) {
        // حذف حساب Firebase Auth في حالة فشل Batch
        try {
          await user.delete();
        } catch (deleteError) {
          console.error('فشل في حذف حساب Firebase Auth:', deleteError);
        }

        return {
          success: false,
          error: `فشل في حفظ بيانات المستخدم: ${batchError.message}`,
          cleanupNeeded: true
        };
      }

    } catch (error: any) {
      return {
        success: false,
        error: `خطأ في إنشاء المستخدم: ${error.message}`,
        cleanupNeeded: false
      };
    }
  }

  /**
   * تنظيف البيانات المكررة أو الناقصة
   */
  static async cleanupDuplicateEmployeeIds(): Promise<{ cleaned: number; errors: string[] }> {
    try {
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      
      const employeeIdMap = new Map<string, any[]>();
      const errors: string[] = [];
      let cleaned = 0;

      // تجميع المستخدمين حسب الرقم الوظيفي
      usersSnapshot.docs.forEach(doc => {
        const data = doc.data();
        const employeeId = data.employeeId;
        
        if (employeeId) {
          if (!employeeIdMap.has(employeeId)) {
            employeeIdMap.set(employeeId, []);
          }
          employeeIdMap.get(employeeId)!.push({ id: doc.id, ...data });
        }
      });

      // البحث عن الأرقام المكررة
      for (const [employeeId, users] of employeeIdMap.entries()) {
        if (users.length > 1) {
          console.log(`🔍 وجد رقم وظيفي مكرر: ${employeeId} (${users.length} مستخدم)`);
          
          // الاحتفاظ بأحدث مستند مكتمل
          const validUsers = users.filter(user => 
            user.uid && user.email && user.name && user.role
          );
          
          if (validUsers.length > 0) {
            // ترتيب حسب تاريخ الإنشاء (الأحدث أولاً)
            validUsers.sort((a, b) => {
              const dateA = a.createdAt?.toDate?.() || new Date(0);
              const dateB = b.createdAt?.toDate?.() || new Date(0);
              return dateB.getTime() - dateA.getTime();
            });

            const keepUser = validUsers[0];
            const deleteUsers = validUsers.slice(1).concat(
              users.filter(user => !user.uid || !user.email || !user.name || !user.role)
            );

            // حذف المستخدمين المكررين أو الناقصين
            for (const deleteUser of deleteUsers) {
              try {
                await deleteDoc(doc(db, 'users', deleteUser.id));
                cleaned++;
                console.log(`✅ حذف مستخدم مكرر/ناقص: ${deleteUser.id}`);
              } catch (deleteError) {
                errors.push(`فشل في حذف المستخدم ${deleteUser.id}: ${deleteError}`);
              }
            }
          }
        }
      }

      return { cleaned, errors };
    } catch (error: any) {
      return {
        cleaned: 0,
        errors: [`خطأ في تنظيف البيانات: ${error.message}`]
      };
    }
  }

  /**
   * التحقق من سلامة قاعدة البيانات
   */
  static async checkDatabaseIntegrity(): Promise<{
    totalUsers: number;
    incompleteUsers: number;
    duplicateEmployeeIds: number;
    orphanedAuthAccounts: number;
    issues: string[];
  }> {
    try {
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      
      const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const issues: string[] = [];
      
      let incompleteUsers = 0;
      let duplicateEmployeeIds = 0;
      const employeeIdMap = new Map<string, number>();

      // فحص كل مستخدم
      users.forEach(user => {
        // فحص البيانات الناقصة
        if (!user.uid || !user.email || !user.name || !user.role || !user.employeeId) {
          incompleteUsers++;
          issues.push(`مستخدم ناقص البيانات: ${user.id} - ${user.email || 'لا يوجد بريد'}`);
        }

        // فحص الأرقام الوظيفية المكررة
        if (user.employeeId) {
          const count = employeeIdMap.get(user.employeeId) || 0;
          employeeIdMap.set(user.employeeId, count + 1);
        }
      });

      // حساب الأرقام المكررة
      for (const [employeeId, count] of employeeIdMap.entries()) {
        if (count > 1) {
          duplicateEmployeeIds += count - 1;
          issues.push(`رقم وظيفي مكرر: ${employeeId} (${count} مرات)`);
        }
      }

      return {
        totalUsers: users.length,
        incompleteUsers,
        duplicateEmployeeIds,
        orphanedAuthAccounts: 0, // يحتاج فحص Firebase Auth
        issues
      };
    } catch (error: any) {
      return {
        totalUsers: 0,
        incompleteUsers: 0,
        duplicateEmployeeIds: 0,
        orphanedAuthAccounts: 0,
        issues: [`خطأ في فحص قاعدة البيانات: ${error.message}`]
      };
    }
  }
}
