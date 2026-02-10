import { router } from "@inertiajs/react";
import { CheckCircle, MapPin, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface CheckInButtonProps {
    eventId: string;
    eventName: string;
    venueName: string;
    isCheckedIn?: boolean;
    variant?: "default" | "outline" | "ghost";
    size?: "sm" | "md" | "lg";
}

export function CheckInButton({ eventId, eventName, venueName, isCheckedIn = false, variant = "default", size = "md" }: CheckInButtonProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleCheckIn = async () => {
        if (isCheckedIn || isLoading) return;

        setIsLoading(true);
        try {
            await router.post(
                `/api/events/${eventId}/check-in`,
                {},
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        router.reload({ only: ["event"] });
                    },
                    onError: (errors) => {
                        console.error("Check-in failed:", errors);
                    },
                    onFinish: () => {
                        setIsLoading(false);
                    },
                },
            );
        } catch (error) {
            console.error("Check-in error:", error);
            setIsLoading(false);
        }
    };

    return (
        <Button
            onClick={handleCheckIn}
            disabled={isCheckedIn || isLoading}
            variant={isCheckedIn ? "default" : variant}
            size={size}
            className={
                isCheckedIn
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow-md transition-all"
            }
        >
            {isCheckedIn ? (
                <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Checked In
                </>
            ) : isLoading ? (
                <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Checking In...
                </>
            ) : (
                <>
                    <MapPin className="h-4 w-4 mr-2" />
                    Check In
                </>
            )}
        </Button>
    );
}
