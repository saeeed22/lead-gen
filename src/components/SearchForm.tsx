import { useState } from 'react';
import { Search, MapPin, Briefcase, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { SearchFormData } from '@/types/leads';

interface SearchFormProps {
  onSubmit: (data: SearchFormData) => Promise<void>;
  isLoading?: boolean;
}

export function SearchForm({ onSubmit, isLoading }: SearchFormProps) {
  const [city, setCity] = useState('');
  const [niche, setNiche] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!city.trim() || !niche.trim()) return;
    await onSubmit({ city: city.trim(), niche: niche.trim() });
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto">
      <div className="bg-card rounded-2xl border border-border p-8 shadow-lg">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="city" className="text-sm font-medium text-foreground">
              City
            </Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="city"
                type="text"
                placeholder="e.g., San Francisco"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="pl-11 h-12 text-base bg-background border-input focus-visible:ring-primary"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="niche" className="text-sm font-medium text-foreground">
              Business Niche
            </Label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="niche"
                type="text"
                placeholder="e.g., Restaurants, Real Estate"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                className="pl-11 h-12 text-base bg-background border-input focus-visible:ring-primary"
                disabled={isLoading}
              />
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full h-12 text-base font-semibold gradient-primary hover:opacity-90 transition-opacity shadow-glow"
            disabled={isLoading || !city.trim() || !niche.trim()}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Starting Search...
              </>
            ) : (
              <>
                <Search className="mr-2 h-5 w-5" />
                Find Leads
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
