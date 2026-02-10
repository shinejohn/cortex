import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { router, usePage } from "@inertiajs/react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { useState } from "react";
import { route } from "ziggy-js";

interface Props {
    couponId: number;
    isSaved: boolean;
    savesCount: number;
    showCount?: boolean;
    size?: "sm" | "default";
}

export function CouponSaveButton({ couponId, isSaved, savesCount, showCount = false, size = "default" }: Props) {
    const { auth } = usePage().props as { auth?: { user?: { id: number } } };
    const [saved, setSaved] = useState(isSaved);
    const [count, setCount] = useState(savesCount);
    const [loading, setLoading] = useState(false);

    const handleSave = () => {
        if (!auth?.user) {
            router.get(route("login"));
            return;
        }

        if (loading) return;
        setLoading(true);

        const newSavedState = !saved;
        setSaved(newSavedState);
        setCount(newSavedState ? count + 1 : count - 1);

        router.post(
            route("daynews.coupons.toggle-save", couponId),
            {},
            {
                preserveScroll: true,
                onFinish: () => setLoading(false),
                onError: () => {
                    setSaved(!newSavedState);
                    setCount(newSavedState ? count - 1 : count + 1);
                },
            },
        );
    };

    const iconClass = size === "sm" ? "size-4" : "size-5";
    const buttonClass = cn(
        size === "sm" ? "h-8 w-8 p-0" : "h-9 w-9 p-0",
        saved && "text-primary",
    );

    return (
        <div className="flex items-center gap-1">
            <Button
                variant="ghost"
                size="sm"
                className={buttonClass}
                onClick={handleSave}
                disabled={loading}
                title={saved ? "Remove from saved" : "Save coupon"}
            >
                {saved ? <BookmarkCheck className={cn(iconClass, "fill-current")} /> : <Bookmark className={iconClass} />}
            </Button>
            {showCount && count > 0 && <span className="text-xs text-muted-foreground">{count}</span>}
        </div>
    );
}
