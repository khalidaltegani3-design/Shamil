// اختبار geoportal Qatar GIS
const https = require('https');

console.log('🔍 جاري اختبار geoportal Qatar GIS...');

// قائمة endpoints محتملة للاختبار
const endpoints = [
  'https://geoportal.gisqatar.org.qa/api/geocode',
  'https://geoportal.gisqatar.org.qa/rest/services',
  'https://geoportal.gisqatar.org.qa/arcgis/rest/services',
  'https://geoportal.gisqatar.org.qa/server/rest/services',
  'https://geoportal.gisqatar.org.qa/myaddress/api',
  'https://gis.gisqatar.org.qa/arcgis/rest/services',
  'https://services.gisqatar.org.qa/arcgis/rest/services',
];

// اختبار كل endpoint
async function testEndpoint(url) {
  return new Promise((resolve) => {
    const req = https.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json, text/html, */*',
        'Accept-Language': 'ar,en;q=0.9',
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          url,
          status: res.statusCode,
          contentType: res.headers['content-type'],
          data: data.substring(0, 500) // أول 500 حرف فقط
        });
      });
    });

    req.on('error', (err) => {
      resolve({
        url,
        status: 'ERROR',
        error: err.message
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        url,
        status: 'TIMEOUT',
        error: 'Request timeout'
      });
    });
  });
}

// تشغيل الاختبارات
async function runTests() {
  console.log('🚀 بدء اختبار Endpoints...\n');
  
  for (const endpoint of endpoints) {
    console.log(`📡 اختبار: ${endpoint}`);
    const result = await testEndpoint(endpoint);
    
    if (result.status === 200) {
      console.log(`✅ نجح! Status: ${result.status}`);
      console.log(`📋 Content-Type: ${result.contentType}`);
      if (result.data.includes('services') || result.data.includes('rest') || result.data.includes('api')) {
        console.log(`🎯 يحتوي على services/api! المحتوى:`);
        console.log(result.data.substring(0, 300));
      }
    } else {
      console.log(`❌ فشل: ${result.status} - ${result.error || 'Unknown error'}`);
    }
    console.log('─'.repeat(60));
  }

  // اختبار endpoints ArcGIS الافتراضية
  console.log('\n🗺️ اختبار ArcGIS REST Services...');
  const arcgisEndpoints = [
    'https://geoportal.gisqatar.org.qa/arcgis/rest/services/Qatar/Qatar_Layers/MapServer',
    'https://geoportal.gisqatar.org.qa/arcgis/rest/services/Geocoding/Geocode_Service/GeocodeServer',
    'https://services.gisqatar.org.qa/arcgis/rest/services/Qatar/Qatar_Basemap/MapServer',
  ];

  for (const endpoint of arcgisEndpoints) {
    console.log(`🗺️ اختبار ArcGIS: ${endpoint}`);
    const result = await testEndpoint(endpoint);
    
    if (result.status === 200 || result.status === 'ERROR') {
      console.log(`Status: ${result.status}`);
      if (result.data && result.data.includes('currentVersion')) {
        console.log('🎉 وجد ArcGIS Service!');
        console.log(result.data.substring(0, 400));
      }
    }
    console.log('─'.repeat(60));
  }
}

runTests().catch(console.error);