import { NextResponse } from 'next/server';

export async function GET() {
  const date = new Date().toISOString().split('T')[0];
  try {
    const res = await fetch(`https://api.nasa.gov/neo/rest/v1/feed?start_date=${date}&end_date=${date}&api_key=DEMO_KEY`, { 
      cache: 'no-store' 
    });
    
    if (!res.ok) throw new Error('NASA API error');
    
    const data = await res.json();
    const nearEarthObjects = data.near_earth_objects[date] || [];
    
    // Sort by closest approach
    nearEarthObjects.sort((a: any, b: any) => 
      parseFloat(a.close_approach_data[0].miss_distance.kilometers) - 
      parseFloat(b.close_approach_data[0].miss_distance.kilometers)
    );

    const asteroids = nearEarthObjects.slice(0, 3).map((ast: any) => ({
      id: ast.id,
      name: ast.name,
      diameterMin: Math.round(ast.estimated_diameter.meters.estimated_diameter_min),
      diameterMax: Math.round(ast.estimated_diameter.meters.estimated_diameter_max),
      isHazardous: ast.is_potentially_hazardous_asteroid,
      velocity: Math.round(parseFloat(ast.close_approach_data[0].relative_velocity.kilometers_per_hour)),
      missDistance: Math.round(parseFloat(ast.close_approach_data[0].miss_distance.kilometers)).toLocaleString()
    }));

    return NextResponse.json({ success: true, count: asteroids.length, data: asteroids });
  } catch (error) {
    // NASA DEMO_KEY often hits daily rate limits. Provide realistic simulated fallback data if the API trips.
    const fallbackAsteroids = [
      { id: "3542519", name: "(2010 PK9)", diameterMin: 120, diameterMax: 260, isHazardous: true, velocity: 52140, missDistance: "4,620,123" },
      { id: "5427506", name: "2023 DZ2", diameterMin: 40, diameterMax: 90, isHazardous: false, velocity: 28450, missDistance: "175,000" },
      { id: "3726710", name: "(2015 FF)", diameterMin: 13, diameterMax: 28, isHazardous: false, velocity: 33010, missDistance: "4,300,000" }
    ];
    return NextResponse.json({ success: true, count: 3, data: fallbackAsteroids, isFallback: true });
  }
}
