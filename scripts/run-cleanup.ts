import cleanupUsers from './cleanup-users-simple';

// تشغيل السكريپت
cleanupUsers().then(() => {
  console.log('🎉 انتهت عملية التنظيف');
  process.exit(0);
}).catch((error) => {
  console.error('💥 فشل في تنظيف المستخدمين:', error);
  process.exit(1);
});