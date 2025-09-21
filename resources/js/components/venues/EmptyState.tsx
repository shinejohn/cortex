import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SlidersIcon } from "lucide-react";

interface EmptyStateProps {
    onClearFilters: () => void;
}

export const EmptyState = ({ onClearFilters }: EmptyStateProps) => (
    <Card className="text-center py-16">
        <CardContent className="space-y-4">
            <SlidersIcon className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-medium text-foreground">
                No venues found
            </h3>
            <p className="text-sm text-muted-foreground">
                Try adjusting your search or filter criteria
            </p>
            <Button onClick={onClearFilters}>Reset all filters</Button>
        </CardContent>
    </Card>
);
