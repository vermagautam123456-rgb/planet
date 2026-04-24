import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json', { 
      cache: 'no-store' 
    });
    
    if (!res.ok) throw new Error('NOAA API returned error');
    
    const data = await res.json();
    
    // Handle both array-of-arrays and array-of-objects formats based on API updates
    const latest = data[data.length - 1];
    const rawKp = latest.Kp !== undefined ? latest.Kp : latest[1];
    const rawTime = latest.time_tag !== undefined ? latest.time_tag : latest[0];
    
    // Ensure we parse correctly
    const kpIndex = parseFloat(rawKp) || 0;
    
    let condition = 'Stable';
    let statusClass = 'success';
    
    if(kpIndex >= 4) { condition = 'Active'; statusClass = 'warning'; }
    if(kpIndex >= 5) { condition = 'Geomagnetic Storm'; statusClass = 'danger'; }

    return NextResponse.json({
      time: rawTime,
      kpIndex: kpIndex.toFixed(2),
      condition,
      statusClass
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to reach NOAA Space Weather feeds' }, { status: 500 });
  }
}
