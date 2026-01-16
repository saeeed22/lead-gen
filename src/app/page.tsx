"use client";

import { Header } from "@/components/Header";
import { SearchForm } from "@/components/SearchForm";
import { LeadsTable } from "@/components/LeadsTable";
import { JobStatusBadge } from "@/components/JobStatusBadge";
import { useLeadSearch } from "@/hooks/useLeadSearch";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, MapPin, Briefcase, AlertCircle, Target, Zap, TrendingUp } from "lucide-react";

export default function Home() {
    const { currentJob, leads, isSubmitting, error, startSearch, resetSearch } = useLeadSearch();

    return (
        <div className="min-h-screen bg-background relative">
            {/* Background pattern */}
            <div className="fixed inset-0 grid-pattern opacity-30 pointer-events-none" />
            <div className="fixed inset-0 gradient-mesh pointer-events-none" />

            <Header />

            <main className="container mx-auto px-4 py-12 relative">
                {!currentJob ? (
                    // Search View
                    <div className="max-w-2xl mx-auto text-center animate-fade-in">
                        <div className="mb-10">
                            {/* Animated badge */}
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-in">
                                <Zap className="h-4 w-4" />
                                Powered by Yelp Fusion API
                            </div>

                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-5 tracking-tight">
                                Find Local Business
                                <span className="block mt-2 bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                                    Leads Instantly
                                </span>
                            </h1>
                            <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
                                Enter a city and business niche to discover qualified leads with ratings,
                                reviews, and contact information. Build your prospect list in seconds.
                            </p>
                        </div>

                        <SearchForm onSubmit={startSearch} isLoading={isSubmitting} />

                        {/* Feature cards */}
                        <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
                            <div className="glass rounded-xl p-5 card-hover-effect group">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                    <MapPin className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="font-semibold text-foreground mb-1">Any City</h3>
                                <p className="text-sm text-muted-foreground">Search businesses in any location worldwide</p>
                            </div>
                            <div className="glass rounded-xl p-5 card-hover-effect group">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-500/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                    <Target className="h-6 w-6 text-purple-500" />
                                </div>
                                <h3 className="font-semibold text-foreground mb-1">Smart Filtering</h3>
                                <p className="text-sm text-muted-foreground">Relevance scoring for accurate results</p>
                            </div>
                            <div className="glass rounded-xl p-5 card-hover-effect group">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-green-500/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                    <TrendingUp className="h-6 w-6 text-green-500" />
                                </div>
                                <h3 className="font-semibold text-foreground mb-1">Quality Data</h3>
                                <p className="text-sm text-muted-foreground">Ratings, reviews & contact info included</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    // Results View
                    <div className="animate-fade-in">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                            <div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={resetSearch}
                                    className="mb-2 -ml-2 text-muted-foreground hover:text-foreground group"
                                >
                                    <ArrowLeft className="mr-1 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                                    New Search
                                </Button>
                                <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                                    <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">{currentJob.niche}</span>
                                    {" "}in {currentJob.city}
                                </h2>
                                <p className="text-muted-foreground mt-1">
                                    {leads.length > 0
                                        ? `Found ${leads.length} verified business leads`
                                        : 'Searching for leads...'}
                                </p>
                            </div>
                            <JobStatusBadge status={currentJob.status} />
                        </div>

                        {error && (
                            <div className="mb-6 p-4 rounded-xl border border-destructive/50 bg-destructive/5 flex items-center gap-3 glass">
                                <AlertCircle className="h-5 w-5 text-destructive" />
                                <p className="text-destructive">{error}</p>
                            </div>
                        )}

                        <LeadsTable
                            leads={leads}
                            isLoading={currentJob.status !== 'completed'}
                            city={currentJob.city}
                            niche={currentJob.niche}
                        />
                    </div>
                )}
            </main>
        </div>
    );
}
