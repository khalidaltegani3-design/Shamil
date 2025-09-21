import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';

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

async function addKhalidDirectly() {
  try {
    console.log('🔍 البحث عن المستخدم khalid...');
    
    // البحث عن المستخدم بالإيميل
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', 'end2012.19+1@gmail.com'));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log('❌ المستخدم غير موجود في قاعدة البيانات');
      return;
    }
    
    const userDoc = querySnapshot.docs[0];
    const userId = userDoc.id;
    const userData = userDoc.data();
    
    console.log('✅ تم العثور على المستخدم:');
    console.log('   ID:', userId);
    console.log('   البريد:', userData.email);
    console.log('   الاسم:', userData.displayName);
    console.log('   الدور الحالي:', userData.role);
    
    // 1. تحديث دور المستخدم إلى مشرف
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      role: 'supervisor',
      homeDepartmentId: 'general-monitoring',
      updatedAt: new Date(),
      updatedBy: 'system_admin'
    });
    
    console.log('✅ تم تحديث دور المستخدم إلى مشرف');
    
    // 2. إضافة صلاحيات الإشراف على قسم المراقبة العامة
    const supervisorRef = doc(db, 'departments', 'general-monitoring', 'supervisors', userId);
    await setDoc(supervisorRef, {
      assignedAt: new Date(),
      assignedBy: 'system_admin',
      active: true,
      permissions: ['read', 'write', 'manage_reports']
    });
    
    console.log('✅ تم إضافة صلاحيات الإشراف على قسم المراقبة العامة');
    
    // 3. إنشاء سجل في مجموعة المشرفين
    const supervisorsRef = doc(db, 'supervisors', userId);
    await setDoc(supervisorsRef, {
      userId: userId,
      email: userData.email,
      displayName: userData.displayName,
      assignedDepartments: ['general-monitoring'],
      homeDepartmentId: 'general-monitoring',
      isActive: true,
      assignedAt: new Date(),
      assignedBy: 'system_admin',
      lastUpdated: new Date()
    });
    
    console.log('✅ تم إنشاء سجل في مجموعة المشرفين');
    
    console.log('🎉 تم إعداد خالد كمشرف بنجاح!');
    console.log('📋 الملخص:');
    console.log('   ✓ تم تحديث الدور في users');
    console.log('   ✓ تم إضافة صلاحيات في departments/general-monitoring/supervisors');
    console.log('   ✓ تم إنشاء سجل في supervisors');
    console.log('');
    console.log('يمكن الآن لخالد تسجيل الدخول كمشرف على: http://localhost:3000/supervisor');
    
  } catch (error) {
    console.error('❌ خطأ في إعداد المشرف:', error);
  } finally {
    process.exit(0);
  }
}

// تشغيل الإعداد
addKhalidDirectly();