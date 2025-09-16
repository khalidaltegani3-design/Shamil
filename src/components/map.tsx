
'use client';

import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useEffect } from 'react';

interface MapProps {
  position: [number, number] | null;
  setPosition: (position: [number, number]) => void;
}

function LocationMarker({ position, setPosition }: MapProps) {
    const map = useMapEvents({
        click(e) {
            setPosition([e.latlng.lat, e.latlng.lng]);
            map.flyTo(e.latlng, map.getZoom());
        },
    });

    // Fly to current position when it changes
    useEffect(() => {
        if (position) {
            map.flyTo(position, map.getZoom());
        }
    }, [position, map]);

    return position === null ? null : (
        <Marker position={position}></Marker>
    );
}


export default function Map({ position, setPosition }: MapProps) {
  // This useEffect hook is the key to fixing the marker icon issue in Next.js.
  // It runs once on the client-side after the component mounts.
  // By deleting and re-initializing the default icon, we ensure that Leaflet
  // uses the correct image paths bundled by Webpack.
  useEffect(() => {
      // @ts-ignore
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
          iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
          iconUrl: require('leaflet/dist/images/marker-icon.png'),
          shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
      });
  }, []);

  return (
    <MapContainer 
        center={position || [25.2854, 51.5310]} 
        zoom={13} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker position={position} setPosition={setPosition} />
    </MapContainer>
  );
}
