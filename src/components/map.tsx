
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
          
          // Create simple popup content
          const popupContent = `
            <div dir="rtl" style="text-align: right; font-family: Arial; min-width: 120px;">
              <h4 style="margin: 0 0 8px 0; color: #2563eb; font-size: 14px;">📍 الموقع المحدد</h4>
              <p style="margin: 3px 0; font-size: 12px;">${lat.toFixed(4)}, ${lng.toFixed(4)}</p>
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

      // Add new marker with simple popup
      const popupContent = `
        <div dir="rtl" style="text-align: right; font-family: Arial; min-width: 120px;">
          <h4 style="margin: 0 0 8px 0; color: #dc2626; font-size: 14px;">🎯 الموقع المحدد</h4>
          <p style="margin: 3px 0; font-size: 12px;">${lat.toFixed(4)}, ${lng.toFixed(4)}</p>
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

      {/* Map info overlay - مبسط */}
      <div className="absolute top-2 left-2 bg-white/90 p-2 rounded text-xs z-[1000]">
        <div className="text-blue-600 font-medium">انقر لتحديد الموقع</div>
      </div>

      {/* Coordinates display - مبسط */}
      {position && (
        <div className="absolute bottom-2 left-2 bg-black/80 text-white p-2 rounded text-xs font-mono z-[1000]">
          <div className="flex items-center gap-1">
            <span className="text-red-400">📍</span>
            <div>
              <div>{position[0].toFixed(4)}, {position[1].toFixed(4)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Legend - مبسط */}
      <div className="absolute bottom-2 right-2 bg-white/90 p-1 rounded text-xs z-[1000]">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          <span>الموقع</span>
        </div>
      </div>
    </div>
  );
}
