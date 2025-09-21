'use client';

import 'leaflet/dist/leaflet.css';
import { useEffect, useRef, useState } from 'react';

interface LeafletMapProps {
  position: [number, number] | null;
  setPosition: (position: [number, number]) => void;
}

export default function LeafletMap({ position, setPosition }: LeafletMapProps) {
  const mapRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let L: any;
    let map: any;

    const initializeMap = async () => {
      try {
        // Dynamic import of Leaflet
        L = (await import('leaflet')).default;

        // Fix default markers in Next.js
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
          iconUrl: require('leaflet/dist/images/marker-icon.png'),
          shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
        });

        if (containerRef.current && !mapRef.current) {
          // Initialize map
          map = L.map(containerRef.current).setView(
            position || [25.2854, 51.5310], 
            13
          );

          // Add OpenStreetMap tiles
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }).addTo(map);

          // Add click handler
          map.on('click', (e: any) => {
            const { lat, lng } = e.latlng;
            setPosition([lat, lng]);
            
            // Remove existing marker
            if (mapRef.current?.marker) {
              map.removeLayer(mapRef.current.marker);
            }
            
            // Add new marker
            const marker = L.marker([lat, lng]).addTo(map);
            if (!mapRef.current) mapRef.current = {};
            mapRef.current.marker = marker;
          });

          mapRef.current = { map, marker: null };
          setIsLoaded(true);
        }
      } catch (error) {
        console.error('Failed to initialize map:', error);
      }
    };

    initializeMap();

    // Cleanup
    return () => {
      if (mapRef.current?.map) {
        mapRef.current.map.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update marker when position changes externally
  useEffect(() => {
    if (position && mapRef.current?.map && isLoaded) {
      const { map } = mapRef.current;
      
      // Remove existing marker
      if (mapRef.current.marker) {
        map.removeLayer(mapRef.current.marker);
      }
      
      // Add new marker and fly to position
      const L = require('leaflet');
      const marker = L.marker(position).addTo(map);
      mapRef.current.marker = marker;
      map.flyTo(position, map.getZoom());
    }
  }, [position, isLoaded]);

  return (
    <div 
      ref={containerRef}
      className="w-full h-full"
      style={{ minHeight: '200px' }}
    >
      {!isLoaded && (
        <div className="w-full h-full flex items-center justify-center bg-gray-100">
          <div className="text-gray-500">جارٍ تحميل الخريطة...</div>
        </div>
      )}
    </div>
  );
}