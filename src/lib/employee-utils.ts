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
  // يجب أن يبدأ بـ EMP ويتبعه 9 أرقام
  const pattern = /^EMP\d{9}$/;
  return pattern.test(employeeId);
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
 * إنشاء رقم وظيفي مخصص بناء على معايير معينة
 * @param department - معرف القسم
 * @param rolePrefix - بادئة الدور (EMP, SUP, ADM)
 * @returns string
 */
export function generateCustomEmployeeId(department?: string, rolePrefix: string = 'EMP'): string {
  const timestamp = Date.now().toString().slice(-4);
  const randomNum = Math.floor(Math.random() * 100).toString().padStart(2, '0');
  const deptCode = department ? department.slice(0, 3).toUpperCase() : 'GEN';
  
  return `${rolePrefix}${deptCode}${timestamp}${randomNum}`;
}