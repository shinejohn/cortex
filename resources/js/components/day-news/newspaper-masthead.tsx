import React from "react";

interface Region {
    id: string;
    name: string;
    type: string;
    full_name?: string;
    latitude?: string;
    longitude?: string;
}

interface NewspaperMastheadProps {
    region: Region | null;
}

export default function NewspaperMasthead({ region }: NewspaperMastheadProps) {
    const today = new Date();
    const formattedDate = today.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
    });

    return (
        <div className="bg-background py-4 sm:py-6">
            <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
                {/* Massive Newspaper Title */}
                <h1 className="font-serif text-4xl font-black uppercase tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                    {region ? `${region.name} Day News` : "Day News"}
                </h1>

                {/* Date and Tagline Separator */}
                <div className="mt-3 flex items-center justify-center border-y-2 border-primary py-2">
                    <div className="flex flex-col items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-[0.15em] sm:flex-row sm:gap-6">
                        <time dateTime={today.toISOString()}>{formattedDate}</time>
                        <span className="hidden h-1.5 w-1.5 rounded-full bg-primary sm:block" />
                        <span className="text-muted-foreground">"Your Daily Source for Local Stories"</span>
                        {region && (
                            <>
                                <span className="hidden h-1.5 w-1.5 rounded-full bg-primary sm:block" />
                                <span className="text-primary">{region.full_name || region.name} Edition</span>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
