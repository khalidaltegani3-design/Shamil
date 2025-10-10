/**
 * إعدادات المصادقة والصلاحيات
 * يتعامل مع الاختلافات بين البيئة المحلية والإنتاجية
 */

// البريد الإلكتروني لمدير النظام
export const SYSTEM_ADMIN_EMAIL = "sweetdream711711@gmail.com";

// التحقق من البيئة الحالية
export const isProduction = process.env.NODE_ENV === 'production';
export const isDevelopment = process.env.NODE_ENV === 'development';

// إعدادات خاصة بالبيئة الإنتاجية
export const PRODUCTION_CONFIG = {
  // تأكيد أن Firebase Auth يعمل بشكل صحيح في الإنتاج
  authPersistence: true,
  // إعدادات إضافية للأمان في الإنتاج
  strictMode: true,
  // تسجيل الأحداث المفصل في الإنتاج لتتبع مشاكل الصلاحيات
  detailedLogging: true
};

// إعدادات للبيئة المحلية
export const DEVELOPMENT_CONFIG = {
  authPersistence: true,
  strictMode: false,
  detailedLogging: true
};

// الحصول على الإعدادات الحالية حسب البيئة
export const getAuthConfig = () => {
  return isProduction ? PRODUCTION_CONFIG : DEVELOPMENT_CONFIG;
};

// دالة للتحقق من صحة المصادقة في البيئة الحالية
export const validateAuthEnvironment = () => {
  const config = getAuthConfig();
  
  if (config.detailedLogging) {
    console.log(`🔧 Auth Environment: ${isProduction ? 'Production' : 'Development'}`);
    console.log(`🔑 System Admin Email: ${SYSTEM_ADMIN_EMAIL}`);
    console.log(`⚙️ Auth Config:`, config);
  }
  
  return config;
};

// دالة للتحقق من صحة البريد الإلكتروني لمدير النظام
export const isValidSystemAdmin = (email: string | null | undefined): boolean => {
  if (!email) return false;
  
  const cleanEmail = email.toLowerCase().trim();
  const isValid = cleanEmail === SYSTEM_ADMIN_EMAIL;
  
  const config = getAuthConfig();
  if (config.detailedLogging) {
    console.log(`🔍 Checking system admin:`, {
      provided: cleanEmail,
      expected: SYSTEM_ADMIN_EMAIL,
      isValid
    });
  }
  
  return isValid;
};

// إعدادات timeout للعمليات المختلفة
export const AUTH_TIMEOUTS = {
  userLoad: 10000, // 10 ثوان
  documentLoad: 5000, // 5 ثوان
  authCheck: 15000 // 15 ثانية
};