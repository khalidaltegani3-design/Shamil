import { initializeApp } from 'firebase/app';
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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function promoteKhalidToSupervisor() {
  try {
    console.log('🔍 البحث عن المستخدم khalid...');
    
    // البحث عن المستخدم بالإيميل
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', 'end2012.19+1@gmail.com'));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log('❌ المستخدم غير موجود');
      return;
    }
    
    const userDoc = querySnapshot.docs[0];
    const userId = userDoc.id;
    const userData = userDoc.data();
    
    console.log('📋 بيانات المستخدم الحالية:', userData);
    
    // ترقية المستخدم إلى مشرف
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      role: 'supervisor',
      updatedAt: new Date()
    });
    
    console.log('✅ تم ترقية المستخدم إلى مشرف بنجاح');
    
    // إضافة صلاحيات الإشراف على قسم المراقبة العامة
    const supervisorRef = doc(db, 'departments', 'general-monitoring', 'supervisors', userId);
    await setDoc(supervisorRef, {
      assignedAt: new Date(),
      assignedBy: 'system_admin'
    });
    
    console.log('✅ تم إضافة صلاحيات الإشراف على قسم المراقبة العامة');
    
    return true;
    
  } catch (error) {
    console.error('❌ خطأ في الترقية:', error);
    return false;
  }
}

// تشغيل الترقية
promoteKhalidToSupervisor().then((success) => {
  if (success) {
    console.log('🎉 تمت العملية بنجاح! يمكن الآن تسجيل الدخول كمشرف');
  } else {
    console.log('❌ فشلت العملية');
  }
  process.exit();
});