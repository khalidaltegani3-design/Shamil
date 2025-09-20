import { NextRequest, NextResponse } from 'next/server';
import { queryQNAS } from '@/lib/qnas';

export async function POST(request: NextRequest) {
  try {
    const { zone, street, building } = await request.json();
    
    console.log('[API Test] Input:', { zone, street, building });
    
    // Call QNAS directly
    const qnasResponse = await queryQNAS(zone, street, building);
    console.log('[API Test] QNAS Response:', qnasResponse);
    
    const result = {
      lat: parseFloat(qnasResponse.lat),
      lng: parseFloat(qnasResponse.lng),
      status: qnasResponse.status
    };
    
    console.log('[API Test] Final Result:', result);
    
    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('[API Test] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}