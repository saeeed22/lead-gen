"use client";

import { useState } from 'react';
import { ArrowUpDown, ExternalLink, Phone, MapPin, Building2, Star, Download, ChevronLeft, ChevronRight, CheckCircle2, Image as ImageIcon } from 'lucide-react';
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

type SortField = 'name' | 'rating' | 'relevanceScore';
type SortDirection = 'asc' | 'desc';

const ITEMS_PER_PAGE = 10;

export function LeadsTable({ leads, isLoading, city = 'leads', niche = 'business' }: LeadsTableProps) {
  const [sortField, setSortField] = useState<SortField>('relevanceScore');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection(field === 'name' ? 'asc' : 'desc');
    }
    setCurrentPage(1);
  };

  const handleExport = () => {
    exportLeadsToCSV(leads, city, niche);
  };

  const sortedLeads = [...leads].sort((a, b) => {
    if (sortField === 'rating' || sortField === 'relevanceScore') {
      const aValue = (sortField === 'rating' ? a.rating : a.relevanceScore) || 0;
      const bValue = (sortField === 'rating' ? b.rating : b.relevanceScore) || 0;
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    const aValue = a[sortField]?.toLowerCase() || '';
    const bValue = b[sortField]?.toLowerCase() || '';
    const comparison = aValue.localeCompare(bValue);
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const totalPages = Math.ceil(sortedLeads.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedLeads = sortedLeads.slice(startIndex, endIndex);

  if (isLoading) {
    return (
      <div className="glass rounded-xl overflow-hidden">
        <div className="p-8">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-shimmer h-20 rounded-lg" style={{ animationDelay: `${i * 100}ms` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="glass rounded-xl overflow-hidden">
        <div className="p-16 text-center">
          <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center mb-6">
            <Building2 className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">No leads yet</h3>
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
      className={`-ml-3 h-8 hover:bg-transparent hover:text-foreground transition-colors ${sortField === field ? 'text-primary' : 'text-muted-foreground'}`}
      onClick={() => handleSort(field)}
    >
      {children}
      <ArrowUpDown className={`ml-2 h-4 w-4 transition-transform ${sortField === field && sortDirection === 'desc' ? 'rotate-180' : ''}`} />
    </Button>
  );

  const RatingStars = ({ rating }: { rating?: number }) => {
    if (!rating) return <span className="text-muted-foreground">—</span>;
    return (
      <div className="flex items-center gap-1.5">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-3.5 w-3.5 ${star <= Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`}
            />
          ))}
        </div>
        <span className="font-medium text-sm">{rating.toFixed(1)}</span>
      </div>
    );
  };

  const RelevanceBadge = ({ score }: { score?: number }) => {
    if (!score) return null;
    const percentage = Math.round(score * 100);
    let variant: 'default' | 'secondary' | 'destructive' = 'default';
    let label = 'High Match';

    if (percentage >= 80) {
      variant = 'default';
      label = 'Excellent';
    } else if (percentage >= 60) {
      variant = 'secondary';
      label = 'Good';
    } else {
      variant = 'secondary';
      label = 'Fair';
    }

    return (
      <Badge variant={variant} className="font-normal gap-1 text-xs">
        <CheckCircle2 className="h-3 w-3" />
        {label}
      </Badge>
    );
  };

  return (
    <div className="glass rounded-xl overflow-hidden animate-fade-in">
      {/* Header with Export */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/50 bg-muted/20">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm font-medium text-foreground">
            {leads.length} leads found
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          className="gap-2 hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-colors"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-border/50">
            <TableHead className="w-[280px]">
              <SortableHeader field="name">Business</SortableHeader>
            </TableHead>
            <TableHead>
              <SortableHeader field="relevanceScore">Match</SortableHeader>
            </TableHead>
            <TableHead>
              <SortableHeader field="rating">Rating</SortableHeader>
            </TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead className="w-[200px]">Location</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedLeads.map((lead, index) => (
            <TableRow
              key={lead.id}
              className="row-hover-gradient border-border/50 group"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <TableCell className="font-medium text-foreground">
                <div className="flex items-center gap-3">
                  {lead.imageUrl ? (
                    <img
                      src={lead.imageUrl}
                      alt={lead.name}
                      className="w-12 h-12 rounded-lg object-cover shadow-sm group-hover:shadow-md transition-shadow"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                  )}
                  <div>
                    <div className="font-semibold group-hover:text-primary transition-colors">{lead.name}</div>
                    {lead.reviewCount && (
                      <div className="text-xs text-muted-foreground">
                        {lead.reviewCount.toLocaleString()} reviews
                      </div>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <RelevanceBadge score={lead.relevanceScore} />
              </TableCell>
              <TableCell>
                <RatingStars rating={lead.rating} />
              </TableCell>
              <TableCell>
                {lead.category ? (
                  <Badge variant="secondary" className="font-normal text-xs">
                    {lead.category}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  {lead.phone && (
                    <a
                      href={`tel:${lead.phone}`}
                      className="inline-flex items-center gap-1.5 text-sm text-foreground hover:text-primary transition-colors"
                    >
                      <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                      {lead.phone}
                    </a>
                  )}
                  {lead.website && (
                    <a
                      href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Website
                    </a>
                  )}
                  {!lead.phone && !lead.website && (
                    <span className="text-muted-foreground">—</span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {lead.address ? (
                  <div className="flex items-start gap-1.5 text-muted-foreground">
                    <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span className="text-sm line-clamp-2">{lead.address}</span>
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
        <div className="flex items-center justify-between px-5 py-4 border-t border-border/50 bg-muted/20">
          <span className="text-sm text-muted-foreground">
            Showing {startIndex + 1}-{Math.min(endIndex, leads.length)} of {leads.length}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "ghost"}
                    size="sm"
                    className="w-9 h-9 p-0"
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="gap-1"
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
