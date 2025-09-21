import { addSupervisor, getSupervisorData } from './src/lib/supervisor-management.js';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// إعدادات Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDKtxqu6YRoZQCeD9EoFmxAvc9JLi_d5R8",
  authDomain: "zoliapp-lite.firebaseapp.com",
  projectId: "zoliapp-lite",
  storageBucket: "zoliapp-lite.firebasestorage.app",
  messagingSenderId: "476068628948",
  appId: "1:476068628948:web:55c0eaf993de1cc553ee41"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testAddKhalidAsSupervisor() {
  try {
    console.log('🧪 اختبار إضافة خالد كمشرف...');
    
    // معرف المستخدم (يجب أن نجده من قاعدة البيانات)
    // هذا مجرد مثال - في الواقع نحتاج للبحث عن المستخدم بالإيميل أولاً
    const khalidEmail = 'end2012.19+1@gmail.com';
    const testUserId = 'test-khalid-uid'; // سنحتاج للحصول على UID الحقيقي
    
    // الأقسام التي سيشرف عليها
    const departments = ['general-monitoring', 'technical-support'];
    
    console.log('📝 بيانات الاختبار:');
    console.log('   البريد الإلكتروني:', khalidEmail);
    console.log('   الأقسام:', departments);
    
    // إضافة المشرف
    const success = await addSupervisor(testUserId, departments, 'system_admin');
    
    if (success) {
      console.log('✅ تم إضافة خالد كمشرف بنجاح');
      
      // التحقق من البيانات
      const supervisorData = await getSupervisorData(testUserId);
      console.log('📋 بيانات المشرف:', supervisorData);
    } else {
      console.log('❌ فشل في إضافة خالد كمشرف');
    }
    
  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error);
  } finally {
    process.exit(0);
  }
}

// تشغيل الاختبار
testAddKhalidAsSupervisor();