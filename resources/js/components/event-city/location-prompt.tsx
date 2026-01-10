import { Check, MapPin, X } from "lucide-react";
import { useState } from "react";
import { useLocation } from "@/contexts/location-context";

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
        <div className="border-b border-primary/20 bg-primary/5">
            <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <MapPin className="size-5 flex-shrink-0 text-primary" />
                        <p className="text-sm text-foreground">
                            Are you in <span className="font-semibold">{currentRegion.full_name}</span>?
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleConfirm}
                            disabled={isLoading}
                            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Check className="size-4" />
                            <span>Yes, that's correct</span>
                        </button>

                        <button
                            type="button"
                            onClick={handleDismiss}
                            disabled={isLoading}
                            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label="Dismiss location prompt"
                        >
                            <X className="size-4" />
                            <span className="sr-only sm:not-sr-only">Change</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
