"use client";

import { Zap, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

export function Header() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  const isDark = resolvedTheme === 'dark';

  return (
    <header className="border-b border-border/50 glass-dark sticky top-0 z-50 transition-colors duration-300">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 rounded-xl gradient-primary blur-lg opacity-50 animate-pulse-slow" />
            <div className="relative w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
          </div>
          <div>
            <span className="text-xl font-bold text-foreground tracking-tight">LeadFinder</span>
            <span className="hidden sm:inline-block ml-2 text-xs text-muted-foreground font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
              Pro
            </span>
          </div>
        </div>
        <nav className="flex items-center gap-4">
          <span className="hidden md:block text-sm text-muted-foreground">
            Find local business leads instantly
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="relative w-10 h-10 rounded-full hover:bg-primary/10 transition-all duration-300 flex items-center justify-center overflow-hidden"
            aria-label="Toggle theme"
          >
            {mounted && (
              <>
                <Sun
                  className={`absolute h-5 w-5 text-yellow-500 transition-all duration-500 ease-in-out
                    ${isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'}`}
                />
                <Moon
                  className={`absolute h-5 w-5 text-blue-400 transition-all duration-500 ease-in-out
                    ${isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'}`}
                />
              </>
            )}
          </Button>
        </nav>
      </div>
    </header>
  );
}
