import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const [co2Res, tempRes] = await Promise.all([
      fetch('https://global-warming.org/api/co2-api'),
      fetch('https://global-warming.org/api/temperature-api')
    ]);

    const co2Data = await co2Res.json();
    const tempData = await tempRes.json();

    return NextResponse.json({
      co2: co2Data.co2[co2Data.co2.length - 1],
      temp: tempData.result[tempData.result.length - 1]
    });
  } catch (error) {
    return NextResponse.json({ 
      co2: { cycle: "421.5", trend: "420.2" },
      temp: { year: "2024", station: "1.25" }
    });
  }
}
