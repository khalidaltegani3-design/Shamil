'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';

// Declare global types
declare global {
  interface Window {
    google: typeof google;
  }
}

interface GoogleMapProps {
  position: [number, number] | null;
  setPosition: (position: [number, number]) => void;
}

interface MapComponentProps extends GoogleMapProps {
  center: google.maps.LatLngLiteral;
  zoom: number;
}

function MapComponent({ center, zoom, position, setPosition }: MapComponentProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map>();
  const [marker, setMarker] = useState<google.maps.Marker>();

  // Initialize map
  useEffect(() => {
    if (ref.current && !map) {
      const newMap = new window.google.maps.Map(ref.current, {
        center,
        zoom,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "on" }]
          }
        ]
      });
      setMap(newMap);
    }
  }, [ref, map, center, zoom]);

  // Handle click events
  useEffect(() => {
    if (map) {
      const listener = map.addListener('click', (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
          const lat = e.latLng.lat();
          const lng = e.latLng.lng();
          setPosition([lat, lng]);
        }
      });

      return () => {
        google.maps.event.removeListener(listener);
      };
    }
  }, [map, setPosition]);

  // Update marker position
  useEffect(() => {
    if (map && position) {
      const latLng = new google.maps.LatLng(position[0], position[1]);
      
      if (marker) {
        marker.setPosition(latLng);
      } else {
        const newMarker = new google.maps.Marker({
          position: latLng,
          map: map,
          draggable: true,
          title: 'موقع البلاغ'
        });

        // Handle marker drag
        newMarker.addListener('dragend', () => {
          const pos = newMarker.getPosition();
          if (pos) {
            setPosition([pos.lat(), pos.lng()]);
          }
        });

        setMarker(newMarker);
      }

      // Center map on position
      map.panTo(latLng);
    }
  }, [map, position, marker, setPosition]);

  return <div ref={ref} style={{ width: '100%', height: '100%' }} />;
}

function LoadingComponent() {
  return (
    <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-sm text-gray-600">جارٍ تحميل الخريطة...</p>
      </div>
    </div>
  );
}

function ErrorComponent({ status }: { status: Status }) {
  return (
    <div className="flex items-center justify-center h-full bg-red-50 rounded-lg border border-red-200">
      <div className="text-center p-4">
        <div className="text-red-600 mb-2">⚠️</div>
        <p className="text-sm text-red-700 mb-2">خطأ في تحميل خريطة Google</p>
        <p className="text-xs text-red-600 mb-2">Status: {status}</p>
        {status === Status.FAILURE && (
          <div className="text-xs text-red-600">
            <p className="mb-1">• تحقق من مفتاح Google Maps API</p>
            <p className="mb-1">• تأكد من تفعيل Maps JavaScript API</p>
            <p>• أضف NEXT_PUBLIC_GOOGLE_MAPS_API_KEY في .env.local</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Simple fallback map component
function FallbackMapComponent({ position, setPosition }: GoogleMapProps) {
  console.log('FallbackMapComponent rendered', { position });
  const [localPosition, setLocalPosition] = useState(position || [25.2854, 51.5310]);

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    console.log('Map clicked');
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Simple conversion to lat/lng (approximation for Qatar area)
    const lng = 51.3 + (x / rect.width) * 0.5; // Roughly covers Doha area
    const lat = 25.4 - (y / rect.height) * 0.3; // Roughly covers Doha area
    
    const newPos: [number, number] = [lat, lng];
    console.log('New position:', newPos);
    setLocalPosition(newPos);
    setPosition(newPos);
  };

  return (
    <div 
      className="relative w-full h-full min-h-[400px] bg-gradient-to-br from-blue-50 to-green-50 rounded-lg border-2 border-dashed border-blue-300 cursor-crosshair overflow-hidden"
      onClick={handleMapClick}
      style={{ backgroundColor: '#f0f8ff' }}
    >
      {/* Grid background */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 0, 0, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 0, 0, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px'
        }}
      ></div>
      
      {/* Qatar outline approximation */}
      <div className="absolute inset-4 border border-blue-400/30 rounded-lg bg-blue-100/20"></div>
      
      {/* Marker */}
      {localPosition && (
        <div 
          className="absolute transform -translate-x-3 -translate-y-6 z-20 transition-all duration-200 hover:scale-110"
          style={{
            left: `${((localPosition[1] - 51.3) / 0.5) * 100}%`,
            top: `${((25.4 - localPosition[0]) / 0.3) * 100}%`
          }}
        >
          <div className="relative">
            <div className="w-6 h-6 bg-red-500 rounded-full border-3 border-white shadow-lg"></div>
            <div className="w-1 h-6 bg-red-500 mx-auto -mt-1"></div>
            {/* Pulse animation */}
            <div className="absolute -top-1 -left-1 w-8 h-8 bg-red-400 rounded-full animate-ping opacity-30"></div>
          </div>
        </div>
      )}
      
      {/* Instructions */}
      <div className="absolute top-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-blue-200">
        <div className="text-center">
          <div className="text-2xl mb-2">🗺️</div>
          <p className="text-sm text-gray-700 font-medium">
            خريطة تفاعلية بديلة
          </p>
          <p className="text-xs text-gray-500 mt-1">
            انقر في أي مكان لتحديد الموقع
          </p>
        </div>
      </div>

      {/* Coordinates display */}
      {localPosition && (
        <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-green-200">
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">الإحداثيات المحددة</p>
            <p className="text-sm text-gray-700 font-mono">
              {localPosition[0].toFixed(6)}, {localPosition[1].toFixed(6)}
            </p>
          </div>
        </div>
      )}

      {/* Info note */}
      <div className="absolute top-24 left-4 right-4 bg-blue-50/90 backdrop-blur-sm rounded-lg p-2 shadow-sm border border-blue-200">
        <p className="text-xs text-blue-700 text-center">
          💡 للحصول على خريطة Google الفعلية، أضف مفتاح API صحيح
        </p>
      </div>
    </div>
  );
}

const render = (status: Status): React.ReactElement => {
  switch (status) {
    case Status.LOADING:
      return <LoadingComponent />;
    case Status.FAILURE:
      return <ErrorComponent status={status} />;
    case Status.SUCCESS:
      return <div />; // Empty div when ready, the MapComponent will render
    default:
      return <LoadingComponent />;
  }
};

export default function GoogleMap({ position, setPosition }: GoogleMapProps) {
  console.log('GoogleMap component loaded', { position });
  
  // Default center: Doha, Qatar
  const center = position ? 
    { lat: position[0], lng: position[1] } : 
    { lat: 25.2854, lng: 51.5310 };

  // Get API key from environment variable
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  console.log('API Key check:', { apiKey: apiKey ? 'Found' : 'Not found' });

  // Show fallback if no API key or using Firebase API key
  if (!apiKey || apiKey === 'AIzaSyDKtxqu6YRoZQCeD9EoFmxAvc9JLi_d5R8') {
    console.log('Using fallback map component');
    return (
      <div className="w-full h-full">
        <FallbackMapComponent position={position} setPosition={setPosition} />
      </div>
    );
  }

  console.log('Using Google Maps component');
  return (
    <Wrapper apiKey={apiKey} render={render} libraries={['places']}>
      <MapComponent
        center={center}
        zoom={13}
        position={position}
        setPosition={setPosition}
      />
    </Wrapper>
  );
}