// خدمة لحذف أرقام وظيفية محددة من Firebase
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from './firebase';

export interface DeleteResult {
  success: boolean;
  deletedCount: number;
  errors: string[];
  deletedIds: string[];
}

export class EmployeeIdDeletionService {
  
  /**
   * التحقق من صلاحية المدير أو مدير النظام
   * @param userEmail - البريد الإلكتروني للمستخدم
   * @param userRole - دور المستخدم (admin أو system_admin)
   */
  static isAuthorized(userEmail: string | null | undefined, userRole?: string): boolean {
    const systemAdminEmail = "sweetdream711711@gmail.com";
    const normalizedUserEmail = userEmail?.toLowerCase();
    const normalizedAdminEmail = systemAdminEmail.toLowerCase();
    
    console.log('🔍 التحقق من الصلاحيات في الخدمة:');
    console.log(`المستخدم: ${normalizedUserEmail}`);
    console.log(`الدور: ${userRole}`);
    
    // السماح لمديري النظام والمديرين العامين
    const isSystemAdmin = normalizedUserEmail === normalizedAdminEmail;
    const isAdmin = userRole === 'admin' || userRole === 'system_admin';
    
    console.log(`مدير النظام: ${isSystemAdmin}, مدير: ${isAdmin}`);
    
    return isSystemAdmin || isAdmin;
  }
  
  /**
   * التحقق من صلاحية مدير النظام الأساسي فقط (للعمليات الحساسة)
   */
  static isSystemAdmin(userEmail: string | null | undefined): boolean {
    const systemAdminEmail = "sweetdream711711@gmail.com";
    const normalizedUserEmail = userEmail?.toLowerCase();
    const normalizedAdminEmail = systemAdminEmail.toLowerCase();
    
    return normalizedUserEmail === normalizedAdminEmail;
  }

  /**
   * حذف أرقام وظيفية محددة (محسن مع حذف مباشر للمستندات المعروفة)
   */
  static async deleteSpecificEmployeeIds(employeeIds: string[], userEmail?: string | null): Promise<DeleteResult> {
    // التحقق من الصلاحية
    if (!this.isSystemAdmin(userEmail)) {
      return {
        success: false,
        deletedCount: 0,
        errors: ["غير مصرح لك بتنفيذ هذه العملية. هذه الميزة مخصصة لمدير النظام الأساسي فقط."],
        deletedIds: []
      };
    }
    
    const result: DeleteResult = {
      success: true,
      deletedCount: 0,
      errors: [],
      deletedIds: []
    };

    try {
      console.log(`🔍 بدء حذف الأرقام الوظيفية: ${employeeIds.join(', ')}`);

      // المستندات المعروفة التي تحتوي على هذه الأرقام
      const knownDocuments = [
        '50FpCWLVbBSz1LTImKOqnrEZqIq1',
        '5EqobvsSnXQdczC2QJqtxxAVi8v2',
        '92nPVUm1HfdfBqgTOrDxgv67aJh2',
        'FJ0uXLs8yZgbZ4CJmLjiPRzhlJG3',
        'JqaQEBB03IUfFori9P16M5iR8q42',
        'SZ8WqUeXCFMryEdyOS4LlcYApn43',
        'WUbZ4BNXKbgHzBYuFgkPtzklFPk2',
        'ZeoLlXidbNTnMNFXrPWmkWpZe6s1',
        'fsuYV9NCdnNCDARuScMaoXTQ2Zm2',
        'i4DOWyPNtRVyB3b80EyxmUhqKsp2'
      ];

      // حذف المستندات المعروفة مباشرة
      for (const documentId of knownDocuments) {
        try {
          console.log(`🗑️ محاولة حذف المستند: ${documentId}`);
          await deleteDoc(doc(db, 'users', documentId));
          result.deletedCount++;
          result.deletedIds.push(documentId);
          console.log(`✅ تم حذف المستند ${documentId} بنجاح`);
        } catch (deleteError: any) {
          const errorMsg = `فشل في حذف المستند ${documentId}: ${deleteError.message}`;
          result.errors.push(errorMsg);
          result.success = false;
          console.error(`❌ ${errorMsg}`);
        }
      }

      // البحث الإضافي عن أي مستندات أخرى
      for (const employeeId of employeeIds) {
        try {
          console.log(`🔍 البحث الإضافي عن الرقم الوظيفي: ${employeeId}`);
          const usersRef = collection(db, 'users');
          const q = query(usersRef, where('employeeId', '==', employeeId));
          const querySnapshot = await getDocs(q);

          if (querySnapshot.empty) {
            console.log(`ℹ️ لم يتم العثور على مستندات إضافية للرقم الوظيفي: ${employeeId}`);
            continue;
          }

          // حذف أي مستندات إضافية وُجدت
          for (const docSnapshot of querySnapshot.docs) {
            try {
              console.log(`🗑️ حذف مستند إضافي: ${docSnapshot.id}`);
              await deleteDoc(doc(db, 'users', docSnapshot.id));
              result.deletedCount++;
              result.deletedIds.push(employeeId);
              console.log(`✅ تم حذف المستند الإضافي ${docSnapshot.id} للرقم الوظيفي: ${employeeId}`);
            } catch (deleteError: any) {
              const errorMsg = `فشل في حذف المستند الإضافي ${docSnapshot.id}: ${deleteError.message}`;
              result.errors.push(errorMsg);
              result.success = false;
              console.error(`❌ ${errorMsg}`);
            }
          }

        } catch (queryError: any) {
          const errorMsg = `فشل في البحث عن الرقم الوظيفي ${employeeId}: ${queryError.message}`;
          result.errors.push(errorMsg);
          result.success = false;
          console.error(`❌ ${errorMsg}`);
        }
      }

      console.log(`📊 النتيجة النهائية: تم حذف ${result.deletedCount} مستند`);
      if (result.errors.length > 0) {
        console.log(`⚠️ الأخطاء: ${result.errors.length}`);
        result.errors.forEach(error => console.log(`   - ${error}`));
      }

    } catch (error: any) {
      result.success = false;
      result.errors.push(`خطأ عام: ${error.message}`);
      console.error('❌ خطأ عام في عملية الحذف:', error);
    }

    return result;
  }

  /**
   * حذف الأرقام الوظيفية المحددة من قبل المستخدم
   */
  static async deleteUserSpecifiedIds(userEmail?: string | null): Promise<DeleteResult> {
    const employeeIdsToDelete = [
      '12012354',
      '12010906', 
      '12001376'
    ];

    console.log('🎯 بدء حذف الأرقام الوظيفية المحددة');
    console.log(`📋 الأرقام: ${employeeIdsToDelete.join(', ')}`);
    console.log(`👤 المستخدم: ${userEmail}`);

    return await this.deleteSpecificEmployeeIds(employeeIdsToDelete, userEmail);
  }

  /**
   * حذف مستندات محددة بمعرفاتها (للحذف الانتقائي)
   * يمكن للمديرين (admin) ومديري النظام (system_admin) استخدام هذه الوظيفة
   */
  static async deleteSpecificDocuments(documentIds: string[], userEmail?: string | null, userRole?: string): Promise<DeleteResult> {
    // التحقق من الصلاحية - السماح للمديرين ومديري النظام
    if (!this.isAuthorized(userEmail, userRole)) {
      return {
        success: false,
        deletedCount: 0,
        errors: ["غير مصرح لك بتنفيذ هذه العملية. هذه الميزة مخصصة للمديرين ومديري النظام فقط."],
        deletedIds: []
      };
    }
    
    const result: DeleteResult = {
      success: true,
      deletedCount: 0,
      errors: [],
      deletedIds: []
    };

    try {
      console.log(`🔍 بدء حذف ${documentIds.length} مستند محدد...`);

      for (const docId of documentIds) {
        try {
          console.log(`🗑️ محاولة حذف المستند: ${docId}`);
          await deleteDoc(doc(db, 'users', docId));
          result.deletedCount++;
          result.deletedIds.push(docId);
          console.log(`✅ تم حذف المستند ${docId} بنجاح`);
        } catch (deleteError: any) {
          const errorMsg = `فشل في حذف المستند ${docId}: ${deleteError.message}`;
          result.errors.push(errorMsg);
          result.success = false;
          console.error(`❌ ${errorMsg}`);
        }
      }

      console.log(`📊 النتيجة النهائية: تم حذف ${result.deletedCount} من أصل ${documentIds.length} مستند`);
      if (result.errors.length > 0) {
        console.log(`⚠️ الأخطاء: ${result.errors.length}`);
        result.errors.forEach(error => console.log(`   - ${error}`));
      }

    } catch (error: any) {
      result.success = false;
      result.errors.push(`خطأ عام: ${error.message}`);
      console.error('❌ خطأ عام في عملية الحذف:', error);
    }

    return result;
  }

  /**
   * البحث عن أرقام وظيفية محددة (بدون حذف) - محسن للبحث المتقدم
   */
  static async searchEmployeeIds(employeeIds: string[]): Promise<{
    found: { [key: string]: any[] };
    notFound: string[];
    allUsers: any[];
    debugInfo: string[];
  }> {
    const found: { [key: string]: any[] } = {};
    const notFound: string[] = [];
    const allUsers: any[] = [];
    const debugInfo: string[] = [];

    try {
      // أولاً: جلب جميع المستخدمين للفحص
      console.log('🔍 جلب جميع المستخدمين للفحص...');
      const usersRef = collection(db, 'users');
      const allUsersQuery = query(usersRef);
      const allUsersSnapshot = await getDocs(allUsersQuery);
      
      allUsersSnapshot.docs.forEach(doc => {
        const userData: any = { id: doc.id, ...doc.data() };
        allUsers.push(userData);
        
        // فحص كل رقم وظيفي
        const employeeId = userData.employeeId as string | undefined;
        if (employeeId) {
          debugInfo.push(`مستخدم ${doc.id}: employeeId = "${employeeId}" (نوع: ${typeof employeeId})`);
          
          // البحث بطرق مختلفة
          employeeIds.forEach(targetId => {
            if (employeeId === targetId || 
                String(employeeId) === targetId ||
                employeeId === targetId.toString() ||
                String(employeeId).trim() === targetId.trim()) {
              if (!found[targetId]) found[targetId] = [];
              found[targetId].push(userData);
            }
          });
        }
      });

      // تحديد الأرقام غير الموجودة
      employeeIds.forEach(employeeId => {
        if (!found[employeeId] || found[employeeId].length === 0) {
          notFound.push(employeeId);
        }
      });

      console.log(`📊 تم فحص ${allUsers.length} مستخدم`);
      console.log(`✅ وُجد ${Object.keys(found).length} رقم وظيفي`);
      console.log(`❌ لم يُوجد ${notFound.length} رقم وظيفي`);

    } catch (error: any) {
      console.error('❌ خطأ في البحث:', error);
      debugInfo.push(`خطأ في البحث: ${error.message}`);
    }

    return { found, notFound, allUsers, debugInfo };
  }
}
