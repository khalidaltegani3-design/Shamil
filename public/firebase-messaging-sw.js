// This file needs to be in the public directory

// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here. Other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
firebase.initializeApp({
  apiKey: "AIzaSyDKtxqu6YRoZQCeD9EoFmxAvc9JLi_d5R8",
  authDomain: "zoliapp-lite.firebaseapp.com",
  projectId: "zoliapp-lite",
  storageBucket: "zoliapp-lite.firebasestorage.app",
  messagingSenderId: "476068628948",
  appId: "1:476068628948:web:55c0eaf993de1cc553ee41"
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  if (!payload.notification) {
      return;
  }

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon || '/firebase-logo.png', // Default icon
    data: payload.data || {}
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
