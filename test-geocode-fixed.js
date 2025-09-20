// تعيين متغيرات البيئة للاختبار
process.env.QNAS_API_TOKEN = '7450ea7803c946b6afbf4bafc414a9d9';
process.env.QNAS_API_DOMAIN = 'socialtech.qa';

const { geocodeAddress } = require('./src/ai/flows/geocode-flow.ts');

async function testGeocode() {
  console.log('=== اختبار دالة geocodeAddress ===\n');
  
  const testCases = [
    { zone: '1', street: '5', building: '10', description: 'الدوحة - وسط المدينة' },
    { zone: '7', street: '15', building: '8', description: 'السد' },
    { zone: '2', street: '20', building: '35', description: 'الريان' },
  ];

  for (const testCase of testCases) {
    try {
      console.log(`\n--- اختبار: ${testCase.description} ---`);
      console.log(`المدخلات: منطقة=${testCase.zone}, شارع=${testCase.street}, مبنى=${testCase.building}`);
      
      const result = await geocodeAddress({
        zone: testCase.zone,
        street: testCase.street,
        building: testCase.building
      });
      
      console.log('✅ النتيجة:');
      console.log(`   خط العرض: ${result.lat}`);
      console.log(`   خط الطول: ${result.lng}`);
      console.log(`   نوع خط العرض: ${typeof result.lat}`);
      console.log(`   نوع خط الطول: ${typeof result.lng}`);
      
    } catch (error) {
      console.log(`❌ خطأ: ${error.message}`);
      console.log(`   تفاصيل الخطأ:`, error);
    }
  }

  console.log('\n=== انتهاء اختبار geocodeAddress ===');
}

testGeocode().catch(console.error);