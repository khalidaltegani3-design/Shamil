// سكريبت إضافة الأرقام الوظيفية للمستخدمين الموجودين
// تشغيل هذا السكريبت مرة واحدة لتحديث جميع المستخدمين

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc, writeBatch } from 'firebase/firestore';

// نوع بيانات المستخدم
interface UserData {
  id: string;
  displayName?: string;
  email?: string;
  employeeId?: string;
  role?: string;
  [key: string]: any;
}

// إعدادات Firebase - نفس الإعدادات من firebase.ts
const firebaseConfig = {
  apiKey: "AIzaSyCH6FnlDC0RZSAxsRyYO4QFNAz1ZfZWfSs",
  authDomain: "shamil-a9322.firebaseapp.com",
  projectId: "shamil-a9322",
  storageBucket: "shamil-a9322.appspot.com",
  messagingSenderId: "229347947693",
  appId: "1:229347947693:web:357de234da4472c7666c2d"
};

// تهيئة Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// دالة توليد رقم وظيفي فريد
function generateEmployeeId(): string {
  const timestamp = Date.now().toString().slice(-6); // آخر 6 أرقام من timestamp
  const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `EMP${timestamp}${randomNum}`;
}

// دالة للتحقق من تفرد الرقم الوظيفي
function isEmployeeIdUnique(existingIds: Set<string>, newId: string): boolean {
  return !existingIds.has(newId);
}

// دالة إنشاء رقم وظيفي فريد
function generateUniqueEmployeeId(existingIds: Set<string>): string {
  let attempts = 0;
  let newId: string;
  
  do {
    newId = generateEmployeeId();
    attempts++;
  } while (!isEmployeeIdUnique(existingIds, newId) && attempts < 50);
  
  if (attempts >= 50) {
    throw new Error('فشل في إنشاء رقم وظيفي فريد بعد 50 محاولة');
  }
  
  existingIds.add(newId);
  return newId;
}

// الدالة الرئيسية لإضافة الأرقام الوظيفية
async function addEmployeeIdsToExistingUsers() {
  try {
    console.log('🔄 بدء عملية إضافة الأرقام الوظيفية للمستخدمين الموجودين...');
    
    // جلب جميع المستخدمين
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const users: UserData[] = usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as UserData[];
    
    console.log(`📊 تم العثور على ${users.length} مستخدم`);
    
    // جمع الأرقام الوظيفية الموجودة لتجنب التكرار
    const existingEmployeeIds = new Set<string>();
    users.forEach(user => {
      if (user.employeeId) {
        existingEmployeeIds.add(user.employeeId);
      }
    });
    
    console.log(`📋 الأرقام الوظيفية الموجودة: ${existingEmployeeIds.size}`);
    
    // تحديد المستخدمين الذين يحتاجون أرقام وظيفية
    const usersNeedingIds = users.filter(user => 
      !user.employeeId && user.role !== 'system_admin'
    );
    
    console.log(`🎯 المستخدمون الذين يحتاجون أرقام وظيفية: ${usersNeedingIds.length}`);
    
    if (usersNeedingIds.length === 0) {
      console.log('✅ جميع المستخدمين لديهم أرقام وظيفية بالفعل!');
      return;
    }
    
    // استخدام batch للتحديث المجمع (أسرع وأكثر كفاءة)
    const batch = writeBatch(db);
    const updates: Array<{uid: string, employeeId: string, displayName: string}> = [];
    
    // إنشاء أرقام وظيفية للمستخدمين
    for (const user of usersNeedingIds) {
      try {
        const newEmployeeId = generateUniqueEmployeeId(existingEmployeeIds);
        const userRef = doc(db, 'users', user.id);
        
        batch.update(userRef, {
          employeeId: newEmployeeId,
          updatedAt: new Date()
        });
        
        updates.push({
          uid: user.id,
          employeeId: newEmployeeId,
          displayName: user.displayName || 'غير محدد'
        });
        
        console.log(`➕ تم إنشاء رقم وظيفي للمستخدم ${user.displayName || user.email}: ${newEmployeeId}`);
        
      } catch (error) {
        console.error(`❌ خطأ في إنشاء رقم وظيفي للمستخدم ${user.displayName}:`, error);
      }
    }
    
    // تنفيذ التحديثات
    console.log('🔄 تنفيذ التحديثات...');
    await batch.commit();
    
    console.log('✅ تم الانتهاء من إضافة الأرقام الوظيفية بنجاح!');
    console.log(`📊 تم تحديث ${updates.length} مستخدم`);
    
    // طباعة ملخص النتائج
    console.log('\n📋 ملخص الأرقام الوظيفية المضافة:');
    console.log('═'.repeat(60));
    updates.forEach(update => {
      console.log(`${update.displayName}: ${update.employeeId}`);
    });
    console.log('═'.repeat(60));
    
    // إحصائيات نهائية
    const finalUsersSnapshot = await getDocs(collection(db, 'users'));
    const finalUsers = finalUsersSnapshot.docs.map(doc => doc.data());
    const usersWithIds = finalUsers.filter(user => user.employeeId).length;
    const systemAdmins = finalUsers.filter(user => user.role === 'system_admin').length;
    
    console.log('\n📈 الإحصائيات النهائية:');
    console.log(`👥 إجمالي المستخدمين: ${finalUsers.length}`);
    console.log(`🆔 المستخدمون مع أرقام وظيفية: ${usersWithIds}`);
    console.log(`👑 مديرو النظام (بدون أرقام): ${systemAdmins}`);
    console.log(`✅ نسبة التغطية: ${((usersWithIds / (finalUsers.length - systemAdmins)) * 100).toFixed(1)}%`);
    
  } catch (error) {
    console.error('❌ خطأ في عملية إضافة الأرقام الوظيفية:', error);
    throw error;
  }
}

// تشغيل السكريبت
if (require.main === module) {
  addEmployeeIdsToExistingUsers()
    .then(() => {
      console.log('🎉 تم إكمال العملية بنجاح!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 فشلت العملية:', error);
      process.exit(1);
    });
}

export { addEmployeeIdsToExistingUsers };