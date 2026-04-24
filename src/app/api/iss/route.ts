import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('https://api.wheretheiss.at/v1/satellites/25544', {
      cache: 'no-store'
    });

    if (!res.ok) throw new Error('ISS API returned an error');

    const data = await res.json();
    return NextResponse.json({
      latitude: data.latitude.toFixed(4),
      longitude: data.longitude.toFixed(4),
      altitude: Math.round(data.altitude), // km
      velocity: Math.round(data.velocity), // km/h
      visibility: data.visibility
    }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0'
      }
    });

  } catch (error) {
    return NextResponse.json({ error: 'Failed to access ISS orbital data' }, { status: 500 });
  }
}
