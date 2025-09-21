import { NextRequest, NextResponse } from 'next/server';
import { queryQNAS } from '@/lib/qnas';

export async function POST(request: NextRequest) {
  try {
    const { zone, street, building } = await request.json();
    
    console.log('[Geocode API] Input:', { zone, street, building });
    
    // Call QNAS directly
    const qnasResponse = await queryQNAS(zone, street, building);
    console.log('[Geocode API] QNAS Response:', qnasResponse);
    
    const lat = parseFloat(qnasResponse.lat);
    const lng = parseFloat(qnasResponse.lng);
    
    if (isNaN(lat) || isNaN(lng)) {
      throw new Error(`Invalid coordinates: lat=${qnasResponse.lat}, lng=${qnasResponse.lng}`);
    }
    
    const result = {
      lat,
      lng,
      status: qnasResponse.status,
      qAddress: { zone, street, building }
    };
    
    console.log('[Geocode API] Final Result:', result);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('[Geocode API] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}