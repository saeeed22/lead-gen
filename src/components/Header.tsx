import { Zap } from 'lucide-react';

export function Header() {
  return (
    <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center shadow-glow">
            <Zap className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">LeadFinder</span>
        </div>
        <nav className="flex items-center gap-6">
          <span className="text-sm text-muted-foreground">
            Find local business leads instantly
          </span>
        </nav>
      </div>
    </header>
  );
}
