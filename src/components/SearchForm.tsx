"use client";

import { useState } from 'react';
import { Search, MapPin, Briefcase, Loader2, Sparkles } from 'lucide-react';
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
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!city.trim() || !niche.trim()) return;
    await onSubmit({ city: city.trim(), niche: niche.trim() });
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto">
      <div className="glass rounded-2xl p-8 shadow-xl card-hover-effect relative overflow-hidden">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 gradient-mesh opacity-50 pointer-events-none" />

        <div className="relative space-y-6">
          <div className="space-y-2">
            <Label htmlFor="city" className="text-sm font-medium text-foreground flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              City
            </Label>
            <div className="relative group">
              <Input
                id="city"
                type="text"
                placeholder="e.g., San Francisco, New York"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onFocus={() => setFocusedField('city')}
                onBlur={() => setFocusedField(null)}
                className={`h-12 text-base bg-background/50 border-input/50 transition-all duration-300
                  ${focusedField === 'city' ? 'ring-2 ring-primary/20 border-primary' : 'hover:border-primary/50'}`}
                disabled={isLoading}
              />
              <div className={`absolute inset-0 rounded-md transition-opacity duration-300 pointer-events-none
                ${focusedField === 'city' ? 'opacity-100' : 'opacity-0'}`}
                style={{ boxShadow: '0 0 20px -5px hsl(var(--primary) / 0.3)' }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="niche" className="text-sm font-medium text-foreground flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-primary" />
              Business Niche
            </Label>
            <div className="relative group">
              <Input
                id="niche"
                type="text"
                placeholder="e.g., Restaurants, Real Estate, Dentists"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                onFocus={() => setFocusedField('niche')}
                onBlur={() => setFocusedField(null)}
                className={`h-12 text-base bg-background/50 border-input/50 transition-all duration-300
                  ${focusedField === 'niche' ? 'ring-2 ring-primary/20 border-primary' : 'hover:border-primary/50'}`}
                disabled={isLoading}
              />
              <div className={`absolute inset-0 rounded-md transition-opacity duration-300 pointer-events-none
                ${focusedField === 'niche' ? 'opacity-100' : 'opacity-0'}`}
                style={{ boxShadow: '0 0 20px -5px hsl(var(--primary) / 0.3)' }}
              />
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full h-13 text-base font-semibold gradient-primary hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-primary/20 group"
            disabled={isLoading || !city.trim() || !niche.trim()}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
                Find Leads
                <Sparkles className="ml-2 h-4 w-4 opacity-70" />
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
