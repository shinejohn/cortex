import React from "react";
import { Button } from "@/components/ui/button";

export const CTASection = () => (
    <div className="bg-muted py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">
                Own or manage a venue?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                List your venue to connect with event-goers and increase your
                visibility
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button size="lg">List Your Venue</Button>
                <Button variant="outline" size="lg">
                    Venue Management
                </Button>
            </div>
        </div>
    </div>
);
