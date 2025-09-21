import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, updateDoc, collection, getDocs, setDoc, query, where } from 'firebase/firestore';

// إعدادات Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDKtxqu6YRoZQCeD9EoFmxAvc9JLi_d5R8",
  authDomain: "zoliapp-lite.firebaseapp.com",
  projectId: "zoliapp-lite",
  storageBucket: "zoliapp-lite.firebasestorage.app",
  messagingSenderId: "476068628948",
  appId: "1:476068628948:web:55c0eaf993de1cc553ee41"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

async function fixKhalidPermissions() {
  try {
    console.log('🔍 البحث عن المستخدم khalid...');
    
    // البحث عن المستخدم بالإيميل
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', 'end2012.19+1@gmail.com'));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log('❌ المستخدم غير موجود في قاعدة البيانات');
      return false;
    }
    
    const userDoc = querySnapshot.docs[0];
    const userId = userDoc.id;
    const userData = userDoc.data();
    
    console.log('📋 بيانات المستخدم الحالية:');
    console.log('   ID:', userId);
    console.log('   البريد:', userData.email);
    console.log('   الاسم:', userData.displayName);
    console.log('   الدور:', userData.role);
    console.log('   القسم الأساسي:', userData.homeDepartmentId);
    
    // ترقية المستخدم إلى مشرف
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      role: 'supervisor',
      homeDepartmentId: 'general-monitoring',
      updatedAt: new Date()
    });
    
    console.log('✅ تم تحديث دور المستخدم إلى مشرف');
    
    // إضافة صلاحيات الإشراف على قسم المراقبة العامة
    const supervisorRef = doc(db, 'departments', 'general-monitoring', 'supervisors', userId);
    await setDoc(supervisorRef, {
      assignedAt: new Date(),
      assignedBy: 'system_admin',
      active: true
    });
    
    console.log('✅ تم إضافة صلاحيات الإشراف على قسم المراقبة العامة');
    
    // التحقق من النتيجة النهائية
    const updatedUserDoc = await userDoc.ref.get();
    if (updatedUserDoc.exists()) {
      console.log('📋 بيانات المستخدم بعد التحديث:', updatedUserDoc.data());
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ خطأ في إصلاح الصلاحيات:', error);
    return false;
  }
}

// تشغيل الإصلاح
fixKhalidPermissions().then((success) => {
  if (success) {
    console.log('🎉 تمت العملية بنجاح! يجب الآن أن تعمل صلاحيات خالد');
  } else {
    console.log('❌ فشلت العملية');
  }
}).catch((error) => {
  console.error('خطأ:', error);
}).finally(() => {
  process.exit(0);
});