import { Button } from "@/components/ui/button";
import { CheckCircle, MapPin } from "lucide-react";
import { router } from "@inertiajs/react";
import { useState } from "react";

interface CheckInButtonProps {
    eventId: string;
    eventName: string;
    venueName: string;
    isCheckedIn?: boolean;
    variant?: "default" | "outline" | "ghost";
    size?: "sm" | "md" | "lg";
}

export function CheckInButton({
    eventId,
    eventName,
    venueName,
    isCheckedIn = false,
    variant = "default",
    size = "md",
}: CheckInButtonProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleCheckIn = async () => {
        if (isCheckedIn || isLoading) return;

        setIsLoading(true);
        try {
            await router.post(`/api/events/${eventId}/check-in`, {}, {
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
            });
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
            className={isCheckedIn ? "bg-green-600 hover:bg-green-700" : ""}
        >
            {isCheckedIn ? (
                <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Checked In
                </>
            ) : isLoading ? (
                "Checking In..."
            ) : (
                <>
                    <MapPin className="h-4 w-4 mr-2" />
                    Check In
                </>
            )}
        </Button>
    );
}

