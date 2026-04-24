import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  // Default bounding box around a busy sector (e.g., London) to avoid huge payloads from OpenSky
  const lamin = searchParams.get('lamin') || '50.0';
  const lomin = searchParams.get('lomin') || '-1.5';
  const lamax = searchParams.get('lamax') || '52.5';
  const lomax = searchParams.get('lomax') || '1.5';

  try {
    // OpenSky Network gives real live flight data globally for free.
    // Fetching with a bounding box prevents overwhelming the browser.
    const res = await fetch(
      `https://opensky-network.org/api/states/all?lamin=${lamin}&lomin=${lomin}&lamax=${lamax}&lomax=${lomax}`,
      { cache: 'no-store' } 
    );

    if (!res.ok) {
      throw new Error('OpenSky API returned an error');
    }

    const data = await res.json();
    const states = data.states || [];

    // Take the first 10 live flights in the sector and parse OpenSky's array structure
    const flights = states.slice(0, 10).map((state: any) => ({
      id: state[0],
      flightNumber: state[1] && state[1].trim() !== '' ? state[1].trim() : 'N/A', // Callsign
      airline: state[2], // Origin Country
      status: state[8] ? 'landed' : 'airborne', // On ground bool
      position: { lat: state[6] || 0, lng: state[5] || 0 },
      metrics: { 
        altitude: state[7] !== null ? Math.round(state[7] * 3.28084) : 0, // meters to ft
        speed: state[9] !== null ? Math.round(state[9] * 1.94384) : 0 // m/s to knots
      }, 
      lastUpdated: new Date().toISOString()
    }));

    return NextResponse.json({
      success: true,
      count: flights.length,
      data: flights
    }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0' // Ensure fresh live data on every poll
      }
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to access live flight telemetry' }, { status: 500 });
  }
}
