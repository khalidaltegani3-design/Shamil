
'use server';
/**
 * @fileOverview A geocoding flow for converting Qatari addresses to coordinates.
 */

import { z } from 'zod';
import { queryQNAS, QNASError } from '@/lib/qnas';

const GeocodeAddressInputSchema = z.object({
  zone: z.string().describe('The zone number of the address.'),
  street: z.string().describe('The street number of the address.'),
  building: z.string().describe('The building number of the address.'),
});
export type GeocodeAddressInput = z.infer<typeof GeocodeAddressInputSchema>;

export interface GeocodeAddressOutput {
  lat: number;
  lng: number;
  status?: string;
}

// Server action for geocoding addresses
export async function geocodeAddress(input: GeocodeAddressInput): Promise<GeocodeAddressOutput | null> {
  console.log('[GeoCode] Starting geocoding for:', input);
  
  try {
    const qnasResponse = await queryQNAS(input.zone, input.street, input.building);
    console.log('[GeoCode] QNAS Response:', qnasResponse);
    
    const lat = parseFloat(qnasResponse.lat);
    const lng = parseFloat(qnasResponse.lng);
    
    if (isNaN(lat) || isNaN(lng)) {
      console.error('[GeoCode] Invalid coordinates received:', qnasResponse.lat, qnasResponse.lng);
      return null;
    }
    
    const result: GeocodeAddressOutput = { 
      lat, 
      lng, 
      status: qnasResponse.status 
    };
    console.log('[GeoCode] Final result:', result);
    
    return result;
  } catch (error) {
    console.error('[GeoCode] Error:', error);
    return null;
  }
}
