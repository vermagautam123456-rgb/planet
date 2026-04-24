import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat') || '51.5074'; // Default London
  const lng = searchParams.get('lng') || '-0.1278';

  try {
    // Open-Meteo is a free, open-source weather API that requires no API key.
    // In a real scenario, this is where you'd inject secret keys into a private API.
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&hourly=temperature_2m,relativehumidity_2m,windspeed_10m`
    );

    if (!res.ok) {
      throw new Error('Weather API returned an error');
    }

    const data = await res.json();

    // Securely transform/filter the data before sending it to the client
    const { current_weather } = data;

    // We can map weather codes to human-readable strings
    let condition = 'Clear';
    if (current_weather.weathercode >= 1 && current_weather.weathercode <= 3) condition = 'Cloudy';
    if (current_weather.weathercode >= 45 && current_weather.weathercode <= 48) condition = 'Foggy';
    if (current_weather.weathercode >= 51 && current_weather.weathercode <= 67) condition = 'Rainy';
    if (current_weather.weathercode >= 71 && current_weather.weathercode <= 77) condition = 'Snowy';
    if (current_weather.weathercode >= 95) condition = 'Thunderstorm';

    return NextResponse.json({
      temperature: current_weather.temperature,
      windspeed: current_weather.windspeed,
      condition,
      time: current_weather.time,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch secure weather data' }, { status: 500 });
  }
}
