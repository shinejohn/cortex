import { Check, MapPin, X } from "lucide-react";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useLocation } from "@/contexts/location-context";
import { cn } from "@/lib/utils";

interface LocationPromptProps {
    onDismiss?: () => void;
}

export default function LocationPrompt({ onDismiss }: LocationPromptProps) {
    const { currentRegion, confirmed, setRegion, isLoading } = useLocation();
    const [isDismissed, setIsDismissed] = useState(false);

    if (!currentRegion || confirmed || isDismissed) {
        return null;
    }

    const handleConfirm = async () => {
        try {
            await setRegion(currentRegion.id);
            onDismiss?.();
        } catch (error) {
            console.error("Failed to confirm location:", error);
        }
    };

    const handleDismiss = () => {
        setIsDismissed(true);
        onDismiss?.();
    };

    return (
        <div className={cn("border-b bg-accent/50")}>
            <div className="container mx-auto px-4 py-3 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <MapPin className="size-5 shrink-0 text-primary" />
                        <p className="text-sm text-foreground">
                            Are you in <span className="font-semibold">{currentRegion.full_name}</span>?
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button type="button" onClick={handleConfirm} disabled={isLoading} size="sm">
                            <Check className="size-4" />
                            <span>Yes, that's correct</span>
                        </Button>

                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleDismiss}
                            disabled={isLoading}
                            size="sm"
                            aria-label="Dismiss location prompt"
                        >
                            <X className="size-4" />
                            <span className="sr-only sm:not-sr-only">Change</span>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
