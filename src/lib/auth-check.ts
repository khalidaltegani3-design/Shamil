import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export async function checkAuthState() {
    return new Promise((resolve, reject) => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            try {
                if (user) {
                    console.log('User is authenticated:', user.uid);
                    const userDoc = await getDoc(doc(db, 'users', user.uid));
                    if (userDoc.exists()) {
                        console.log('User document exists:', userDoc.data());
                    } else {
                        console.warn('No user document found');
                    }
                } else {
                    console.log('No user is signed in');
                }
                resolve(user);
            } catch (error) {
                console.error('Error checking auth state:', error);
                reject(error);
            } finally {
                unsubscribe();
            }
        });
    });
}