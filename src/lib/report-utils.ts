import { collection, query, orderBy, limit, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

/**
 * توليد رقم بلاغ رقمي جديد
 * @returns Promise<number> - رقم البلاغ الجديد
 */
export async function generateReportNumber(): Promise<number> {
  try {
    // البحث عن آخر بلاغ في النظام
    const reportsRef = collection(db, 'reports');
    const q = query(reportsRef, orderBy('reportNumber', 'desc'), limit(1));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      // إذا لم توجد بلاغات سابقة، ابدأ من الرقم 1
      return 1;
    } else {
      // إذا وجدت بلاغات، احصل على آخر رقم وأضف 1
      const lastReport = snapshot.docs[0].data();
      return (lastReport.reportNumber || 0) + 1;
    }
  } catch (error) {
    console.error('خطأ في توليد رقم البلاغ:', error);
    // في حالة الخطأ، استخدم timestamp كرقم احتياطي
    return Date.now() % 1000000; // آخر 6 أرقام من timestamp
  }
}

/**
 * تنسيق رقم البلاغ للعرض
 * @param reportNumber - رقم البلاغ
 * @returns string - رقم البلاغ منسق (مثال: B000123)
 */
export function formatReportNumber(reportNumber: number): string {
  return `B${reportNumber.toString().padStart(6, '0')}`;
}

/**
 * استخراج رقم البلاغ من النص المنسق
 * @param formattedNumber - الرقم المنسق (مثال: B000123)
 * @returns number - رقم البلاغ الرقمي
 */
export function parseReportNumber(formattedNumber: string): number {
  return parseInt(formattedNumber.replace('B', ''));
}

/**
 * التحقق من صحة رقم البلاغ
 * @param reportNumber - رقم البلاغ
 * @returns boolean - true إذا كان الرقم صحيح
 */
export function isValidReportNumber(reportNumber: any): boolean {
  return typeof reportNumber === 'number' && reportNumber > 0 && Number.isInteger(reportNumber);
}