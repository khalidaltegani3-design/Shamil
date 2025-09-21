// سكريبت سريع لترقية مستخدم إلى مشرف للاختبار
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, updateDoc, getDoc, setDoc } = require('firebase/firestore');

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

async function promoteUserToSupervisor(userEmail) {
  try {
    console.log('🔍 البحث عن المستخدم بالبريد الإلكتروني:', userEmail);
    
    // هنا يجب أن نبحث عن المستخدم بالإيميل أولاً
    // للتبسيط، سنستخدم UID مباشرة إذا توفر
    
    console.log('❌ هذا السكريبت يحتاج UID المستخدم، وليس الإيميل فقط');
    console.log('📋 خطوات بديلة:');
    console.log('1. سجل دخول كمدير نظام');
    console.log('2. اذهب لإدارة المستخدمين');
    console.log('3. أنشئ مستخدم جديد أو رقّ موجود');
    console.log('4. استخدم الزر "ترقية لمشرف"');
    
  } catch (error) {
    console.error('❌ خطأ:', error);
  }
}

// استخدم UID المستخدم إذا كان متوفراً
async function promoteUserByUID(uid) {
  try {
    console.log('🔄 ترقية المستخدم:', uid);
    
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      console.log('⚠️ المستخدم غير موجود، سيتم إنشاؤه');
      await setDoc(userRef, {
        role: 'supervisor',
        email: 'test-supervisor@example.com',
        displayName: 'مشرف تجريبي',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    } else {
      await updateDoc(userRef, {
        role: 'supervisor',
        updatedAt: new Date()
      });
    }
    
    console.log('✅ تم ترقية المستخدم إلى مشرف بنجاح');
    
  } catch (error) {
    console.error('❌ خطأ في الترقية:', error);
  }
}

console.log('🧪 سكريبت اختبار ترقية المشرف');
console.log('📋 للاستخدام:');
console.log('1. استخدم واجهة مدير النظام لترقية المستخدمين');
console.log('2. أو اتصل بـ promoteUserByUID("USER_UID") إذا كان لديك UID');

// مثال: promoteUserByUID("some-user-uid");