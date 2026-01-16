/**
 * Category Service - Hybrid approach for Yelp category matching
 * 
 * 1. Uses hardcoded mappings for common search terms (fast)
 * 2. Falls back to Yelp Categories API with fuzzy matching for unknown terms
 * 3. Caches Yelp categories in memory to avoid repeated API calls
 */

// Hardcoded mappings for common search terms (fast path)
export const CATEGORY_MAPPINGS: Record<string, string[]> = {
    'real estate': ['realestate', 'realestateagents', 'realestateservices', 'propertymgmt', 'apartments', 'homeinspectors', 'mortgagebrokers', 'titlecompanies'],
    'restaurant': ['restaurants', 'food', 'breakfast_brunch', 'cafes', 'bars', 'italian', 'mexican', 'chinese', 'japanese', 'indian', 'thai', 'vietnamese', 'korean', 'mediterranean', 'french', 'american', 'pizza', 'burgers', 'seafood', 'steakhouses', 'sushi'],
    'restaurants': ['restaurants', 'food', 'breakfast_brunch', 'cafes', 'bars'],
    'dentist': ['dentists', 'cosmeticdentists', 'generaldentistry', 'orthodontists', 'endodontists', 'oralsurgeons', 'periodontists', 'pediatricdentists'],
    'lawyer': ['lawyers', 'bankruptcy', 'criminaldefense', 'divorce', 'employmentlaw', 'estateplanning', 'immigration', 'personal_injury_lawyer', 'realestate_lawyers', 'taxlaw'],
    'attorney': ['lawyers', 'bankruptcy', 'criminaldefense', 'divorce', 'employmentlaw', 'estateplanning', 'immigration', 'personal_injury_lawyer'],
    'plumber': ['plumbing', 'plumbers', 'waterheaterinstallrepair'],
    'electrician': ['electricians', 'electrical'],
    'gym': ['gyms', 'fitness', 'trainers', 'yoga', 'pilates', 'martialarts', 'boxing', 'cycling'],
    'fitness': ['gyms', 'fitness', 'trainers', 'yoga', 'pilates'],
    'salon': ['hair', 'hairsalons', 'hairstylists', 'barbers', 'beautysvc', 'nailsalons', 'skincare', 'spas'],
    'spa': ['spas', 'massage', 'skincare', 'beautysvc', 'medicalspa'],
    'doctor': ['doctors', 'physicians', 'familydr', 'internists', 'generalpractitioners'],
    'contractor': ['contractors', 'generalcontractors', 'homebuilders', 'remodeling'],
    'accountant': ['accountants', 'bookkeepers', 'taxservices', 'payrollservices'],
    'insurance': ['insurance', 'autoinsurance', 'homeinsurance', 'lifeinsurance', 'healthinsurance'],
    'hotel': ['hotels', 'hotelstravel', 'bedbreakfast', 'hostels', 'resorts', 'vacation_rentals'],
    'car dealer': ['car_dealers', 'usedcardealers', 'autodealers'],
    'auto repair': ['autorepair', 'auto', 'tires', 'oilchange', 'brakes', 'transmission'],
    'cafe': ['cafes', 'coffee', 'coffeeroasteries', 'bubbletea', 'juicebars'],
    'coffee': ['coffee', 'coffeeroasteries', 'cafes'],
    'bakery': ['bakeries', 'desserts', 'cakeshop', 'donuts', 'cupcakes'],
    'pet': ['petservices', 'petstore', 'petgrooming', 'veterinarians', 'dogwalkers', 'petsitting'],
    'veterinarian': ['veterinarians', 'vet', 'animalhospitals'],
    'photography': ['photographers', 'eventphotography', 'portraitphotography', 'videography'],
    'cleaning': ['homecleaning', 'officecleaning', 'carpetcleaning', 'windowwashing'],
    'moving': ['movers', 'selfstorage', 'truckrental'],
    'landscaping': ['landscaping', 'gardeners', 'lawn', 'treeservices'],
    'roofing': ['roofing', 'roofinspectors', 'gutterservices'],
    'hvac': ['hvac', 'heating', 'aircondrepair'],
};

// Keywords that indicate irrelevant results for specific searches
export const IRRELEVANT_CATEGORIES: Record<string, string[]> = {
    'real estate': ['banks', 'financialservices', 'investing', 'loanservices', 'creditunions', 'paydayloans', 'insurance'],
    'restaurant': ['grocery', 'convenience', 'gasstation'],
    'dentist': ['hospitals', 'physicians', 'surgeons'],
    'lawyer': ['mediation', 'arbitration'],
    'gym': ['sportsbars', 'sportinggoods'],
};

// Yelp category structure
interface YelpCategory {
    alias: string;
    title: string;
    parent_aliases?: string[];
}

// In-memory cache for Yelp categories
let cachedCategories: YelpCategory[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Fetch all Yelp categories and cache them
 */
async function fetchYelpCategories(apiKey: string): Promise<YelpCategory[]> {
    // Return cached categories if still valid
    if (cachedCategories && Date.now() - cacheTimestamp < CACHE_DURATION_MS) {
        return cachedCategories;
    }

    try {
        const response = await fetch('https://api.yelp.com/v3/categories', {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            console.error('Failed to fetch Yelp categories:', response.status);
            return cachedCategories || [];
        }

        const data = await response.json();
        cachedCategories = data.categories || [];
        cacheTimestamp = Date.now();

        console.log(`Cached ${cachedCategories.length} Yelp categories`);
        return cachedCategories;
    } catch (error) {
        console.error('Error fetching Yelp categories:', error);
        return cachedCategories || [];
    }
}

/**
 * Calculate string similarity using Levenshtein distance
 */
function stringSimilarity(str1: string, str2: string): number {
    const s1 = str1.toLowerCase();
    const s2 = str2.toLowerCase();

    // Exact match
    if (s1 === s2) return 1;

    // Contains check (high relevance)
    if (s2.includes(s1) || s1.includes(s2)) {
        return 0.9;
    }

    // Word-level matching
    const words1 = s1.split(/\s+/);
    const words2 = s2.split(/\s+/);
    const matchingWords = words1.filter(w => words2.some(w2 => w2.includes(w) || w.includes(w2)));
    if (matchingWords.length > 0) {
        return 0.7 + (0.2 * matchingWords.length / Math.max(words1.length, words2.length));
    }

    // Levenshtein distance for fuzzy matching
    const matrix: number[][] = [];
    for (let i = 0; i <= s1.length; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= s2.length; j++) {
        matrix[0][j] = j;
    }
    for (let i = 1; i <= s1.length; i++) {
        for (let j = 1; j <= s2.length; j++) {
            const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,
                matrix[i][j - 1] + 1,
                matrix[i - 1][j - 1] + cost
            );
        }
    }

    const maxLen = Math.max(s1.length, s2.length);
    const distance = matrix[s1.length][s2.length];
    return Math.max(0, 1 - distance / maxLen);
}

/**
 * Find matching categories using fuzzy search
 */
function findMatchingCategories(searchTerm: string, categories: YelpCategory[]): string[] {
    const searchLower = searchTerm.toLowerCase();
    const scored: { alias: string; score: number }[] = [];

    for (const category of categories) {
        const titleScore = stringSimilarity(searchLower, category.title);
        const aliasScore = stringSimilarity(searchLower, category.alias.replace(/_/g, ' '));
        const maxScore = Math.max(titleScore, aliasScore);

        if (maxScore >= 0.5) { // Threshold for relevance
            scored.push({ alias: category.alias, score: maxScore });
        }
    }

    // Sort by score and take top matches
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 15).map(s => s.alias);
}

/**
 * Get category aliases for a search term using hybrid approach
 * 1. Check hardcoded mappings first (fast)
 * 2. Fall back to dynamic Yelp category search
 */
export async function getCategoriesForSearch(
    searchTerm: string,
    apiKey: string
): Promise<{ categories: string[]; source: 'hardcoded' | 'dynamic' }> {
    const searchLower = searchTerm.toLowerCase().trim();

    // 1. Check hardcoded mappings first (fast path)
    if (CATEGORY_MAPPINGS[searchLower]) {
        console.log(`Using hardcoded categories for "${searchTerm}"`);
        return {
            categories: CATEGORY_MAPPINGS[searchLower],
            source: 'hardcoded'
        };
    }

    // 2. Check if any hardcoded key contains the search term
    for (const [key, categories] of Object.entries(CATEGORY_MAPPINGS)) {
        if (key.includes(searchLower) || searchLower.includes(key)) {
            console.log(`Using partial hardcoded match for "${searchTerm}" -> "${key}"`);
            return {
                categories,
                source: 'hardcoded'
            };
        }
    }

    // 3. Fall back to dynamic Yelp category search
    console.log(`No hardcoded mapping for "${searchTerm}", using dynamic search...`);
    const allCategories = await fetchYelpCategories(apiKey);

    if (allCategories.length === 0) {
        console.log('No Yelp categories available, using search term as-is');
        return { categories: [], source: 'dynamic' };
    }

    const matchedCategories = findMatchingCategories(searchTerm, allCategories);
    console.log(`Dynamic search found ${matchedCategories.length} categories for "${searchTerm}":`, matchedCategories);

    return {
        categories: matchedCategories,
        source: 'dynamic'
    };
}

/**
 * Get irrelevant categories for a search term
 */
export function getIrrelevantCategories(searchTerm: string): string[] {
    const searchLower = searchTerm.toLowerCase().trim();
    return IRRELEVANT_CATEGORIES[searchLower] || [];
}
