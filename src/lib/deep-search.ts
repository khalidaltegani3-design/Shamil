// أداة البحث العميق للعثور على الأرقام الوظيفية المخفية
import { collection, getDocs, query, orderBy, limit, where, doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface DeepSearchResult {
  collection: string;
  documentId: string;
  data: any;
  foundFields: { [key: string]: any };
  matchType: string;
  searchDepth: string;
}

export class DeepSearchService {
  
  /**
   * البحث العميق في جميع أنحاء Firebase (محسن للأداء)
   */
  static async deepSearchEverywhere(employeeIds: string[]): Promise<{
    results: DeepSearchResult[];
    summary: {
      totalCollections: number;
      totalDocuments: number;
      foundIds: string[];
      notFoundIds: string[];
      collectionsWithData: string[];
      deepSearchResults: any[];
    };
  }> {
    console.log('🔍 بدء البحث العميق المحسن...');
    
    // تشغيل عمليات البحث بشكل متسلسل لتجنب الحمل الزائد
    const allResults = [];
    
    console.log('🔍 البحث في المجموعات الأساسية...');
    allResults.push(await this.searchInAllCollections(employeeIds));
    
    console.log('🔍 البحث في المستندات المتداخلة...');
    allResults.push(await this.searchInNestedDocuments(employeeIds));
    
    console.log('🔍 البحث في مجموعات النظام...');
    allResults.push(await this.searchInSystemCollections(employeeIds));
    
    console.log('🔍 البحث في مستندات التكوين...');
    allResults.push(await this.searchInConfigDocuments(employeeIds));

    // دمج النتائج
    const combinedResults: DeepSearchResult[] = [];
    const foundIds: Set<string> = new Set();
    const notFoundIds: Set<string> = new Set(employeeIds);
    const collectionsWithData: Set<string> = new Set();

    allResults.forEach(result => {
      combinedResults.push(...result.results);
      result.summary.foundIds.forEach(id => foundIds.add(id));
      result.summary.collectionsWithData.forEach(col => collectionsWithData.add(col));
    });

    notFoundIds.forEach(id => {
      if (foundIds.has(id)) {
        notFoundIds.delete(id);
      }
    });

    const summary = {
      totalCollections: combinedResults.length,
      totalDocuments: combinedResults.length,
      foundIds: Array.from(foundIds),
      notFoundIds: Array.from(notFoundIds),
      collectionsWithData: Array.from(collectionsWithData),
      deepSearchResults: allResults
    };

    console.log('\n📊 ملخص البحث العميق:');
    console.log(`✅ الأرقام الموجودة: ${summary.foundIds.length} - ${summary.foundIds.join(', ')}`);
    console.log(`❌ الأرقام غير الموجودة: ${summary.notFoundIds.length} - ${summary.notFoundIds.join(', ')}`);

    return { results: combinedResults, summary };
  }

  /**
   * البحث في جميع المجموعات الأساسية
   */
  private static async searchInAllCollections(employeeIds: string[]): Promise<any> {
    const collections = [
      'users', 'userProfiles', 'userData', 'userAccounts', 'userTemp',
      'employees', 'employeeRecords', 'employeeData', 'employeeAccounts', 'employeeTemp',
      'staff', 'staffRecords', 'staffData', 'staffAccounts', 'staffTemp',
      'accounts', 'profiles', 'systemUsers', 'activeUsers', 'pendingUsers',
      'tempUsers', 'userTemp', 'employeeTemp', 'staffTemp', 'systemTemp',
      'employeeIds', 'userIdMap', 'employeeMap', 'staffMap', 'userMap',
      'system', 'config', 'data', 'cache', 'backup', 'archive',
      'logs', 'audit', 'history', 'transactions', 'metadata',
      'settings', 'preferences', 'userSettings', 'systemSettings',
      'roles', 'permissions', 'access', 'auth', 'authentication',
      'sessions', 'tokens', 'devices', 'notifications', 'messages'
    ];

    const results: DeepSearchResult[] = [];
    const foundIds: Set<string> = new Set();
    const collectionsWithData: Set<string> = new Set();

    for (const collectionName of collections) {
      try {
        const collectionRef = collection(db, collectionName);
        const q = query(collectionRef, limit(100)); // تقليل الحد لتجنب الحمل الزائد
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.docs.length > 0) {
          collectionsWithData.add(collectionName);
          console.log(`📁 ${collectionName}: ${querySnapshot.docs.length} مستند`);
        }

        querySnapshot.docs.forEach((docSnapshot) => {
          const data = docSnapshot.data();
          const foundFields: { [key: string]: any } = {};
          let hasMatch = false;

          // البحث في جميع الحقول
          for (const [fieldName, fieldValue] of Object.entries(data)) {
            employeeIds.forEach(targetId => {
              if (this.ultraDeepCompare(fieldValue, targetId)) {
                foundFields[fieldName] = fieldValue;
                foundIds.add(targetId);
                hasMatch = true;
                console.log(`🎯 وُجد ${targetId} في ${collectionName}/${docSnapshot.id} -> ${fieldName}: "${fieldValue}"`);
              }
            });
          }

          if (hasMatch) {
            results.push({
              collection: collectionName,
              documentId: docSnapshot.id,
              data: data,
              foundFields: foundFields,
              matchType: 'all_collections',
              searchDepth: 'standard'
            });
          }
        });

      } catch (error: any) {
        // تجاهل الأخطاء
      }
    }

    return { results, summary: { foundIds: Array.from(foundIds), collectionsWithData: Array.from(collectionsWithData) } };
  }

  /**
   * البحث في المستندات المتداخلة
   */
  private static async searchInNestedDocuments(employeeIds: string[]): Promise<any> {
    const nestedPaths = [
      'system/employeeIds', 'system/userIds', 'system/staffIds',
      'config/employeeIds', 'config/userIds', 'config/staffIds',
      'data/employeeIds', 'data/userIds', 'data/staffIds',
      'employeeIds/all', 'employeeIds/active', 'employeeIds/pending', 'employeeIds/blocked',
      'userIds/all', 'userIds/active', 'userIds/pending', 'userIds/blocked',
      'staffIds/all', 'staffIds/active', 'staffIds/pending', 'staffIds/blocked',
      'system/config', 'system/data', 'system/cache',
      'config/system', 'config/data', 'config/cache',
      'data/system', 'data/config', 'data/cache',
      'cache/system', 'cache/config', 'cache/data',
      'metadata/users', 'metadata/employees', 'metadata/staff',
      'index/employeeIds', 'index/userIds', 'index/staffIds',
      'map/employeeIds', 'map/userIds', 'map/staffIds'
    ];

    const results: DeepSearchResult[] = [];
    const foundIds: Set<string> = new Set();
    const collectionsWithData: Set<string> = new Set();

    for (const docPath of nestedPaths) {
      try {
        const [collectionName, documentId] = docPath.split('/');
        const docRef = doc(db, collectionName, documentId);
        const docSnapshot = await getDoc(docRef);
        
        if (docSnapshot.exists()) {
          collectionsWithData.add(collectionName);
          const data = docSnapshot.data();
          const foundFields: { [key: string]: any } = {};
          let hasMatch = false;

          for (const [fieldName, fieldValue] of Object.entries(data)) {
            employeeIds.forEach(targetId => {
              if (this.ultraDeepCompare(fieldValue, targetId)) {
                foundFields[fieldName] = fieldValue;
                foundIds.add(targetId);
                hasMatch = true;
                console.log(`🎯 وُجد ${targetId} في ${docPath} -> ${fieldName}: "${fieldValue}"`);
              }
            });
          }

          if (hasMatch) {
            results.push({
              collection: collectionName,
              documentId: documentId,
              data: data,
              foundFields: foundFields,
              matchType: 'nested_documents',
              searchDepth: 'deep'
            });
          }
        }
      } catch (error: any) {
        // تجاهل الأخطاء
      }
    }

    return { results, summary: { foundIds: Array.from(foundIds), collectionsWithData: Array.from(collectionsWithData) } };
  }

  /**
   * البحث في مجموعات النظام
   */
  private static async searchInSystemCollections(employeeIds: string[]): Promise<any> {
    const systemCollections = [
      '_system', '_config', '_data', '_cache', '_temp',
      'system_', 'config_', 'data_', 'cache_', 'temp_',
      '_users', '_employees', '_staff', '_accounts',
      'system_users', 'system_employees', 'system_staff',
      'config_users', 'config_employees', 'config_staff',
      'data_users', 'data_employees', 'data_staff'
    ];

    return this.searchInCollections(systemCollections, employeeIds, 'system_collections');
  }

  /**
   * البحث في مستندات التكوين
   */
  private static async searchInConfigDocuments(employeeIds: string[]): Promise<any> {
    const configDocs = [
      'app/config', 'app/settings', 'app/data',
      'firebase/config', 'firebase/settings', 'firebase/data',
      'project/config', 'project/settings', 'project/data',
      'env/config', 'env/settings', 'env/data'
    ];

    return this.searchInDocuments(configDocs, employeeIds, 'config_documents');
  }

  /**
   * البحث في المجموعات المؤقتة
   */
  private static async searchInTempCollections(employeeIds: string[]): Promise<any> {
    const tempCollections = [
      'temp', 'temporary', 'tmp', 'temp_data', 'temp_users',
      'temp_employees', 'temp_staff', 'temp_accounts',
      'pending', 'queue', 'batch', 'processing'
    ];

    return this.searchInCollections(tempCollections, employeeIds, 'temp_collections');
  }

  /**
   * البحث في مجموعات الفهرسة
   */
  private static async searchInIndexCollections(employeeIds: string[]): Promise<any> {
    const indexCollections = [
      'index', 'indexes', 'indices', 'search', 'lookup',
      'index_employeeIds', 'index_userIds', 'index_staffIds',
      'lookup_employeeIds', 'lookup_userIds', 'lookup_staffIds'
    ];

    return this.searchInCollections(indexCollections, employeeIds, 'index_collections');
  }

  /**
   * البحث في مجموعات التخزين المؤقت
   */
  private static async searchInCacheCollections(employeeIds: string[]): Promise<any> {
    const cacheCollections = [
      'cache', 'cached', 'caching', 'memory', 'storage',
      'cache_users', 'cache_employees', 'cache_staff',
      'memory_users', 'memory_employees', 'memory_staff'
    ];

    return this.searchInCollections(cacheCollections, employeeIds, 'cache_collections');
  }

  /**
   * البحث في مجموعات النسخ الاحتياطي
   */
  private static async searchInBackupCollections(employeeIds: string[]): Promise<any> {
    const backupCollections = [
      'backup', 'backups', 'archive', 'archives', 'old',
      'backup_users', 'backup_employees', 'backup_staff',
      'archive_users', 'archive_employees', 'archive_staff'
    ];

    return this.searchInCollections(backupCollections, employeeIds, 'backup_collections');
  }

  /**
   * البحث في مجموعة من المجموعات
   */
  private static async searchInCollections(collections: string[], employeeIds: string[], matchType: string): Promise<any> {
    const results: DeepSearchResult[] = [];
    const foundIds: Set<string> = new Set();
    const collectionsWithData: Set<string> = new Set();

    for (const collectionName of collections) {
      try {
        const collectionRef = collection(db, collectionName);
        const q = query(collectionRef, limit(50)); // تقليل الحد لتجنب الحمل الزائد
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.docs.length > 0) {
          collectionsWithData.add(collectionName);
          console.log(`📁 ${collectionName}: ${querySnapshot.docs.length} مستند`);
        }

        querySnapshot.docs.forEach((docSnapshot) => {
          const data = docSnapshot.data();
          const foundFields: { [key: string]: any } = {};
          let hasMatch = false;

          for (const [fieldName, fieldValue] of Object.entries(data)) {
            employeeIds.forEach(targetId => {
              if (this.ultraDeepCompare(fieldValue, targetId)) {
                foundFields[fieldName] = fieldValue;
                foundIds.add(targetId);
                hasMatch = true;
                console.log(`🎯 وُجد ${targetId} في ${collectionName}/${docSnapshot.id} -> ${fieldName}: "${fieldValue}"`);
              }
            });
          }

          if (hasMatch) {
            results.push({
              collection: collectionName,
              documentId: docSnapshot.id,
              data: data,
              foundFields: foundFields,
              matchType: matchType,
              searchDepth: 'ultra_deep'
            });
          }
        });

      } catch (error: any) {
        // تجاهل الأخطاء
      }
    }

    return { results, summary: { foundIds: Array.from(foundIds), collectionsWithData: Array.from(collectionsWithData) } };
  }

  /**
   * البحث في مجموعة من المستندات
   */
  private static async searchInDocuments(documents: string[], employeeIds: string[], matchType: string): Promise<any> {
    const results: DeepSearchResult[] = [];
    const foundIds: Set<string> = new Set();
    const collectionsWithData: Set<string> = new Set();

    for (const docPath of documents) {
      try {
        const [collectionName, documentId] = docPath.split('/');
        const docRef = doc(db, collectionName, documentId);
        const docSnapshot = await getDoc(docRef);
        
        if (docSnapshot.exists()) {
          collectionsWithData.add(collectionName);
          const data = docSnapshot.data();
          const foundFields: { [key: string]: any } = {};
          let hasMatch = false;

          for (const [fieldName, fieldValue] of Object.entries(data)) {
            employeeIds.forEach(targetId => {
              if (this.ultraDeepCompare(fieldValue, targetId)) {
                foundFields[fieldName] = fieldValue;
                foundIds.add(targetId);
                hasMatch = true;
                console.log(`🎯 وُجد ${targetId} في ${docPath} -> ${fieldName}: "${fieldValue}"`);
              }
            });
          }

          if (hasMatch) {
            results.push({
              collection: collectionName,
              documentId: documentId,
              data: data,
              foundFields: foundFields,
              matchType: matchType,
              searchDepth: 'ultra_deep'
            });
          }
        }
      } catch (error: any) {
        // تجاهل الأخطاء
      }
    }

    return { results, summary: { foundIds: Array.from(foundIds), collectionsWithData: Array.from(collectionsWithData) } };
  }

  /**
   * مقارنة فائقة العمق
   */
  private static ultraDeepCompare(value: any, targetId: string): boolean {
    if (!value) return false;

    // مقارنة مباشرة
    if (value === targetId) return true;
    if (value === parseInt(targetId)) return true;
    if (value === targetId.toString()) return true;

    // مقارنة مع إزالة المسافات والأحرف الخاصة
    const normalizedValue = value.toString().trim().replace(/[^\d]/g, '');
    const normalizedTarget = targetId.trim().replace(/[^\d]/g, '');
    if (normalizedValue === normalizedTarget) return true;

    // البحث الجزئي
    if (normalizedValue.includes(normalizedTarget)) return true;
    if (normalizedTarget.includes(normalizedValue)) return true;

    // البحث في المصفوفات
    if (Array.isArray(value)) {
      return value.some(item => this.ultraDeepCompare(item, targetId));
    }

    // البحث في الكائنات
    if (typeof value === 'object' && value !== null) {
      return Object.values(value).some(item => this.ultraDeepCompare(item, targetId));
    }

    return false;
  }
}
