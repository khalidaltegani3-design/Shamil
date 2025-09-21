// فحص الشبكة في موقع عنواني
const https = require('https');
const fs = require('fs');

console.log('جاري فحص موقع وزارة الداخلية...');

// فحص ملفات JavaScript في الموقع
const url = 'https://maps.moi.gov.qa/publicgis/';

https.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('جاري البحث عن API endpoints...');
    
    // البحث عن patterns شائعة للـ APIs
    const patterns = [
      /https?:\/\/[^"'\s]+api[^"'\s]*/gi,
      /https?:\/\/[^"'\s]+rest[^"'\s]*/gi,
      /https?:\/\/[^"'\s]+service[^"'\s]*/gi,
      /https?:\/\/[^"'\s]+geocode[^"'\s]*/gi,
      /https?:\/\/[^"'\s]+moi\.gov\.qa[^"'\s]*/gi,
    ];
    
    patterns.forEach((pattern, index) => {
      const matches = data.match(pattern);
      if (matches) {
        console.log(`Pattern ${index + 1} matches:`);
        [...new Set(matches)].forEach(match => console.log('  -', match));
        console.log('');
      }
    });
    
    // البحث عن معرفات API keys أو endpoints
    const keyPatterns = [
      /["']([^"']*api[^"']*)["']/gi,
      /["']([^"']*geocode[^"']*)["']/gi,
      /["']([^"']*service[^"']*)["']/gi,
      /url\s*:\s*["']([^"']+)["']/gi,
    ];
    
    console.log('البحث عن configurations:');
    keyPatterns.forEach((pattern, index) => {
      const matches = [...data.matchAll(pattern)];
      if (matches.length > 0) {
        console.log(`Config Pattern ${index + 1}:`);
        matches.slice(0, 10).forEach(match => {
          if (match[1] && (match[1].includes('api') || match[1].includes('service') || match[1].includes('geocode'))) {
            console.log('  -', match[1]);
          }
        });
        console.log('');
      }
    });
    
    // حفظ الكود المصدري للفحص اليدوي
    fs.writeFileSync('moi-source.html', data);
    console.log('تم حفظ الكود المصدري في moi-source.html');
  });
}).on('error', (err) => {
  console.log('خطأ:', err.message);
});