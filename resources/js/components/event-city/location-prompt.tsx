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
        <div className="border-b border-indigo-200/50 bg-gradient-to-r from-indigo-50/80 to-blue-50/80 dark:from-indigo-950/20 dark:to-blue-950/20 dark:border-indigo-800/30">
            <div className="container mx-auto px-4 py-3 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/50">
                            <MapPin className="size-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <p className="text-sm text-foreground">
                            Are you in <span className="font-semibold text-indigo-700 dark:text-indigo-300">{currentRegion.full_name}</span>?
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleConfirm}
                            disabled={isLoading}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Check className="size-4" />
                            <span>Yes, that's correct</span>
                        </button>

                        <button
                            type="button"
                            onClick={handleDismiss}
                            disabled={isLoading}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3.5 py-1.5 text-sm font-medium text-foreground shadow-sm hover:bg-accent transition-colors disabled:cursor-not-allowed disabled:opacity-50"
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
