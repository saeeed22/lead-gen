import { NextRequest, NextResponse } from 'next/server';
import type { Lead } from '@/types/leads';

interface YelpBusiness {
    id?: string;
    name?: string;
    url?: string;
    phone?: string;
    display_phone?: string;
    location?: {
        address1?: string;
        address2?: string;
        city?: string;
        state?: string;
        zip_code?: string;
        display_address?: string[];
    };
    rating?: number;
    review_count?: number;
    categories?: Array<{ alias?: string; title?: string }>;
    image_url?: string;
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const term = searchParams.get('term'); // business niche
    const location = searchParams.get('location'); // city
    const limit = searchParams.get('limit') || '20';

    if (!term || !location) {
        return NextResponse.json(
            { error: 'Missing required parameters: term and location' },
            { status: 400 }
        );
    }

    const apiKey = process.env.YELP_API_KEY;

    if (!apiKey) {
        return NextResponse.json(
            { error: 'Yelp API key not configured' },
            { status: 500 }
        );
    }

    try {
        const url = new URL('https://api.yelp.com/v3/businesses/search');
        url.searchParams.set('term', term);
        url.searchParams.set('location', location);
        url.searchParams.set('limit', limit);
        url.searchParams.set('sort_by', 'best_match');

        console.log('=== YELP API DEBUG ===');
        console.log('Request URL:', url.toString());
        console.log('=======================');

        const response = await fetch(url.toString(), {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Accept': 'application/json',
            },
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('=== YELP API ERROR ===');
            console.error('Status:', response.status);
            console.error('Error Body:', errorText);
            console.error('=======================');

            return NextResponse.json(
                {
                    error: `Yelp API error: ${errorText}`,
                    status: response.status,
                },
                { status: response.status }
            );
        }

        const data = await response.json();

        // Transform Yelp response to our Lead format
        const leads: Partial<Lead>[] = data.businesses?.map((business: YelpBusiness, index: number) => ({
            id: business.id || `yelp-lead-${index}`,
            jobId: 'yelp-search',
            name: business.name || 'Unknown Business',
            website: business.url || '',
            email: '', // Yelp doesn't provide email in API
            phone: business.display_phone || business.phone || '',
            address: business.location?.display_address?.join(', ') ||
                [business.location?.address1, business.location?.city, business.location?.state]
                    .filter(Boolean).join(', ') || '',
            provider: 'yelp' as const,
            rating: business.rating || undefined,
            reviewCount: business.review_count || undefined,
            category: business.categories?.[0]?.title || '',
            imageUrl: business.image_url || '',
        })) || [];

        return NextResponse.json({
            results: leads,
            total: data.total || leads.length,
        });
    } catch (error) {
        console.error('Error fetching from Yelp:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
