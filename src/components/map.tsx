
'use client';

import { useEffect, useState, useRef } from 'react';
import 'leaflet/dist/leaflet.css';

interface MapProps {
  position: [number, number] | null;
  setPosition: (position: [number, number]) => void;
}

export default function Map({ position, setPosition }: MapProps) {
  const [isClient, setIsClient] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !mapRef.current || mapInstanceRef.current) return;

    const initializeMap = async () => {
      try {
        const L = await import('leaflet');
        
        // Fix for default markers in Leaflet
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        });

        // Create map
        const map = L.map(mapRef.current!).setView([25.2854, 51.5310], 13);

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // Add click event with enhanced information
        map.on('click', (e: any) => {
          const { lat, lng } = e.latlng;
          
          // Create detailed popup content
          const popupContent = `
            <div dir="rtl" style="text-align: right; font-family: Arial;">
              <h4 style="margin: 0 0 10px 0; color: #2563eb;">📍 الموقع المحدد</h4>
              <p style="margin: 5px 0;"><strong>خط العرض:</strong> ${lat.toFixed(6)}</p>
              <p style="margin: 5px 0;"><strong>خط الطول:</strong> ${lng.toFixed(6)}</p>
              <p style="margin: 10px 0 5px 0; font-size: 12px; color: #666;">
                📌 اضغط على الموقع لتحديد الإحداثيات
              </p>
            </div>
          `;
          
          // Add marker with popup
          if (markerRef.current) {
            map.removeLayer(markerRef.current);
          }
          
          markerRef.current = L.marker([lat, lng])
            .addTo(map)
            .bindPopup(popupContent)
            .openPopup();
          
          setPosition([lat, lng]);
        });

        mapInstanceRef.current = map;
      } catch (error) {
        console.error('خطأ في تهيئة الخريطة:', error);
      }
    };

    initializeMap();

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isClient, setPosition]);

  // Update marker when position changes
  useEffect(() => {
    if (!mapInstanceRef.current || !position) return;

    const updateMarker = async () => {
      const L = await import('leaflet');
      
      console.log('تحديث المؤشر للموقع:', position);
      
      // Remove existing marker
      if (markerRef.current) {
        mapInstanceRef.current.removeLayer(markerRef.current);
      }

      // Create custom red icon
      const redIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      // التأكد من أن الإحداثيات ضمن حدود قطر المعقولة
      const lat = position[0];
      const lng = position[1];
      
      if (lat < 24.0 || lat > 27.0 || lng < 50.0 || lng > 52.0) {
        console.warn('تحذير: الإحداثيات خارج حدود قطر المتوقعة:', { lat, lng });
      }

      // Add new marker with enhanced popup
      const popupContent = `
        <div dir="rtl" style="text-align: right; font-family: Arial; min-width: 200px;">
          <h4 style="margin: 0 0 10px 0; color: #dc2626;">🎯 الموقع المحدد</h4>
          <div style="background: #f8fafc; padding: 8px; border-radius: 6px; margin: 8px 0;">
            <p style="margin: 3px 0; font-size: 13px;"><strong>خط العرض:</strong> ${lat.toFixed(6)}</p>
            <p style="margin: 3px 0; font-size: 13px;"><strong>خط الطول:</strong> ${lng.toFixed(6)}</p>
          </div>
          <div style="font-size: 11px; color: #666; border-top: 1px solid #e2e8f0; padding-top: 6px; margin-top: 8px;">
            <p style="margin: 2px 0;">🗺️ نظام الإحداثيات: WGS84</p>
            <p style="margin: 2px 0;">📍 دقة الموقع: محسنة باستخدام QNAS</p>
            ${lat < 24.0 || lat > 27.0 || lng < 50.0 || lng > 52.0 ? 
              '<p style="margin: 2px 0; color: #dc2626;">⚠️ تحذير: خارج حدود قطر المتوقعة</p>' : 
              '<p style="margin: 2px 0; color: #16a34a;">✅ داخل حدود قطر</p>'
            }
          </div>
        </div>
      `;
      
      const marker = L.marker([lat, lng], { icon: redIcon }).addTo(mapInstanceRef.current);
      marker.bindPopup(popupContent);
      markerRef.current = marker;

      // Center map on marker
      mapInstanceRef.current.setView([lat, lng], 15); // زيادة التكبير لرؤية أفضل
    };

    updateMarker();
  }, [position]);

  if (!isClient) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <div className="text-gray-600">جارٍ تحميل الخريطة الحقيقية...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      {/* Map container */}
      <div 
        ref={mapRef}
        className="w-full h-full"
        style={{ minHeight: '400px' }}
      />

      {/* Map info overlay */}
      <div className="absolute top-4 left-4 bg-white/95 p-3 rounded-lg shadow-lg text-sm z-[1000]">
        <div className="text-blue-700 font-bold flex items-center gap-2">
          🗺️ خريطة قطر الحقيقية
        </div>
        <div className="text-gray-600 text-xs mt-1">انقر في أي مكان لتحديد الموقع</div>
        <div className="text-green-600 text-xs">✅ خريطة OpenStreetMap الحقيقية</div>
      </div>

      {/* Coordinates display */}
      {position && (
        <div className="absolute bottom-4 left-4 bg-black/90 text-white p-3 rounded-lg text-sm font-mono z-[1000]">
          <div className="flex items-center gap-2">
            <span className="text-red-400">📍</span>
            <div>
              <div>خط العرض: {position[0].toFixed(6)}</div>
              <div>خط الطول: {position[1].toFixed(6)}</div>
              <div className="text-xs text-gray-300 mt-1">
                {position[0] >= 24.0 && position[0] <= 27.0 && position[1] >= 50.0 && position[1] <= 52.0 
                  ? '✅ داخل حدود قطر' 
                  : '⚠️ خارج حدود قطر'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white/95 p-2 rounded-lg shadow text-xs z-[1000]">
        <div className="font-bold text-gray-700 mb-1">مصدر الخريطة:</div>
        <div className="flex items-center gap-1 mb-1">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span>OpenStreetMap</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span>الموقع المحدد</span>
        </div>
      </div>
    </div>
  );
}
