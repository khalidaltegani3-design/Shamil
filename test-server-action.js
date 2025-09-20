// تعيين متغيرات البيئة للاختبار
process.env.QNAS_API_TOKEN = '7450ea7803c946b6afbf4bafc414a9d9';
process.env.QNAS_API_DOMAIN = 'socialtech.qa';

const { geocodeAddress } = require('./src/ai/flows/geocode-flow.ts');

async function testServerAction() {
  console.log('=== اختبار Server Action ===\n');
  
  try {
    console.log('اختبار إدخال صحيح...');
    const result1 = await geocodeAddress({ zone: '7', street: '15', building: '8' });
    console.log('النتيجة 1:', result1);
    console.log('نوع النتيجة:', typeof result1);
    console.log('هل النتيجة null؟', result1 === null);
    console.log('هل النتيجة undefined؟', result1 === undefined);
    
    if (result1) {
      console.log('خط العرض:', result1.lat, 'نوعه:', typeof result1.lat);
      console.log('خط الطول:', result1.lng, 'نوعه:', typeof result1.lng);
    }
    
  } catch (error) {
    console.error('خطأ في الاختبار:', error);
  }

  console.log('\n=== انتهاء اختبار Server Action ===');
}

testServerAction().catch(console.error);