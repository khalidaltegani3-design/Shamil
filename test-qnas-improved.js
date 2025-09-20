const { queryQNAS } = require('./src/lib/qnas-improved.ts');

// تعيين متغيرات البيئة للاختبار
process.env.QNAS_API_TOKEN = 'test-token';
process.env.QNAS_API_DOMAIN = 'test-domain';

async function testQNASImproved() {
  console.log('=== اختبار QNAS المحسن ===\n');
  
  const testCases = [
    { zone: '1', street: '5', building: '10', description: 'الدوحة - وسط المدينة' },
    { zone: '2', street: '12', building: '25', description: 'الريان' },
    { zone: '7', street: '8', building: '15', description: 'السد' },
    { zone: '٣', street: '١٥', building: '٢٠', description: 'الغرافة (أرقام عربية)' },
    { zone: '100', street: '1', building: '1', description: 'منطقة غير موجودة (سيستخدم وسط الدوحة)' },
  ];

  for (const testCase of testCases) {
    try {
      console.log(`\n--- اختبار: ${testCase.description} ---`);
      console.log(`المدخلات: منطقة=${testCase.zone}, شارع=${testCase.street}, مبنى=${testCase.building}`);
      
      const result = await queryQNAS(testCase.zone, testCase.street, testCase.building);
      
      console.log('✅ النتيجة:');
      console.log(`   خط العرض: ${result.lat}`);
      console.log(`   خط الطول: ${result.lng}`);
      console.log(`   الحالة: ${result.status}`);
      console.log(`   منطقة محولة: ${result.zone}`);
      console.log(`   شارع محول: ${result.street}`);
      console.log(`   مبنى محول: ${result.building}`);
      
    } catch (error) {
      console.log(`❌ خطأ: ${error.message}`);
      if (error.code) {
        console.log(`   كود الخطأ: ${error.code}`);
      }
    }
  }

  console.log('\n=== انتهاء الاختبار ===');
}

testQNASImproved().catch(console.error);