import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // USGS Earthquakes in the past hour
    const res = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson', {
      cache: 'no-store'
    });

    if (!res.ok) throw new Error('Seismic API returned an error');

    const data = await res.json();
    
    // Extract top 5 recent earthquakes globally
    const quakes = data.features.slice(0, 5).map((q: any) => ({
      id: q.id,
      magnitude: q.properties.mag.toFixed(1),
      place: q.properties.place,
      time: new Date(q.properties.time).toLocaleTimeString(),
      status: q.properties.mag > 4 ? 'critical' : 'normal'
    }));

    return NextResponse.json({
      success: true,
      data: quakes
    }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0'
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to access global seismic data' }, { status: 500 });
  }
}
