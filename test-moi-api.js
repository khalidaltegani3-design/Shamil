// اختبار API عنواني المحدث
const testMOIGeocode = async () => {
  const zone = '91';
  const street = '212';
  const building = '399';

  // تجربة عدة endpoints محتملة لعنواني
  const urls = [
    // عنواني الرسمي
    `https://maps.moi.gov.qa/publicgis/rest/services/MOI/Enwaani_Geocode/GeocodeServer/findAddressCandidates?f=json&Zone=${zone}&Street=${street}&Building=${building}`,
    `https://maps.moi.gov.qa/gis/rest/services/Enwaani/GeocodeServer/findAddressCandidates?f=json&Zone=${zone}&Street=${street}&Building=${building}`,
    `https://enwaani.moi.gov.qa/api/geocode?zone=${zone}&street=${street}&building=${building}`,
    `https://maps.moi.gov.qa/publicgis/rest/services/Enwaani/MapServer/find?searchText=${zone}+${street}+${building}&f=json`,
  ];

  for (const url of urls) {
    try {
      console.log(`جاري تجربة: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://maps.moi.gov.qa/publicgis/',
        },
      });

      console.log(`الحالة: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('البيانات المستلمة:', JSON.stringify(data, null, 2));
      } else {
        console.log('فشل الطلب:', response.statusText);
      }
    } catch (error) {
      console.log('خطأ:', error.message);
    }
    console.log('---');
  }
};

testMOIGeocode();