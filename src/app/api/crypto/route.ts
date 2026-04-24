import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true', 
      { 
        next: { revalidate: 60 } // Cache for 60 seconds to avoid strict CoinGecko rate limits
      }
    );
    
    if (!res.ok) throw new Error('CoinGecko API error');
    
    const data = await res.json();
    
    const cryptos = [
      { name: 'Bitcoin', symbol: 'BTC', price: data.bitcoin?.usd || 0, change: data.bitcoin?.usd_24h_change || 0 },
      { name: 'Ethereum', symbol: 'ETH', price: data.ethereum?.usd || 0, change: data.ethereum?.usd_24h_change || 0 },
      { name: 'Solana', symbol: 'SOL', price: data.solana?.usd || 0, change: data.solana?.usd_24h_change || 0 },
    ];

    return NextResponse.json({ success: true, data: cryptos });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch global crypto pulse' }, { status: 500 });
  }
}
