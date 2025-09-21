// فحص موقع geoportal Qatar
const https = require('https');

console.log('🌐 جاري فحص geoportal.gisqatar.org.qa...');

function fetchWithRedirects(url, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ar,en;q=0.9',
      }
    }, (res) => {
      console.log(`📊 Status: ${res.statusCode} for ${url}`);
      console.log(`📋 Headers:`, Object.keys(res.headers));
      
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        if (maxRedirects > 0) {
          console.log(`🔄 Redirecting to: ${res.headers.location}`);
          return fetchWithRedirects(res.headers.location, maxRedirects - 1)
            .then(resolve)
            .catch(reject);
        } else {
          reject(new Error('Too many redirects'));
        }
      }
      
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });

    req.on('error', reject);
    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

async function analyzeQatarGIS() {
  try {
    // اختبار الصفحة الأساسية
    console.log('\n1. اختبار الصفحة الأساسية...');
    const mainPage = await fetchWithRedirects('https://geoportal.gisqatar.org.qa/');
    console.log(`✅ تم تحميل الصفحة الأساسية: ${mainPage.statusCode}`);
    
    // البحث عن JS files وAPI references
    const jsMatches = mainPage.data.match(/src=["']([^"']*\.js[^"']*)["']/g);
    const apiMatches = mainPage.data.match(/(api|service|rest|arcgis)[^"'\s]*/gi);
    
    if (jsMatches) {
      console.log('\n📜 JavaScript files found:');
      jsMatches.slice(0, 10).forEach(match => {
        const src = match.match(/src=["']([^"']*)["']/)[1];
        console.log(`  - ${src}`);
      });
    }
    
    if (apiMatches) {
      console.log('\n🔗 API references found:');
      [...new Set(apiMatches)].slice(0, 10).forEach(match => {
        console.log(`  - ${match}`);
      });
    }

    // اختبار صفحة myaddress
    console.log('\n2. اختبار صفحة myaddress...');
    try {
      const myAddressPage = await fetchWithRedirects('https://geoportal.gisqatar.org.qa/myaddress/');
      console.log(`✅ myaddress page: ${myAddressPage.statusCode}`);
      
      // البحث عن config أو API في myaddress
      const configMatches = myAddressPage.data.match(/config\s*[:=]\s*{[^}]*}/gi);
      const urlMatches = myAddressPage.data.match(/url\s*[:=]\s*["']([^"']*api[^"']*)["']/gi);
      
      if (configMatches) {
        console.log('\n⚙️ Config found in myaddress:');
        configMatches.slice(0, 3).forEach(config => {
          console.log(config.substring(0, 200) + '...');
        });
      }
      
      if (urlMatches) {
        console.log('\n🌐 API URLs in myaddress:');
        urlMatches.forEach(match => {
          console.log(`  - ${match}`);
        });
      }
    } catch (error) {
      console.log(`❌ myaddress error: ${error.message}`);
    }

    // محاولة العثور على دليل الخدمات
    console.log('\n3. اختبار مسارات محتملة...');
    const testPaths = [
      '/services',
      '/api',
      '/rest',
      '/gis',
      '/arcgis/rest/services',
      '/server/rest/services'
    ];

    for (const path of testPaths) {
      try {
        const url = `https://geoportal.gisqatar.org.qa${path}`;
        const result = await fetchWithRedirects(url);
        if (result.statusCode === 200) {
          console.log(`✅ Found: ${url} - ${result.statusCode}`);
          console.log(`Content preview: ${result.data.substring(0, 200)}...`);
        }
      } catch (error) {
        console.log(`❌ ${path}: ${error.message}`);
      }
    }

  } catch (error) {
    console.log(`❌ Main error: ${error.message}`);
  }
}

analyzeQatarGIS();