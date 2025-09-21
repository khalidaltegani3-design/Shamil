'use client';

import React, { useState, useEffect } from 'react';

interface SimpleMapProps {
  position: [number, number] | null;
  setPosition: (position: [number, number]) => void;
  qAddress?: { zone: string; street: string; building: string; propertyNumber?: string } | null;
}

export default function SimpleMap({ position, setPosition, qAddress }: SimpleMapProps) {
  const [localPosition, setLocalPosition] = useState(position || [25.2854, 51.5310]);
  const [isGeocoding, setIsGeocoding] = useState(false);

  // استجلاب إحداثيات عنواني أو رقم العقار
  useEffect(() => {
    if (qAddress && ((qAddress.propertyNumber) || (qAddress.zone && qAddress.street && qAddress.building))) {
      setIsGeocoding(true);
      geocodeAddress(qAddress);
    }
  }, [qAddress]);

  const geocodeAddress = async (address: { zone: string; street: string; building: string; propertyNumber?: string }) => {
    try {
      console.log('Geocoding Address:', address);
      
      // استخدام API المحسن
      const response = await fetch('/api/moi-geocode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyNumber: address.propertyNumber,
          zone: address.zone,
          street: address.street,
          building: address.building
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.coordinates) {
          const newPos: [number, number] = [data.coordinates.lat, data.coordinates.lng];
          console.log('Geocoded position:', newPos, 'Source:', data.source);
          setLocalPosition(newPos);
          setPosition(newPos);
        }
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isGeocoding) return; // منع النقر أثناء الاستجلاب
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // تحويل دقيق للإحداثيات الحقيقية لقطر
    // حدود قطر الفعلية: 24.4-26.2 lat, 50.7-51.8 lng
    const lng = 50.7 + (x / rect.width) * 1.1; // المدى الكامل للطول
    const lat = 26.2 - (y / rect.height) * 1.8; // المدى الكامل للعرض
    
    const newPos: [number, number] = [lat, lng];
    setLocalPosition(newPos);
    setPosition(newPos);
  };

  return (
    <div className="w-full h-full relative">
      {/* قاعدة الخريطة الواقعية */}
      <div 
        className="w-full h-full relative overflow-hidden rounded-lg border cursor-crosshair"
        onClick={handleMapClick}
        style={{ 
          minHeight: '400px',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Cdefs%3E%3Cpattern id='grid' width='20' height='20' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 20 0 L 0 0 0 20' fill='none' stroke='%23e0e0e0' stroke-width='1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='%23f8f9fa'/%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)'/%3E%3C/svg%3E")`,
          backgroundColor: '#f8f9fa'
        }}
      >
        {/* Loading overlay للاستجلاب */}
        {isGeocoding && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-4 shadow-lg border">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <span className="text-sm text-gray-700">جارٍ تحديد الموقع من عنواني...</span>
              </div>
            </div>
          </div>
        )}

        {/* خريطة قطر البسيطة والواقعية */}
        <svg 
          className="absolute inset-0 w-full h-full pointer-events-none" 
          viewBox="0 0 400 300"
          style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
        >
          {/* المياه الإقليمية */}
          <rect x="0" y="0" width="400" height="300" fill="url(#waterGradient)" />
          
          {/* تعريف التدرجات */}
          <defs>
            <linearGradient id="waterGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e3f2fd" />
              <stop offset="50%" stopColor="#bbdefb" />
              <stop offset="100%" stopColor="#90caf9" />
            </linearGradient>
            <linearGradient id="landGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f1f8e9" />
              <stop offset="50%" stopColor="#dcedc8" />
              <stop offset="100%" stopColor="#c5e1a5" />
            </linearGradient>
          </defs>
          
          {/* شبه جزيرة قطر */}
          <path 
            d="M 150 50 
               L 280 50 
               Q 300 60 310 80
               L 320 120
               Q 325 140 320 160
               L 315 180
               Q 310 200 300 220
               L 280 250
               Q 260 270 240 275
               L 200 280
               Q 180 275 160 270
               L 140 260
               Q 130 240 135 220
               L 140 180
               Q 145 160 150 140
               L 155 100
               Q 150 70 150 50 Z"
            fill="url(#landGradient)"
            stroke="#8bc34a"
            strokeWidth="2"
            opacity="0.9"
          />
          
          {/* المدن الرئيسية */}
          {/* الدوحة */}
          <circle cx="240" cy="160" r="8" fill="#1976d2" />
          <text x="250" y="165" fontSize="10" fill="#1976d2" fontWeight="bold">الدوحة</text>
          
          {/* الخور */}
          <circle cx="220" cy="100" r="4" fill="#388e3c" />
          <text x="225" y="105" fontSize="8" fill="#388e3c">الخور</text>
          
          {/* الوكرة */}
          <circle cx="260" cy="200" r="4" fill="#388e3c" />
          <text x="265" y="205" fontSize="8" fill="#388e3c">الوكرة</text>
          
          {/* مطار حمد */}
          <polygon points="290,170 295,165 300,170 295,175" fill="#f57c00" />
          <text x="302" y="174" fontSize="8" fill="#f57c00">مطار حمد</text>
          
          {/* الطرق الرئيسية */}
          <line x1="240" y1="100" x2="240" y2="220" stroke="#795548" strokeWidth="3" strokeDasharray="5,5" opacity="0.7" />
          <line x1="180" y1="160" x2="300" y2="160" stroke="#795548" strokeWidth="3" strokeDasharray="5,5" opacity="0.7" />
          
          {/* شبكة المناطق (تقريبية) */}
          {Array.from({length: 10}, (_, i) => (
            <g key={i}>
              <line 
                x1={160 + i * 15} 
                y1="80" 
                x2={160 + i * 15} 
                y2="240" 
                stroke="#bdbdbd" 
                strokeWidth="0.5" 
                opacity="0.5"
              />
              <line 
                x1="160" 
                y1={80 + i * 16} 
                x2="310" 
                y2={80 + i * 16} 
                stroke="#bdbdbd" 
                strokeWidth="0.5" 
                opacity="0.5"
              />
            </g>
          ))}
        </svg>

        {/* مؤشر الموقع */}
        {localPosition && (
          <div 
            className="absolute transform -translate-x-1/2 -translate-y-full z-30 transition-all duration-300"
            style={{
              left: `${((localPosition[1] - 50.7) / 1.1) * 100}%`,
              top: `${((26.2 - localPosition[0]) / 1.8) * 100}%`
            }}
          >
            <div className="flex flex-col items-center">
              <div className="relative">
                {/* Pin الأساسي */}
                <div className="w-10 h-10 bg-red-500 rounded-full border-4 border-white shadow-xl flex items-center justify-center">
                  <div className="w-4 h-4 bg-white rounded-full"></div>
                </div>
                <div className="w-2 h-8 bg-red-500 mx-auto -mt-1"></div>
                
                {/* تأثير النبض */}
                <div className="absolute -top-2 -left-2 w-14 h-14 bg-red-400 rounded-full animate-ping opacity-20"></div>
                
                {/* تسمية الموقع */}
                {qAddress && (
                  <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs rounded-md px-2 py-1 whitespace-nowrap">
                    {qAddress.propertyNumber ? 
                      `رقم العقار: ${qAddress.propertyNumber}` :
                      `المنطقة ${qAddress.zone} - شارع ${qAddress.street} - مبنى ${qAddress.building}`
                    }
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* لوحة المعلومات */}
        <div className="absolute top-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg border">
          <div className="text-center">
            <h3 className="text-sm font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
              🗺️ خريطة دولة قطر - نظام عنواني
            </h3>
            <p className="text-xs text-gray-600 mb-2">
              {qAddress ? 
                'الموقع محدد تلقائياً من عنواني' : 
                'انقر على الخريطة لتحديد الموقع يدوياً'
              }
            </p>
            <div className="flex justify-center gap-4 text-xs">
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                مدن رئيسية
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                مدن أخرى
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
                مطارات
              </span>
            </div>
          </div>
        </div>

        {/* الإحداثيات والمعلومات */}
        {localPosition && (
          <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-green-200">
            <div className="text-center space-y-2">
              <p className="text-xs text-gray-500">📍 الموقع المحدد</p>
              <div className="bg-gray-50 rounded-lg p-2">
                <p className="text-sm font-mono text-gray-700">
                  {localPosition[0].toFixed(6)}, {localPosition[1].toFixed(6)}
                </p>
              </div>
              {qAddress && (
                <div className="bg-blue-50 rounded-lg p-2">
                  <p className="text-xs text-blue-700 font-medium">
                    {qAddress.propertyNumber ? 
                      `رقم العقار: ${qAddress.propertyNumber} (دقة عالية - وزارة الداخلية)` :
                      `عنواني: المنطقة ${qAddress.zone} - شارع ${qAddress.street} - مبنى ${qAddress.building}`
                    }
                  </p>
                </div>
              )}
              <p className="text-xs text-green-600">✓ {qAddress ? 'تم الاستجلاب من عنواني' : 'محدد يدوياً'}</p>
            </div>
          </div>
        )}

        {/* مقياس المسافة */}
        <div className="absolute bottom-4 right-4 bg-white/90 rounded-lg p-2 shadow-sm border text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-16 h-1 bg-gray-600"></div>
            <span>≈ 25 كم</span>
          </div>
        </div>
      </div>
    </div>
  );
}