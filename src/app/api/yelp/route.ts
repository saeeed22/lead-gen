import { NextRequest, NextResponse } from 'next/server';
import type { Lead } from '@/types/leads';
import { getCategoriesForSearch, getIrrelevantCategories } from '@/lib/categories';

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

/**
 * Calculate relevance score for a business based on category matching
 */
function calculateRelevanceScore(
    business: YelpBusiness,
    searchTerm: string,
    mappedCategories: string[],
    irrelevantCategories: string[]
): number {
    const businessCategories = business.categories?.map(c => c.alias?.toLowerCase() || '') || [];
    const businessCategoryTitles = business.categories?.map(c => c.title?.toLowerCase() || '') || [];
    const searchTermLower = searchTerm.toLowerCase();

    let score = 0.5; // Base score

    // Check if any business category matches our mapped categories
    const matchedMappedCategories = businessCategories.filter(cat =>
        mappedCategories.includes(cat)
    );

    if (matchedMappedCategories.length > 0) {
        // Bonus for each matched category
        score += Math.min(0.3, matchedMappedCategories.length * 0.1);
    }

    // Check if business category titles contain the search term
    const titleMatches = businessCategoryTitles.some(title =>
        title.includes(searchTermLower) || searchTermLower.includes(title)
    );
    if (titleMatches) {
        score += 0.2;
    }

    // Check if business name contains the search term
    if (business.name?.toLowerCase().includes(searchTermLower)) {
        score += 0.1;
    }

    // Check for irrelevant categories
    const hasIrrelevantCategory = businessCategories.some(cat =>
        irrelevantCategories.includes(cat)
    );
    if (hasIrrelevantCategory && matchedMappedCategories.length === 0) {
        score -= 0.4; // Penalize irrelevant categories only if no good matches
    }

    // Bonus for high rating
    if (business.rating && business.rating >= 4.0) {
        score += 0.05;
    }

    // Bonus for having reviews
    if (business.review_count && business.review_count >= 10) {
        score += 0.05;
    }

    return Math.max(0, Math.min(1, score)); // Clamp between 0 and 1
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
        // Use hybrid category service to get categories
        const { categories: mappedCategories, source } = await getCategoriesForSearch(term, apiKey);
        const irrelevantCategories = getIrrelevantCategories(term);

        const url = new URL('https://api.yelp.com/v3/businesses/search');
        url.searchParams.set('term', term);
        url.searchParams.set('location', location);
        // Request more results to allow for filtering
        url.searchParams.set('limit', '50');
        url.searchParams.set('sort_by', 'best_match');

        // Add categories parameter if we have mappings
        if (mappedCategories.length > 0) {
            url.searchParams.set('categories', mappedCategories.slice(0, 10).join(','));
        }

        console.log('=== YELP API DEBUG ===');
        console.log('Search term:', term);
        console.log('Category source:', source);
        console.log('Mapped categories:', mappedCategories.slice(0, 10));
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

        // Transform and score Yelp response
        const scoredLeads: (Partial<Lead> & { relevanceScore: number })[] = data.businesses?.map((business: YelpBusiness, index: number) => {
            const relevanceScore = calculateRelevanceScore(
                business,
                term,
                mappedCategories,
                irrelevantCategories
            );

            return {
                id: business.id || `yelp-lead-${index}`,
                jobId: 'yelp-search',
                name: business.name || 'Unknown Business',
                website: business.url || '',
                email: '',
                phone: business.display_phone || business.phone || '',
                address: business.location?.display_address?.join(', ') ||
                    [business.location?.address1, business.location?.city, business.location?.state]
                        .filter(Boolean).join(', ') || '',
                rating: business.rating || undefined,
                reviewCount: business.review_count || undefined,
                category: business.categories?.[0]?.title || '',
                allCategories: business.categories?.map(c => c.title || '') || [],
                imageUrl: business.image_url || '',
                relevanceScore,
            };
        }) || [];

        // Filter out low-relevance results and sort by relevance
        const MIN_RELEVANCE_SCORE = 0.4;
        const filteredLeads = scoredLeads
            .filter(lead => lead.relevanceScore >= MIN_RELEVANCE_SCORE)
            .sort((a, b) => b.relevanceScore - a.relevanceScore)
            .slice(0, parseInt(limit, 10));

        console.log(`Filtered from ${scoredLeads.length} to ${filteredLeads.length} leads (min score: ${MIN_RELEVANCE_SCORE})`);
        console.log(`Category source used: ${source}`);

        return NextResponse.json({
            results: filteredLeads,
            total: filteredLeads.length,
            categorySource: source, // Include in response for debugging
        });
    } catch (error) {
        console.error('Error fetching from Yelp:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
