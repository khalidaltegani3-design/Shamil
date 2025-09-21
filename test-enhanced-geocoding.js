// اختبار النظام المحسن لـ QNAS geocoding
const fs = require('fs');

// محاكاة دالة qnasToCoordinates
function calculateEnhancedCoordinates(zone, street, building) {
  // خريطة المناطق المحسنة
  const QATAR_ZONES = {
    '1': { lat: 25.2854, lng: 51.5310, name: 'الدوحة - وسط المدينة' },
    '2': { lat: 25.3548, lng: 51.4326, name: 'الريان' },
    '3': { lat: 25.3052, lng: 51.4663, name: 'الغرافة' },
    '4': { lat: 25.2776, lng: 51.5369, name: 'الدفنة' },
    '5': { lat: 25.3167, lng: 51.4833, name: 'العزيزية' },
    '6': { lat: 25.2642, lng: 51.5558, name: 'النصر' },
    '7': { lat: 25.2397, lng: 51.5661, name: 'السد' },
  };

  const zoneData = QATAR_ZONES[zone] || QATAR_ZONES['1'];
  const streetNum = parseInt(street);
  const buildingNum = parseInt(building);

  // الخوارزمية المحسنة
  const streetBaseLat = (streetNum % 20) * 0.0015;
  const streetBaseLng = Math.floor(streetNum / 20) * 0.0018;
  
  const buildingOffsetLat = ((buildingNum % 10) - 5) * 0.0003;
  const buildingOffsetLng = (Math.floor(buildingNum / 10) % 8) * 0.0004;
  
  const gridPatternLat = (streetNum % 2 === 0 ? 1 : -1) * 0.0005;
  const gridPatternLng = (buildingNum % 2 === 0 ? 1 : -1) * 0.0006;
  
  const finalLat = zoneData.lat + streetBaseLat + buildingOffsetLat + gridPatternLat;
  const finalLng = zoneData.lng + streetBaseLng + buildingOffsetLng + gridPatternLng;

  // التحقق من الحدود
  const isValidQatarCoordinate = (lat, lng) => {
    return lat >= 24.4 && lat <= 26.2 && lng >= 50.7 && lng <= 51.7;
  };

  return {
    zone,
    street,
    building,
    zoneName: zoneData.name,
    coordinates: { lat: finalLat, lng: finalLng },
    isValid: isValidQatarCoordinate(finalLat, finalLng),
    distance: Math.sqrt(
      Math.pow((finalLat - zoneData.lat) * 111000, 2) + 
      Math.pow((finalLng - zoneData.lng) * 111000 * Math.cos(finalLat * Math.PI / 180), 2)
    ).toFixed(0) + ' متر'
  };
}

// اختبار عدة عناوين
const testAddresses = [
  { zone: '7', street: '15', building: '8' },
  { zone: '1', street: '10', building: '5' },
  { zone: '2', street: '25', building: '12' },
  { zone: '5', street: '8', building: '3' },
  { zone: '6', street: '30', building: '20' },
];

console.log('🧪 اختبار النظام المحسن لحساب الإحداثيات\n');
console.log('=' .repeat(80));

testAddresses.forEach((address, index) => {
  const result = calculateEnhancedCoordinates(address.zone, address.street, address.building);
  
  console.log(`\n🏠 العنوان ${index + 1}: المنطقة ${address.zone} - الشارع ${address.street} - المبنى ${address.building}`);
  console.log(`📍 المنطقة: ${result.zoneName}`);
  console.log(`📌 الإحداثيات: ${result.coordinates.lat.toFixed(6)}, ${result.coordinates.lng.toFixed(6)}`);
  console.log(`✅ صحة الإحداثيات: ${result.isValid ? 'داخل حدود قطر' : 'خارج حدود قطر'}`);
  console.log(`📏 المسافة من مركز المنطقة: ${result.distance}`);
  console.log(`🌐 رابط Google Maps: https://maps.google.com/maps?q=${result.coordinates.lat},${result.coordinates.lng}`);
});

console.log('\n' + '=' .repeat(80));
console.log('📊 ملخص التحسينات:');
console.log('• خوارزمية محسنة لحساب الإزاحة بناءً على أنماط التطوير العمراني');
console.log('• نمط شبكي يحاكي التخطيط العمراني في قطر');
console.log('• التحقق من صحة الإحداثيات ضمن حدود قطر الجغرافية');
console.log('• حساب المسافة من مركز المنطقة');
console.log('• معلومات تفصيلية عن كل موقع محدد');

// حفظ النتائج في ملف
const results = testAddresses.map(address => calculateEnhancedCoordinates(address.zone, address.street, address.building));
fs.writeFileSync('enhanced-geocoding-results.json', JSON.stringify(results, null, 2), 'utf8');
console.log('\n💾 تم حفظ النتائج في: enhanced-geocoding-results.json');