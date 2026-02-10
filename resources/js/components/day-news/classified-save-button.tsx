import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { router } from "@inertiajs/react";
import { Heart } from "lucide-react";
import { useState } from "react";
import { route } from "ziggy-js";

interface Props {
    classifiedId: number;
    isSaved: boolean;
    savesCount: number;
    showCount?: boolean;
    size?: "default" | "sm";
}

export function ClassifiedSaveButton({ classifiedId, isSaved, savesCount, showCount = false, size = "default" }: Props) {
    const [saved, setSaved] = useState(isSaved);
    const [count, setCount] = useState(savesCount);
    const [loading, setLoading] = useState(false);

    const handleSave = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (loading) return;
        setLoading(true);

        const newSavedState = !saved;
        setSaved(newSavedState);
        setCount(newSavedState ? count + 1 : count - 1);

        router.post(
            route("daynews.classifieds.toggle-save", classifiedId),
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

    return (
        <Button
            variant="ghost"
            size={size === "sm" ? "icon" : "default"}
            className={cn("gap-1", size === "sm" ? "size-8" : "h-9 px-3")}
            onClick={handleSave}
            disabled={loading}
            title={saved ? "Unsave" : "Save for later"}
        >
            <Heart className={cn("size-4", saved && "fill-red-500 text-red-500")} />
            {size !== "sm" && showCount && count > 0 && <span className="text-xs">{count}</span>}
        </Button>
    );
}
