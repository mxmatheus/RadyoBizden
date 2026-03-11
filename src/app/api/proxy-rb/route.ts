import { NextResponse } from 'next/server';
import { RadioBrowserApi } from 'radio-browser-api';

export const revalidate = 0;

export async function GET() {
    try {
        const api = new RadioBrowserApi('RadyoBizden/1.0');

        const stations = await api.searchStations({
            countryCode: 'TR',
            limit: 1000,
            hideBroken: true,
            order: 'clickCount',
            reverse: true
        });

        // The library already parses JSON and returns an array of objects
        return NextResponse.json(stations);
    } catch (error: any) {
        console.error('RadioBrowser Proxy Error:', error);
        return NextResponse.json({ error: error.message || 'Unknown proxy error' }, { status: 500 });
    }
}
