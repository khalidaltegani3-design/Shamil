// أداة بحث شاملة للعثور على الأرقام الوظيفية في جميع أنحاء Firebase
import { collection, getDocs, query, orderBy, limit, where, doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface ComprehensiveSearchResult {
  collection: string;
  documentId: string;
  data: any;
  foundFields: { [key: string]: any };
  matchType: string;
}

export class ComprehensiveSearchService {
  
  /**
   * البحث الشامل في جميع المجموعات والمستندات
   */
  static async searchEverywhere(employeeIds: string[]): Promise<{
    results: ComprehensiveSearchResult[];
    summary: {
      totalCollections: number;
      totalDocuments: number;
      foundIds: string[];
      notFoundIds: string[];
      collectionsWithData: string[];
    };
  }> {
    const collectionsToSearch = [
      'users',
      'employeeIds',
      'employees', 
      'staff',
      'accounts',
      'profiles',
      'userProfiles',
      'employeeRecords',
      'userData',
      'employeeData',
      'staffRecords',
      'userAccounts',
      'employeeAccounts',
      'systemUsers',
      'activeUsers',
      'pendingUsers',
      'tempUsers',
      'userTemp',
      'employeeTemp',
      'staffTemp'
    ];

    const results: ComprehensiveSearchResult[] = [];
    const foundIds: Set<string> = new Set();
    const notFoundIds: Set<string> = new Set(employeeIds);
    const collectionsWithData: Set<string> = new Set();

    console.log('🔍 بدء البحث الشامل في جميع المجموعات...');
    console.log(`📋 الأرقام المطلوب البحث عنها: ${employeeIds.join(', ')}`);
    console.log(`📁 المجموعات المراد فحصها: ${collectionsToSearch.length}`);

    for (const collectionName of collectionsToSearch) {
      try {
        console.log(`\n🔎 فحص مجموعة: ${collectionName}`);
        const collectionRef = collection(db, collectionName);
        
        // محاولة جلب جميع المستندات من كل مجموعة
        const q = query(collectionRef, limit(500)); // زيادة الحد إلى 500
        const querySnapshot = await getDocs(q);
        
        console.log(`📊 وُجد ${querySnapshot.docs.length} مستند في ${collectionName}`);
        
        if (querySnapshot.docs.length > 0) {
          collectionsWithData.add(collectionName);
        }

        querySnapshot.docs.forEach((docSnapshot) => {
          const data = docSnapshot.data();
          const foundFields: { [key: string]: any } = {};
          let hasMatch = false;

          // البحث في جميع الحقول
          for (const [fieldName, fieldValue] of Object.entries(data)) {
            employeeIds.forEach(targetId => {
              if (this.deepCompareValue(fieldValue, targetId)) {
                foundFields[fieldName] = fieldValue;
                foundIds.add(targetId);
                notFoundIds.delete(targetId);
                hasMatch = true;
                console.log(`✅ وُجد ${targetId} في ${collectionName}/${docSnapshot.id} -> ${fieldName}: "${fieldValue}"`);
              }
            });
          }

          if (hasMatch) {
            results.push({
              collection: collectionName,
              documentId: docSnapshot.id,
              data: data,
              foundFields: foundFields,
              matchType: 'field_match'
            });
          }
        });

        console.log(`✅ انتهى فحص ${collectionName}`);

      } catch (error: any) {
        console.log(`❌ خطأ في فحص ${collectionName}: ${error.message}`);
        // تجاهل الأخطاء والمتابعة
      }
    }

    // البحث في المستندات الفردية المحددة
    await this.searchSpecificDocuments(employeeIds, results, foundIds, notFoundIds);

    const summary = {
      totalCollections: collectionsToSearch.length,
      totalDocuments: results.length,
      foundIds: Array.from(foundIds),
      notFoundIds: Array.from(notFoundIds),
      collectionsWithData: Array.from(collectionsWithData)
    };

    console.log('\n📊 ملخص البحث الشامل:');
    console.log(`📁 المجموعات المفحوصة: ${summary.totalCollections}`);
    console.log(`📄 المستندات المطابقة: ${summary.totalDocuments}`);
    console.log(`📁 المجموعات التي تحتوي على بيانات: ${summary.collectionsWithData.length}`);
    console.log(`✅ الأرقام الموجودة: ${summary.foundIds.length} - ${summary.foundIds.join(', ')}`);
    console.log(`❌ الأرقام غير الموجودة: ${summary.notFoundIds.length} - ${summary.notFoundIds.join(', ')}`);

    return { results, summary };
  }

  /**
   * البحث في مستندات محددة
   */
  private static async searchSpecificDocuments(
    employeeIds: string[], 
    results: ComprehensiveSearchResult[], 
    foundIds: Set<string>, 
    notFoundIds: Set<string>
  ): Promise<void> {
    console.log('\n🔍 البحث في مستندات محددة...');
    
    const specificDocuments = [
      'system/employeeIds',
      'config/employeeIds', 
      'data/employeeIds',
      'system/config',
      'config/system',
      'employeeIds/all',
      'employeeIds/active',
      'employeeIds/pending'
    ];

    for (const docPath of specificDocuments) {
      try {
        const [collectionName, documentId] = docPath.split('/');
        const docRef = doc(db, collectionName, documentId);
        const docSnapshot = await getDoc(docRef);
        
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          const foundFields: { [key: string]: any } = {};
          let hasMatch = false;

          for (const [fieldName, fieldValue] of Object.entries(data)) {
            employeeIds.forEach(targetId => {
              if (this.deepCompareValue(fieldValue, targetId)) {
                foundFields[fieldName] = fieldValue;
                foundIds.add(targetId);
                notFoundIds.delete(targetId);
                hasMatch = true;
                console.log(`✅ وُجد ${targetId} في ${docPath} -> ${fieldName}: "${fieldValue}"`);
              }
            });
          }

          if (hasMatch) {
            results.push({
              collection: collectionName,
              documentId: documentId,
              data: data,
              foundFields: foundFields,
              matchType: 'specific_document'
            });
          }
        }
      } catch (error: any) {
        // تجاهل الأخطاء
      }
    }
  }

  /**
   * مقارنة عميقة للقيم
   */
  private static deepCompareValue(value: any, targetId: string): boolean {
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

    // البحث في المصفوفات
    if (Array.isArray(value)) {
      return value.some(item => this.deepCompareValue(item, targetId));
    }

    // البحث في الكائنات
    if (typeof value === 'object' && value !== null) {
      return Object.values(value).some(item => this.deepCompareValue(item, targetId));
    }

    return false;
  }

  /**
   * البحث في مجموعة محددة فقط
   */
  static async searchInSpecificCollection(collectionName: string, employeeIds: string[]): Promise<ComprehensiveSearchResult[]> {
    const results: ComprehensiveSearchResult[] = [];
    
    try {
      console.log(`🔍 البحث في مجموعة محددة: ${collectionName}`);
      const collectionRef = collection(db, collectionName);
      const q = query(collectionRef, limit(1000));
      const querySnapshot = await getDocs(q);
      
      console.log(`📊 وُجد ${querySnapshot.docs.length} مستند في ${collectionName}`);

      querySnapshot.docs.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        const foundFields: { [key: string]: any } = {};
        let hasMatch = false;

        for (const [fieldName, fieldValue] of Object.entries(data)) {
          employeeIds.forEach(targetId => {
            if (this.deepCompareValue(fieldValue, targetId)) {
              foundFields[fieldName] = fieldValue;
              hasMatch = true;
              console.log(`✅ وُجد ${targetId} في ${collectionName}/${docSnapshot.id} -> ${fieldName}: "${fieldValue}"`);
            }
          });
        }

        if (hasMatch) {
          results.push({
            collection: collectionName,
            documentId: docSnapshot.id,
            data: data,
            foundFields: foundFields,
            matchType: 'specific_collection'
          });
        }
      });

    } catch (error: any) {
      console.error(`❌ خطأ في البحث في ${collectionName}:`, error);
    }

    return results;
  }
}


