export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const streamUrl = searchParams.get('url');

    if (!streamUrl) {
        return new Response('Missing stream url parameter', { status: 400 });
    }

    try {
        const response = await fetch(streamUrl, {
            headers: {
                // A common user-agent to bypass basic blocks
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': '*/*, audio/*',
            },
        });

        if (!response.ok) {
            console.error(`Proxy error: ${response.status} ${response.statusText} for URL: ${streamUrl}`);
            return new Response('Failed to fetch stream from source', { status: response.status });
        }

        // Return the Response body directly, acting as a pass-through proxy
        return new Response(response.body, {
            headers: {
                'Content-Type': response.headers.get('Content-Type') || 'audio/mpeg',
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
            },
        });
    } catch (error: any) {
        console.error('Proxy Exception for URL:', streamUrl, error);
        return new Response('Internal Server Error proxying stream', { status: 500 });
    }
}
