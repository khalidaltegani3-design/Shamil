// test-geocode.ts
import { geocodeAddress } from './src/ai/flows/geocode-flow';

async function testGeocoding() {
    try {
        const result = await geocodeAddress({
            zone: "6",
            street: "984",
            building: "29"
        });
        
        console.log("نجح التحويل!");
        console.log("الإحداثيات المستلمة:", result);
        
        // التحقق من صحة الإحداثيات
        if (result && result.lat >= 24.5 && result.lat <= 26.2 && 
            result.lng >= 50.7 && result.lng <= 51.7) {
            console.log("الإحداثيات تقع ضمن نطاق دولة قطر");
            console.log(`الموقع: ${result.lat}, ${result.lng}`);
        } else {
            console.log("تحذير: الإحداثيات خارج النطاق المتوقع لدولة قطر");
        }
        
    } catch (error) {
        console.error("فشل التحويل:", error instanceof Error ? error.message : String(error));
    }
}

testGeocoding();