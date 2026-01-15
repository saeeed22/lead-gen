"use client";

import { useState } from 'react';
import { ArrowUpDown, ExternalLink, Phone, MapPin, Building2, Star, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { exportLeadsToCSV } from '@/lib/export';
import type { Lead } from '@/types/leads';

interface LeadsTableProps {
  leads: Lead[];
  isLoading?: boolean;
  city?: string;
  niche?: string;
}

type SortField = 'name' | 'rating';
type SortDirection = 'asc' | 'desc';

const ITEMS_PER_PAGE = 10;

export function LeadsTable({ leads, isLoading, city = 'leads', niche = 'business' }: LeadsTableProps) {
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection(field === 'rating' ? 'desc' : 'asc');
    }
    setCurrentPage(1); // Reset to first page on sort
  };

  const handleExport = () => {
    exportLeadsToCSV(leads, city, niche);
  };

  const sortedLeads = [...leads].sort((a, b) => {
    if (sortField === 'rating') {
      const aValue = a.rating || 0;
      const bValue = b.rating || 0;
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    const aValue = a[sortField]?.toLowerCase() || '';
    const bValue = b[sortField]?.toLowerCase() || '';
    const comparison = aValue.localeCompare(bValue);
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedLeads.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedLeads = sortedLeads.slice(startIndex, endIndex);

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-8">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-shimmer h-16 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-16 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Building2 className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No leads yet</h3>
          <p className="text-muted-foreground max-w-sm mx-auto">
            Start a search to find local business leads in your target area.
          </p>
        </div>
      </div>
    );
  }

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8 hover:bg-transparent text-muted-foreground hover:text-foreground"
      onClick={() => handleSort(field)}
    >
      {children}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );

  const RatingStars = ({ rating }: { rating?: number }) => {
    if (!rating) return <span className="text-muted-foreground">—</span>;
    return (
      <div className="flex items-center gap-1">
        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        <span className="font-medium">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden animate-fade-in">
      {/* Header with Export */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
        <span className="text-sm text-muted-foreground">
          {leads.length} leads found
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-border">
            <TableHead className="w-[200px]">
              <SortableHeader field="name">Business Name</SortableHeader>
            </TableHead>
            <TableHead>
              <SortableHeader field="rating">Rating</SortableHeader>
            </TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Website</TableHead>
            <TableHead className="w-[200px]">Address</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedLeads.map((lead, index) => (
            <TableRow
              key={lead.id}
              className="hover:bg-muted/50 transition-colors border-border"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <TableCell className="font-medium text-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div>{lead.name}</div>
                    {lead.reviewCount && (
                      <div className="text-xs text-muted-foreground">
                        {lead.reviewCount} reviews
                      </div>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <RatingStars rating={lead.rating} />
              </TableCell>
              <TableCell>
                {lead.category ? (
                  <Badge variant="secondary" className="font-normal">
                    {lead.category}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell>
                {lead.phone ? (
                  <a
                    href={`tel:${lead.phone}`}
                    className="inline-flex items-center gap-1.5 text-foreground hover:text-primary transition-colors"
                  >
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {lead.phone}
                  </a>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell>
                {lead.website ? (
                  <a
                    href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span className="truncate max-w-[120px]">Visit</span>
                  </a>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell>
                {lead.address ? (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate max-w-[180px]">{lead.address}</span>
                  </div>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/30">
          <span className="text-sm text-muted-foreground">
            Showing {startIndex + 1}-{Math.min(endIndex, leads.length)} of {leads.length}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "ghost"}
                  size="sm"
                  className="w-8 h-8 p-0"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
