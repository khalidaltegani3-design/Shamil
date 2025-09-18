
'use server';
/**
 * @fileOverview A geocoding flow for converting Qatari addresses to coordinates.
 *
 * - geocodeAddress - A function that handles the geocoding process using QNAS.
 * - GeocodeAddressInput - The input type for the geocodeAddress function.
 * - GeocodeAddressOutput - The return type for the geocodeAddress function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GeocodeAddressInputSchema = z.object({
  zone: z.string().describe('The zone number of the address.'),
  street: z.string().describe('The street number of the address.'),
  building: z.string().describe('The building number of the address.'),
});
export type GeocodeAddressInput = z.infer<typeof GeocodeAddressInputSchema>;

const GeocodeAddressOutputSchema = z.object({
  lat: z.number().describe('The latitude of the address.'),
  lng: z.number().describe('The longitude of the address.'),
});
export type GeocodeAddressOutput = z.infer<typeof GeocodeAddressOutputSchema>;

// This is the main exported function that the client will call.
export async function geocodeAddress(input: GeocodeAddressInput): Promise<GeocodeAddressOutput> {
  return geocodeAddressFlow(input);
}


const geocodeAddressFlow = ai.defineFlow(
  {
    name: 'geocodeAddressFlow',
    inputSchema: GeocodeAddressInputSchema,
    outputSchema: GeocodeAddressOutputSchema,
  },
  async ({ zone, street, building }) => {
    
    // Normalize Arabic numerals to Western numerals if present
    const normalizeNumerals = (numStr: string) => {
        return numStr.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());
    };
    
    const normZone = normalizeNumerals(zone);
    const normStreet = normalizeNumerals(street);
    const normBuilding = normalizeNumerals(building);

    console.log(`[Geocode Flow] Normalized Input: Zone=${normZone}, Street=${normStreet}, Building=${normBuilding}`);
    
    const token = process.env.QNAS_API_TOKEN;
    const domain = process.env.QNAS_API_DOMAIN;

    if (!token || !domain) {
      console.error('[Geocode Flow] Error: QNAS_API_TOKEN or QNAS_API_DOMAIN is not set in environment variables.');
      throw new Error('Geocoding service is not configured.');
    }

    const url = `https://api.qnas.qa/v1/get_location/${normZone}/${normStreet}/${normBuilding}`;
    
    console.log(`[Geocode Flow] Calling QNAS Endpoint: ${url}`);

    try {
      const response = await fetch(url, {
        headers: {
          'X-Token': token,
          'X-Domain': domain,
        },
      });

      console.log(`[Geocode Flow] QNAS Response Status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[Geocode Flow] QNAS API Error: ${response.statusText}`, errorText);
        throw new Error(`Failed to fetch from QNAS: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('[Geocode Flow] QNAS Response Body:', data);
      
      const lat = parseFloat(data.lat);
      const lng = parseFloat(data.lng);

      if (isNaN(lat) || isNaN(lng)) {
        console.error('[Geocode Flow] Invalid coordinates received from QNAS.');
        throw new Error('Invalid coordinates received.');
      }
      
      // Validate coordinates are within Qatar's bounds
      if (lat < 24 || lat > 27 || lng < 50 || lng > 52) {
          console.warn(`[Geocode Flow] Warning: Coordinates (${lat}, ${lng}) are outside the expected range for Qatar.`);
          throw new Error('Address coordinates are outside the expected range for Qatar.');
      }
      
      console.log(`[Geocode Flow] Success: Returning Lat=${lat}, Lng=${lng}`);

      return { lat, lng };

    } catch (error) {
      console.error('[Geocode Flow] An unexpected error occurred:', error);
      throw new Error('An unexpected error occurred during geocoding.');
    }
  }
);
