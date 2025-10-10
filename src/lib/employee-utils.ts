// مكتبة أدوات مساعدة للأرقام الوظيفية

/**
 * توليد رقم وظيفي فريد
 * @returns string - رقم وظيفي بصيغة EMPxxxxxx
 */
export function generateEmployeeId(): string {
  const timestamp = Date.now().toString().slice(-6); // آخر 6 أرقام من timestamp
  const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `EMP${timestamp}${randomNum}`;
}

/**
 * التحقق من صحة الرقم الوظيفي
 * @param employeeId - الرقم الوظيفي المراد التحقق منه
 * @returns boolean
 */
export function validateEmployeeId(employeeId: string): boolean {
  if (!employeeId || typeof employeeId !== 'string') {
    return false;
  }
  
  // إزالة المسافات
  const trimmed = employeeId.trim();
  
  // يجب أن يحتوي على 3 أحرف على الأقل
  if (trimmed.length < 3) {
    return false;
  }
  
  // يجب أن يحتوي على أحرف وأرقام فقط (لا يوجد رموز خاصة عدا الشرطة)
  const pattern = /^[A-Za-z0-9\-]+$/;
  return pattern.test(trimmed);
}

/**
 * تنسيق الرقم الوظيفي للعرض
 * @param employeeId - الرقم الوظيفي
 * @returns string - رقم وظيفي منسق
 */
export function formatEmployeeId(employeeId: string): string {
  if (!employeeId) return 'غير محدد';
  if (validateEmployeeId(employeeId)) {
    // تقسيم الرقم: EMP-123456-789
    return `${employeeId.slice(0, 3)}-${employeeId.slice(3, 9)}-${employeeId.slice(9)}`;
  }
  return employeeId;
}

/**
 * البحث في المستخدمين بالرقم الوظيفي
 * @param users - قائمة المستخدمين
 * @param searchTerm - مصطلح البحث
 * @returns boolean
 */
export function searchByEmployeeId(users: any[], searchTerm: string): any[] {
  if (!searchTerm) return users;
  
  const cleanSearchTerm = searchTerm.toLowerCase().replace(/[-\s]/g, '');
  
  return users.filter(user => {
    if (!user.employeeId) return false;
    const cleanEmployeeId = user.employeeId.toLowerCase().replace(/[-\s]/g, '');
    return cleanEmployeeId.includes(cleanSearchTerm);
  });
}

/**
 * التحقق من تفرد الرقم الوظيفي
 * @param users - قائمة المستخدمين
 * @param employeeId - الرقم الوظيفي المراد التحقق منه
 * @param excludeUid - معرف المستخدم المراد استثناؤه من التحقق
 * @returns boolean
 */
export function isEmployeeIdUnique(users: any[], employeeId: string, excludeUid?: string): boolean {
  return !users.some(user => 
    user.employeeId === employeeId && 
    user.uid !== excludeUid
  );
}

/**
 * تشفير الرقم الوظيفي للاستخدام الداخلي
 * @param employeeId - الرقم الوظيفي
 * @returns string
 */
export function hashEmployeeId(employeeId: string): string {
  // تشفير بسيط للاستخدام الداخلي
  let hash = 0;
  for (let i = 0; i < employeeId.length; i++) {
    const char = employeeId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // تحويل إلى 32bit integer
  }
  return Math.abs(hash).toString(16);
}

/**
 * التحقق من تفرد الرقم الوظيفي في قاعدة البيانات
 * @param employeeId - الرقم الوظيفي المراد التحقق منه
 * @returns Promise<boolean>
 */
export async function checkEmployeeIdUniqueness(employeeId: string): Promise<boolean> {
  try {
    const { collection, query, where, getDocs } = await import('firebase/firestore');
    const { db } = await import('./firebase');
    
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('employeeId', '==', employeeId.trim()));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.empty; // true إذا كان فريد، false إذا كان موجود
  } catch (error) {
    console.error('خطأ في التحقق من تفرد الرقم الوظيفي:', error);
    return false; // في حالة الخطأ، نعتبر أن الرقم غير فريد للأمان
  }
}