
// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "zoliapp-lite",
  "appId": "1:476068628948:web:165d13bde99768e353ee41",
  "storageBucket": "zoliapp-lite.firebasestorage.app",
  "apiKey": "AIzaSyDKtxqu6YRoZQCeD9EoFmxAvc9JLi_d5R8",
  "authDomain": "zoliapp-lite.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "476068628948"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export { app };
