// اختبار سريع للتأكد من عمل نظام مدير النظام
console.log('Testing system admin email matching...');

const testEmail = "Sweetdream711711@gmail.com";
const cleanEmail = testEmail.toLowerCase().trim();
const systemAdminEmail = "sweetdream711711@gmail.com";

console.log('Original email:', testEmail);
console.log('Clean email:', cleanEmail);
console.log('System admin email:', systemAdminEmail);
console.log('Match result:', cleanEmail === systemAdminEmail);

// اختبار مع مسافات
const emailWithSpaces = " Sweetdream711711@gmail.com ";
const cleanEmailWithSpaces = emailWithSpaces.toLowerCase().trim();
console.log('Email with spaces:', emailWithSpaces);
console.log('Clean email with spaces:', cleanEmailWithSpaces);
console.log('Match result with spaces:', cleanEmailWithSpaces === systemAdminEmail);