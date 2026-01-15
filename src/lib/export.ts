import type { Lead } from '@/types/leads';

/**
 * Convert leads array to CSV string
 */
export function leadsToCSV(leads: Lead[]): string {
    if (leads.length === 0) return '';

    // CSV headers
    const headers = [
        'Business Name',
        'Phone',
        'Address',
        'Rating',
        'Reviews',
        'Category',
        'Website',
    ];

    // Convert each lead to CSV row
    const rows = leads.map((lead) => {
        return [
            escapeCSV(lead.name),
            escapeCSV(lead.phone || ''),
            escapeCSV(lead.address || ''),
            lead.rating?.toString() || '',
            lead.reviewCount?.toString() || '',
            escapeCSV(lead.category || ''),
            escapeCSV(lead.website || ''),
        ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
}

/**
 * Escape special characters in CSV values
 */
function escapeCSV(value: string): string {
    if (!value) return '';
    // If value contains comma, quote, or newline, wrap in quotes and escape quotes
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
}

/**
 * Trigger file download in browser
 */
export function downloadCSV(csvContent: string, filename: string): void {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up the URL object
    URL.revokeObjectURL(url);
}

/**
 * Export leads to CSV file
 */
export function exportLeadsToCSV(leads: Lead[], city: string, niche: string): void {
    const csv = leadsToCSV(leads);
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `leads_${niche.toLowerCase().replace(/\s+/g, '-')}_${city.toLowerCase().replace(/\s+/g, '-')}_${timestamp}.csv`;
    downloadCSV(csv, filename);
}
