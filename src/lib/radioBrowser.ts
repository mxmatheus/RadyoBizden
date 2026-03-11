export interface Station {
    changeuuid: string;
    stationuuid: string;
    name: string;
    url: string;
    url_resolved: string;
    homepage: string;
    favicon: string;
    tags: string;
    country: string;
    countrycode: string;
    state: string;
    language: string;
    votes: number;
    lastchangetime: string;
    codec: string;
    bitrate: number;
    hls: number;
    lastcheckok: number;
    clickcount: number;
}

const patchUrl = (url: string) => {
    if (!url) return url;
    // Replace broken Fenomen live subdomains with listen
    return url.replace('live.radyofenomen.com', 'listen.radyofenomen.com');
};

const patchStationUrls = (stations: Station[]) => {
    return stations.map(station => ({
        ...station,
        url: patchUrl(station.url),
        url_resolved: patchUrl(station.url_resolved)
    }));
};

export class RadioBrowserAPI {
    private static mirrors = [
        'https://de1.api.radio-browser.info',
        'https://nl1.api.radio-browser.info',
        'https://at1.api.radio-browser.info',
    ];

    static async getBaseUrl(): Promise<string> {
        // Return a random mirror for load balancing
        const randomIndex = Math.floor(Math.random() * this.mirrors.length);
        return this.mirrors[randomIndex];
    }

    static async getTurkeyStations(limit = 500): Promise<Station[]> {
        try {
            const baseUrl = await this.getBaseUrl();
            const response = await fetch(
                `${baseUrl}/json/stations/search?countrycode=TR&hidebroken=true&order=clickcount&reverse=true&limit=${limit}`,
                { next: { revalidate: 500 } } // Cache for 5 minutes
            );

            if (!response.ok) throw new Error('API fetch failed');
            const data = await response.json();
            return patchStationUrls(data);
        } catch (error) {
            console.error('RadioBrowser API Error:', error);
            return [];
        }
    }

    static async searchStations(query: string): Promise<Station[]> {
        try {
            const baseUrl = await this.getBaseUrl();
            const response = await fetch(
                `${baseUrl}/json/stations/search?name=${encodeURIComponent(query)}&countrycode=TR&hidebroken=true&order=clickcount&reverse=true&limit=20`,
                { cache: 'no-store' }
            );

            if (!response.ok) throw new Error('API fetch failed');
            const data = await response.json();
            return patchStationUrls(data);
        } catch (error) {
            console.error('RadioBrowser API Search Error:', error);
            return [];
        }
    }

    static async getStationsByTag(tag: string): Promise<Station[]> {
        try {
            const baseUrl = await this.getBaseUrl();
            const response = await fetch(
                `${baseUrl}/json/stations/search?tag=${encodeURIComponent(tag.toLowerCase())}&countrycode=TR&hidebroken=true&order=clickcount&reverse=true&limit=30`,
                { cache: 'no-store' }
            );

            if (!response.ok) throw new Error('API fetch failed');
            const data = await response.json();
            return patchStationUrls(data);
        } catch (error) {
            console.error('RadioBrowser API Tag Search Error:', error);
            return [];
        }
    }
}
