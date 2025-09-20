@echo off
REM سكريبت Windows لإعداد متغيرات البيئة الحساسة في Firebase App Hosting
REM Windows script to set up sensitive environment variables in Firebase App Hosting

echo 🔧 إعداد متغيرات البيئة الحساسة في Firebase App Hosting
echo Setting up sensitive environment variables in Firebase App Hosting
echo ==================================================

REM التحقق من تسجيل الدخول
echo 1️⃣ التحقق من تسجيل الدخول في Firebase...
firebase projects:list

REM تعيين المشروع
echo 2️⃣ تعيين مشروع Firebase...
firebase use zoliapp-lite

REM إنشاء الـ secrets
echo 3️⃣ إنشاء الـ secrets...

echo 📝 إنشاء QNAS_API_TOKEN...
echo 7450ea7803c946b6afbf4bafc414a9d9 | firebase apphosting:secrets:set QNAS_API_TOKEN

echo 📝 إنشاء QNAS_API_DOMAIN...
echo socialtech.qa | firebase apphosting:secrets:set QNAS_API_DOMAIN

echo 📝 إنشاء GOOGLE_MAPS_API_KEY...
echo AIzaSyDKtxqu6YRoZQCeD9EoFmxAvc9JLi_d5R8 | firebase apphosting:secrets:set GOOGLE_MAPS_API_KEY

echo 📝 إنشاء GEMINI_API_KEY...
echo AIzaSyDKtxqu6YRoZQCeD9EoFmxAvc9JLi_d5R8 | firebase apphosting:secrets:set GEMINI_API_KEY

echo 📝 إنشاء GOOGLE_API_KEY...
echo AIzaSyDKtxqu6YRoZQCeD9EoFmxAvc9JLi_d5R8 | firebase apphosting:secrets:set GOOGLE_API_KEY

echo ✅ تم إنشاء جميع الـ secrets بنجاح!
echo All secrets created successfully!

echo.
echo 📋 الخطوات التالية:
echo Next steps:
echo 1. ادفع الكود إلى GitHub (git push)
echo    Push code to GitHub (git push)
echo 2. راقب النشر في Firebase Console
echo    Monitor deployment in Firebase Console
echo 3. تحقق من الـ logs إذا كان هناك أخطاء
echo    Check logs if there are any errors

pause