import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { propertyNumber, zone, street, building } = await request.json();
    
    console.log('[MOI Geocode API] Input:', { propertyNumber, zone, street, building });
    
    // إذا كان رقم العقار متوفر، استخدمه مع API وزارة الداخلية
    if (propertyNumber) {
      const moiResult = await queryMOIGeocode(propertyNumber);
      if (moiResult.success) {
        return NextResponse.json({
          coordinates: moiResult.coordinates,
          source: 'moi',
          propertyNumber,
          details: moiResult.details,
          accuracy: 'high'
        });
      }
    }
    
    // Fallback إلى QNAS إذا فشل MOI أو لم يكن رقم العقار متوفر
    if (zone && street && building) {
      try {
        const { queryQNAS } = await import('@/lib/qnas');
        const qnasResponse = await queryQNAS(zone, street, building);
        
        const lat = parseFloat(qnasResponse.lat);
        const lng = parseFloat(qnasResponse.lng);
        
        if (!isNaN(lat) && !isNaN(lng)) {
          return NextResponse.json({
            coordinates: { lat, lng },
            source: 'qnas',
            qAddress: { zone, street, building },
            accuracy: 'medium'
          });
        }
      } catch (qnasError) {
        console.warn('[MOI Geocode API] QNAS fallback failed:', qnasError);
      }
    }
    
    return NextResponse.json(
      { error: 'Unable to geocode with provided information' },
      { status: 404 }
    );
    
  } catch (error) {
    console.error('[MOI Geocode API] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// دالة للاستعلام من خدمة وزارة الداخلية
async function queryMOIGeocode(propertyNumber: string) {
  try {
    console.log('[MOI API] Querying property:', propertyNumber);
    
    // محاولة الاتصال بخدمة وزارة الداخلية
    // ملاحظة: هذا يتطلب تحليل وتجريب الـ API الفعلي
    const moiApiUrl = 'https://maps.moi.gov.qa/publicgis/';
    
    // نحاول عدة طرق للوصول للبيانات
    const attempts = [
      // محاولة 1: API مباشر
      tryDirectAPI(propertyNumber),
      // محاولة 2: خدمة البحث
      trySearchAPI(propertyNumber),
      // محاولة 3: خدمة الخرائط
      tryMapAPI(propertyNumber)
    ];
    
    for (const attempt of attempts) {
      try {
        const result = await attempt;
        if (result && result.coordinates) {
          return {
            success: true,
            coordinates: result.coordinates,
            details: result.details || {}
          };
        }
      } catch (error) {
        console.warn('[MOI API] Attempt failed:', error);
        continue;
      }
    }
    
    return { success: false, error: 'All MOI API attempts failed' };
    
  } catch (error) {
    console.error('[MOI API] General error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// محاولة 1: API مباشر
async function tryDirectAPI(propertyNumber: string) {
  const params = new URLSearchParams({
    searchText: propertyNumber,
    contains: 'true',
    searchFields: 'property_number,PROP_NO,PropertyNumber',
    sr: '4326',
    layers: 'all',
    returnGeometry: 'true',
    f: 'json'
  });
  
  const response = await fetch(`https://maps.moi.gov.qa/publicgis/rest/services/QatarMap/MapServer/find?${params}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });
  
  if (response.ok) {
    const data = await response.json();
    if (data.results && data.results.length > 0) {
      const result = data.results[0];
      if (result.geometry) {
        return {
          coordinates: {
            lat: result.geometry.y || result.geometry.latitude,
            lng: result.geometry.x || result.geometry.longitude
          },
          details: {
            propertyNumber,
            address: result.attributes?.address || '',
            zone: result.attributes?.zone || '',
            street: result.attributes?.street || ''
          }
        };
      }
    }
  }
  
  throw new Error('Direct API failed');
}

// محاولة 2: خدمة البحث
async function trySearchAPI(propertyNumber: string) {
  const response = await fetch(`https://maps.moi.gov.qa/publicgis/rest/services/QatarMap/MapServer/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json'
    },
    body: new URLSearchParams({
      where: `PROP_NO='${propertyNumber}' OR PropertyNumber='${propertyNumber}' OR property_number='${propertyNumber}'`,
      outFields: '*',
      returnGeometry: 'true',
      spatialRel: 'esriSpatialRelIntersects',
      outSR: '4326',
      f: 'json'
    })
  });
  
  if (response.ok) {
    const data = await response.json();
    if (data.features && data.features.length > 0) {
      const feature = data.features[0];
      if (feature.geometry) {
        return {
          coordinates: {
            lat: feature.geometry.y || feature.geometry.latitude,
            lng: feature.geometry.x || feature.geometry.longitude
          },
          details: {
            propertyNumber,
            ...feature.attributes
          }
        };
      }
    }
  }
  
  throw new Error('Search API failed');
}

// محاولة 3: خدمة الخرائط
async function tryMapAPI(propertyNumber: string) {
  // محاولة الوصول لخدمات الخرائط المختلفة
  const services = [
    'QatarMap/MapServer',
    'Properties/MapServer',
    'Addressing/MapServer'
  ];
  
  for (const service of services) {
    try {
      const params = new URLSearchParams({
        searchText: propertyNumber,
        contains: 'false',
        searchFields: '',
        sr: '4326',
        layers: 'all',
        returnGeometry: 'true',
        f: 'json'
      });
      
      const response = await fetch(`https://maps.moi.gov.qa/publicgis/rest/services/${service}/find?${params}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          const result = data.results[0];
          if (result.geometry) {
            return {
              coordinates: {
                lat: result.geometry.y,
                lng: result.geometry.x
              },
              details: {
                propertyNumber,
                service,
                ...result.attributes
              }
            };
          }
        }
      }
    } catch (error) {
      console.warn(`[MOI API] Service ${service} failed:`, error);
      continue;
    }
  }
  
  throw new Error('All map services failed');
}