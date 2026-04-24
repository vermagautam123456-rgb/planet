import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat') || '51.5074';
  const lng = searchParams.get('lng') || '-0.1278';

  try {
    const res = await fetch(
      `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lng}&current=european_aqi,pm10,pm2_5,carbon_monoxide`,
      { cache: 'no-store' }
    );
    
    if (!res.ok) throw new Error('AQI API returned an error');

    const data = await res.json();
    const c = data.current;
    
    let status = 'Healthy';
    let statusClass = 'success';
    
    if (c.european_aqi > 100) { 
      status = 'Poor'; 
      statusClass = 'danger'; 
    } else if (c.european_aqi > 50) { 
      status = 'Moderate'; 
      statusClass = 'warning'; 
    }

    return NextResponse.json({
      aqi: c.european_aqi,
      pm10: c.pm10,
      pm25: c.pm2_5,
      co: c.carbon_monoxide,
      status,
      statusClass
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to access AQI metrics' }, { status: 500 });
  }
}
