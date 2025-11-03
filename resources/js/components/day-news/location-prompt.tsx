import { useLocation } from "@/contexts/location-context";
import { Check, MapPin, X } from "lucide-react";
import React, { useState } from "react";

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
        <div className="border-b border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
            <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <MapPin className="size-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                            Are you in <span className="font-semibold">{currentRegion.full_name}</span>?
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleConfirm}
                            disabled={isLoading}
                            className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
                        >
                            <Check className="size-4" />
                            <span>Yes, that's correct</span>
                        </button>

                        <button
                            type="button"
                            onClick={handleDismiss}
                            disabled={isLoading}
                            className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
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
