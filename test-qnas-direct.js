// اختبار مباشر لـ QNAS API
const token = "7450ea7803c946b6afbf4bafc414a9d9";
const domain = "socialtech.qa";

async function testQNAS() {
    const zone = "6";
    const street = "984"; 
    const building = "29";
    
    // تجربة عناوين مختلفة لعنواني
    const possibleUrls = [
        `https://www.qnas.qa/api/v1/get_location/${zone}/${street}/${building}`,
        `https://qnas.qa/api/v1/get_location/${zone}/${street}/${building}`,
        `https://api.qnas.gov.qa/v1/get_location/${zone}/${street}/${building}`,
        `https://www.qnas.gov.qa/api/v1/get_location/${zone}/${street}/${building}`,
        `https://maps.qnas.qa/api/v1/get_location/${zone}/${street}/${building}`
    ];
    
    for (const url of possibleUrls) {
        console.log(`🔍 اختبار URL: ${url}`);
        
        try {
        const response = await fetch(url, {
            headers: {
                'X-Token': token,
                'X-Domain': domain,
                'Accept': 'application/json',
            },
        });
        
        console.log(`📡 استجابة الخادم: ${response.status} ${response.statusText}`);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.log(`❌ نص الخطأ: ${errorText}`);
            return;
        }
        
        const data = await response.json();
        console.log('✅ البيانات المستلمة:', JSON.stringify(data, null, 2));
        
        // التحقق من الإحداثيات
        if (data.lat && data.lng) {
            const lat = parseFloat(data.lat);
            const lng = parseFloat(data.lng);
            console.log(`📍 الإحداثيات: ${lat}, ${lng}`);
            
            if (lat >= 24.5 && lat <= 26.2 && lng >= 50.7 && lng <= 51.7) {
                console.log('✅ الإحداثيات ضمن نطاق قطر');
            } else {
                console.log('⚠️ الإحداثيات خارج نطاق قطر');
            }
        } else {
            console.log('❌ لم يتم استلام إحداثيات صحيحة');
        }
        
        } catch (error) {
            console.error('❌ خطأ في الاختبار:', error);
        }
    }
}

testQNAS();