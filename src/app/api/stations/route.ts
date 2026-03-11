import { NextResponse } from 'next/server';
import { Station } from '@/lib/radioBrowser';
import { supabase } from '@/lib/supabase';

export const revalidate = 0;

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || searchParams.get('name');
    const tag = searchParams.get('tag');

    try {
        let dbQuery = supabase
            .from('stations')
            .select('*')
            .eq('is_active', true)
            .order('clickcount', { ascending: false });

        if (query) {
            dbQuery = dbQuery.ilike('name', `%${query}%`);
        } else if (tag) {
            dbQuery = dbQuery.ilike('tags', `%${tag}%`);
        }

        const { data: stationsData, error } = await dbQuery;

        if (error) {
            throw error;
        }

        if (!stationsData) {
            return NextResponse.json([]);
        }

        // Convert DB format back to Station interface format
        const parsedStations: Station[] = stationsData.map(cs => ({
            changeuuid: cs.id,
            stationuuid: cs.stationuuid,
            name: cs.name,
            url: cs.url,
            url_resolved: cs.url_resolved,
            homepage: cs.homepage || '',
            favicon: cs.favicon || '',
            tags: cs.tags || '',
            country: 'Turkey',
            countrycode: cs.countrycode || 'TR',
            state: '',
            language: 'turkish',
            votes: cs.clickcount || 0,
            lastchangetime: cs.updated_at,
            codec: cs.codec || 'MP3',
            bitrate: cs.bitrate || 128,
            hls: cs.url_resolved.includes('.m3u8') ? 1 : 0,
            lastcheckok: 1,
            lastlocalchecktime: cs.updated_at,
            clickcount: cs.clickcount || 0
        }));

        return NextResponse.json(parsedStations);

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch stations' }, { status: 500 });
    }
}
