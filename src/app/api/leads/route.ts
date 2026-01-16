import { NextRequest, NextResponse } from 'next/server';
import type { Lead } from '@/types/leads';

interface SerpApiResult {
    place_id?: string;
    title?: string;
    address?: string; // SerpApi often returns just 'address'
    phone?: string;
    website?: string;
    rating?: number;
    reviews?: number;
    thumbnail?: string;
    type?: string;
    gps_coordinates?: {
        latitude: number;
        longitude: number;
    };
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

    const apiKey = process.env.SERP_API_KEY;

    if (!apiKey) {
        return NextResponse.json(
            { error: 'SerpApi key not configured' },
            { status: 500 }
        );
    }

    try {
        const query = `${term} in ${location}`;
        const url = new URL('https://serpapi.com/search.json');
        url.searchParams.set('engine', 'google_maps');
        url.searchParams.set('q', query);
        url.searchParams.set('api_key', apiKey);
        url.searchParams.set('type', 'search');
        url.searchParams.set('ll', '@31.5204,74.3587,11z'); // Optional: Generic default, but 'q' typically handles location well.
        // SerpApi pagination uses 'start' (offset), not limit directly for page size in the same way, 
        // but google_maps typically gives 20 results per page.
        // We can just fetch the first page (top 20) for now.

        console.log(`Searching SerpApi for: ${query}`);

        const response = await fetch(url.toString());

        if (!response.ok) {
            const errorText = await response.text();
            console.error('SerpApi error:', response.status, errorText);
            return NextResponse.json(
                { error: `SerpApi error: ${response.status}` },
                { status: response.status }
            );
        }

        const data = await response.json();

        if (data.error) {
            console.error('SerpApi returned error:', data.error);
            return NextResponse.json(
                { error: data.error },
                { status: 400 }
            );
        }

        const localResults = data.local_results || [];

        const leads: Lead[] = localResults.map((result: SerpApiResult, index: number) => {
            return {
                id: result.place_id || `serp-${index}`,
                jobId: 'serp-search', // This will be overwritten by the hook/frontend
                name: result.title || 'Unknown Business',
                website: result.website || '',
                email: '', // Google Maps rarely provides public email addresses directly in search results
                phone: result.phone || '',
                address: result.address || '',
                rating: result.rating || undefined,
                reviewCount: result.reviews || undefined,
                category: result.type || term,
                allCategories: result.type ? [result.type] : [],
                imageUrl: result.thumbnail || '',
                relevanceScore: 1, // Google results are usually highly relevant
            };
        });

        // Filter to limit if needed, though usually it's ~20 results
        const limitedLeads = leads.slice(0, parseInt(limit, 10));

        return NextResponse.json({
            results: limitedLeads,
            total: limitedLeads.length, // Total for this page
        });

    } catch (error) {
        console.error('Error fetching from SerpApi:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
