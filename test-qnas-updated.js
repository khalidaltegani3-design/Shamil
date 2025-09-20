const { queryQNAS } = require('./src/lib/qnas.ts');

// تعيين متغيرات البيئة للاختبار
process.env.QNAS_API_TOKEN = 'test-token';
process.env.QNAS_API_DOMAIN = 'test-domain';

async function testUpdatedQNAS() {
  console.log('=== اختبار QNAS المحدث ===\n');
  
  const testCases = [
    { zone: '1', street: '5', building: '10', description: 'الدوحة - وسط المدينة' },
    { zone: '7', street: '15', building: '8', description: 'السد' },
    { zone: '2', street: '20', building: '35', description: 'الريان' },
    { zone: '15', street: '3', building: '12', description: 'الخور' },
    { zone: '99', street: '1', building: '1', description: 'منطقة غير موجودة' },
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
      
    } catch (error) {
      console.log(`❌ خطأ: ${error.message}`);
    }
  }

  console.log('\n=== انتهاء الاختبار ===');
}

testUpdatedQNAS().catch(console.error);