import { auth, db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export async function ensureSystemAdminExists() {
  const user = auth.currentUser;
  if (!user) return;

  const cleanEmail = (user.email || '').toLowerCase().trim();
  const systemAdminEmail = "sweetdream711711@gmail.com";
  
  if (cleanEmail === systemAdminEmail) {
    console.log('Ensuring system admin document exists');
    
    try {
      const adminDocRef = doc(db, 'users', user.uid);
      const adminDoc = await getDoc(adminDocRef);
      
      if (!adminDoc.exists()) {
        console.log('Creating system admin document');
        await setDoc(adminDocRef, {
          email: user.email,
          displayName: user.displayName || 'مدير النظام',
          role: 'system_admin',
          isSystemAdmin: true,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      } else {
        // تحديث الوثيقة الموجودة لضمان وجود الحقول المطلوبة
        console.log('Updating system admin document');
        await setDoc(adminDocRef, {
          role: 'system_admin',
          isSystemAdmin: true,
          updatedAt: new Date()
        }, { merge: true });
      }
      
      console.log('System admin document ensured');
      return true;
    } catch (error) {
      console.error('Error ensuring system admin document:', error);
      return false;
    }
  }
  
  return false;
}