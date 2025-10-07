import { Button } from "@/components/ui/button";
import { router, usePage } from "@inertiajs/react";
import axios from "axios";
import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { route } from "ziggy-js";

interface FollowButtonProps {
    followableType: "event" | "performer" | "venue" | "calendar";
    followableId: string;
    initialFollowing?: boolean;
    variant?: "default" | "icon" | "text";
    size?: "default" | "sm" | "lg" | "icon";
    className?: string;
}

export function FollowButton({
    followableType,
    followableId,
    initialFollowing = false,
    variant = "default",
    size = "default",
    className = "",
}: FollowButtonProps) {
    const { auth } = usePage().props as { auth?: { user?: { id: string } } };
    const [isFollowing, setIsFollowing] = useState(initialFollowing);
    const [isLoading, setIsLoading] = useState(false);

    // Update state when initialFollowing prop changes
    useEffect(() => {
        setIsFollowing(initialFollowing);
    }, [initialFollowing]);

    const handleToggle = async () => {
        // Redirect to login if not authenticated
        if (!auth?.user) {
            router.visit(route("login"));
            return;
        }

        setIsLoading(true);

        try {
            const response = await axios.post(route("api.follow.toggle"), {
                followable_type: followableType,
                followable_id: followableId,
            });

            setIsFollowing(response.data.following);
        } catch (error) {
            console.error("Failed to toggle follow:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (variant === "icon") {
        return (
            <Button onClick={handleToggle} disabled={isLoading} size={size} variant="ghost" className={className}>
                <Heart className={`h-5 w-5 ${isFollowing ? "fill-red-500 text-red-500" : ""}`} />
            </Button>
        );
    }

    if (variant === "text") {
        return (
            <Button onClick={handleToggle} disabled={isLoading} size={size} variant={isFollowing ? "outline" : "default"} className={className}>
                {isFollowing ? "Following" : "Follow"}
            </Button>
        );
    }

    return (
        <Button onClick={handleToggle} disabled={isLoading} size={size} variant={isFollowing ? "outline" : "default"} className={className}>
            <Heart className={`h-4 w-4 mr-2 ${isFollowing ? "fill-current" : ""}`} />
            {isFollowing ? "Saved" : "Save"}
        </Button>
    );
}
