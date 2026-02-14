import axios from "axios";
import { Heart } from "lucide-react";
import { useEffect, useState } from "react";

interface FollowButtonProps {
    followableType: "event" | "performer" | "venue" | "calendar";
    followableId: string;
    showCount?: boolean;
    className?: string;
    initialFollowing?: boolean;
    isAuthenticated?: boolean;
}

export default function FollowButton({
    followableType,
    followableId,
    showCount = false,
    className = "",
    initialFollowing = false,
    isAuthenticated = false,
}: FollowButtonProps) {
    const [following, setFollowing] = useState(initialFollowing);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) {
            setLoading(false);
            return;
        }
        axios
            .get("/api/follow/status", {
                params: { followable_type: followableType, followable_id: followableId },
            })
            .then((res) => {
                setFollowing(res.data.following);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [followableType, followableId, isAuthenticated]);

    if (!isAuthenticated) {
        return null;
    }

    const toggle = async () => {
        setLoading(true);
        try {
            const res = await axios.post("/api/follow/toggle", {
                followable_type: followableType,
                followable_id: followableId,
            });
            setFollowing(res.data.following);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            type="button"
            onClick={toggle}
            disabled={loading}
            className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 ${className}`}
        >
            <Heart
                className={following ? "fill-red-500 text-red-500 size-5" : "text-muted-foreground size-5"}
                aria-hidden
            />
            <span>{following ? "Following" : "Follow"}</span>
        </button>
    );
}
