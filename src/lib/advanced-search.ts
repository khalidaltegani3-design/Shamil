// أداة بحث متقدمة للعثور على الأرقام الوظيفية
import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import { db } from './firebase';

export interface SearchResult {
  collection: string;
  documents: any[];
  totalCount: number;
}

export class AdvancedSearchService {
  
  /**
   * البحث في جميع المجموعات عن الأرقام الوظيفية
   */
  static async searchAllCollections(employeeIds: string[]): Promise<{
    results: SearchResult[];
    summary: {
      totalCollections: number;
      totalDocuments: number;
      foundIds: string[];
      notFoundIds: string[];
    };
  }> {
    const collectionsToSearch = [
      'users',
      'employeeIds', 
      'employees',
      'staff',
      'accounts',
      'profiles'
    ];

    const results: SearchResult[] = [];
    const foundIds: Set<string> = new Set();
    const notFoundIds: Set<string> = new Set(employeeIds);

    console.log('🔍 بدء البحث المتقدم في جميع المجموعات...');
    console.log(`📋 الأرقام المطلوب البحث عنها: ${employeeIds.join(', ')}`);
    console.log(`📁 المجموعات المراد فحصها: ${collectionsToSearch.join(', ')}`);

    for (const collectionName of collectionsToSearch) {
      try {
        console.log(`\n🔎 فحص مجموعة: ${collectionName}`);
        const collectionRef = collection(db, collectionName);
        
        // محاولة جلب أول 100 مستند من كل مجموعة
        const q = query(collectionRef, limit(100));
        const querySnapshot = await getDocs(q);
        
        console.log(`📊 وُجد ${querySnapshot.docs.length} مستند في ${collectionName}`);
        
        const documents: any[] = [];
        const collectionFoundIds: Set<string> = new Set();

        querySnapshot.docs.forEach((doc) => {
          const data = { id: doc.id, ...doc.data() };
          documents.push(data);
          
          // البحث عن الأرقام الوظيفية في كل مستند
          employeeIds.forEach(targetId => {
            if (this.searchInDocument(data, targetId)) {
              collectionFoundIds.add(targetId);
              foundIds.add(targetId);
              notFoundIds.delete(targetId);
              console.log(`✅ وُجد ${targetId} في ${collectionName}/${doc.id}`);
            }
          });
        });

        if (documents.length > 0) {
          results.push({
            collection: collectionName,
            documents,
            totalCount: querySnapshot.docs.length
          });
        }

        console.log(`✅ انتهى فحص ${collectionName}: وُجد ${collectionFoundIds.size} رقم وظيفي`);

      } catch (error: any) {
        console.log(`❌ خطأ في فحص ${collectionName}: ${error.message}`);
        // تجاهل الأخطاء والمتابعة
      }
    }

    const summary = {
      totalCollections: results.length,
      totalDocuments: results.reduce((sum, result) => sum + result.totalCount, 0),
      foundIds: Array.from(foundIds),
      notFoundIds: Array.from(notFoundIds)
    };

    console.log('\n📊 ملخص البحث:');
    console.log(`📁 المجموعات المفحوصة: ${summary.totalCollections}`);
    console.log(`📄 إجمالي المستندات: ${summary.totalDocuments}`);
    console.log(`✅ الأرقام الموجودة: ${summary.foundIds.length} - ${summary.foundIds.join(', ')}`);
    console.log(`❌ الأرقام غير الموجودة: ${summary.notFoundIds.length} - ${summary.notFoundIds.join(', ')}`);

    return { results, summary };
  }

  /**
   * البحث في مستند واحد عن رقم وظيفي
   */
  private static searchInDocument(data: any, targetId: string): boolean {
    // البحث في جميع الحقول
    for (const [key, value] of Object.entries(data)) {
      if (this.compareValue(value, targetId)) {
        console.log(`🎯 وُجد ${targetId} في الحقل: ${key} = "${value}"`);
        return true;
      }
    }
    return false;
  }

  /**
   * مقارنة قيمة مع الرقم المطلوب
   */
  private static compareValue(value: any, targetId: string): boolean {
    if (!value) return false;

    // مقارنة مباشرة
    if (value === targetId) return true;
    if (value === parseInt(targetId)) return true;
    if (value === targetId.toString()) return true;

    // مقارنة مع إزالة المسافات
    const normalizedValue = value.toString().trim();
    const normalizedTarget = targetId.trim();
    if (normalizedValue === normalizedTarget) return true;

    // البحث الجزئي
    if (normalizedValue.includes(normalizedTarget)) return true;
    if (normalizedTarget.includes(normalizedValue)) return true;

    return false;
  }

  /**
   * البحث المتقدم في مجموعة users فقط
   */
  static async searchInUsersCollection(employeeIds: string[]): Promise<{
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
      console.log('🔍 البحث المتقدم في مجموعة users...');
      
      // جلب جميع المستخدمين
      const usersRef = collection(db, 'users');
      const allUsersQuery = query(usersRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(allUsersQuery);
      
      console.log(`📊 وُجد ${querySnapshot.docs.length} مستخدم في قاعدة البيانات`);

      querySnapshot.docs.forEach((doc) => {
        const userData = { id: doc.id, ...doc.data() };
        allUsers.push(userData);
        
        // فحص كل رقم وظيفي
        const employeeId = userData.employeeId;
        if (employeeId) {
          debugInfo.push(`مستخدم ${doc.id}: employeeId = "${employeeId}" (نوع: ${typeof employeeId})`);
          
          // البحث بطرق مختلفة
          employeeIds.forEach(targetId => {
            if (this.compareValue(employeeId, targetId)) {
              if (!found[targetId]) found[targetId] = [];
              found[targetId].push(userData);
              console.log(`✅ وُجد ${targetId} في المستخدم ${doc.id}`);
            }
          });
        } else {
          debugInfo.push(`مستخدم ${doc.id}: بدون رقم وظيفي`);
        }
      });

      // تحديد الأرقام غير الموجودة
      employeeIds.forEach(employeeId => {
        if (!found[employeeId] || found[employeeId].length === 0) {
          notFound.push(employeeId);
        }
      });

      console.log(`✅ انتهى البحث: وُجد ${Object.keys(found).length} رقم وظيفي`);

    } catch (error: any) {
      console.error('❌ خطأ في البحث المتقدم:', error);
      debugInfo.push(`خطأ في البحث: ${error.message}`);
    }

    return { found, notFound, allUsers, debugInfo };
  }
}
