import { NextRequest, NextResponse } from 'next/server';

interface FoursquarePlace {
    fsq_id?: string;
    name?: string;
    location?: {
        formatted_address?: string;
        address?: string;
        locality?: string;
        region?: string;
    };
    tel?: string;
    website?: string;
    email?: string;
    categories?: Array<{ name?: string }>;
    rating?: number;
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query'); // business niche
    const near = searchParams.get('near'); // city
    const limit = searchParams.get('limit') || '20';

    if (!query || !near) {
        return NextResponse.json(
            { error: 'Missing required parameters: query and near' },
            { status: 400 }
        );
    }

    const apiKey = process.env.FOURSQUARE_API_KEY;

    if (!apiKey) {
        return NextResponse.json(
            { error: 'Foursquare API key not configured' },
            { status: 500 }
        );
    }

    try {
        const url = new URL('https://api.foursquare.com/v3/places/search');
        url.searchParams.set('query', query);
        url.searchParams.set('near', near);
        url.searchParams.set('limit', limit);
        url.searchParams.set('fields', 'fsq_id,name,location,tel,website,email,categories,rating');

        const response = await fetch(url.toString(), {
            headers: {
                'Authorization': apiKey,
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('Foursquare API error:', errorData);
            return NextResponse.json(
                { error: 'Failed to fetch from Foursquare API' },
                { status: response.status }
            );
        }

        const data = await response.json();

        // Transform Foursquare response to our Lead format
        const leads = data.results?.map((place: FoursquarePlace, index: number) => ({
            id: place.fsq_id || `lead-${index}`,
            jobId: 'foursquare-search',
            name: place.name || 'Unknown Business',
            website: place.website || '',
            email: place.email || '',
            phone: place.tel || '',
            address: place.location?.formatted_address ||
                [place.location?.address, place.location?.locality, place.location?.region]
                    .filter(Boolean).join(', ') || '',
            rating: place.rating || null,
            category: place.categories?.[0]?.name || '',
        })) || [];

        return NextResponse.json({ results: leads });
    } catch (error) {
        console.error('Error fetching from Foursquare:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
