"use client";

import { Header } from "@/components/Header";
import { SearchForm } from "@/components/SearchForm";
import { LeadsTable } from "@/components/LeadsTable";
import { JobStatusBadge } from "@/components/JobStatusBadge";
import { useLeadSearch } from "@/hooks/useLeadSearch";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, MapPin, Briefcase } from "lucide-react";

export default function Home() {
    const { currentJob, leads, isSubmitting, startSearch, resetSearch } = useLeadSearch();

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="container mx-auto px-4 py-12">
                {!currentJob ? (
                    // Search View
                    <div className="max-w-2xl mx-auto text-center animate-fade-in">
                        <div className="mb-8">
                            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
                                Find Local Business Leads
                            </h1>
                            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                                Enter a city and business niche to discover qualified leads instantly.
                                Build your prospect list in seconds.
                            </p>
                        </div>

                        <SearchForm onSubmit={startSearch} isLoading={isSubmitting} />

                        <div className="mt-12 grid grid-cols-3 gap-6 max-w-lg mx-auto">
                            <div className="text-center">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                                    <MapPin className="h-6 w-6 text-primary" />
                                </div>
                                <p className="text-sm text-muted-foreground">Any City</p>
                            </div>
                            <div className="text-center">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                                    <Briefcase className="h-6 w-6 text-primary" />
                                </div>
                                <p className="text-sm text-muted-foreground">Any Niche</p>
                            </div>
                            <div className="text-center">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                                    <Users className="h-6 w-6 text-primary" />
                                </div>
                                <p className="text-sm text-muted-foreground">Quality Leads</p>
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
                                    className="mb-2 -ml-2 text-muted-foreground hover:text-foreground"
                                >
                                    <ArrowLeft className="mr-1 h-4 w-4" />
                                    New Search
                                </Button>
                                <h2 className="text-2xl font-bold text-foreground">
                                    {currentJob.niche} in {currentJob.city}
                                </h2>
                                <p className="text-muted-foreground mt-1">
                                    {leads.length > 0
                                        ? `Found ${leads.length} business leads`
                                        : 'Searching for leads...'}
                                </p>
                            </div>
                            <JobStatusBadge status={currentJob.status} />
                        </div>

                        <LeadsTable
                            leads={leads}
                            isLoading={currentJob.status !== 'completed'}
                        />
                    </div>
                )}
            </main>
        </div>
    );
}
