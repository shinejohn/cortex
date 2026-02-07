import { Button } from "@/components/ui/button";
import { router } from "@inertiajs/react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { useState } from "react";
import { route } from "ziggy-js";

interface Props {
    classifiedId: number;
    isSaved: boolean;
    savesCount: number;
    showCount?: boolean;
}

export function ClassifiedSaveButton({ classifiedId, isSaved, savesCount, showCount = false }: Props) {
    const [saved, setSaved] = useState(isSaved);
    const [count, setCount] = useState(savesCount);
    const [loading, setLoading] = useState(false);

    const handleSave = () => {
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
            }
        );
    };

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={handleSave}
            disabled={loading}
            className={`gap-1 ${saved ? "text-primary" : "text-muted-foreground"}`}
            title={saved ? "Unsave" : "Save for later"}
        >
            {saved ? <BookmarkCheck className="size-4 fill-current" /> : <Bookmark className="size-4" />}
            {showCount && <span>{count}</span>}
        </Button>
    );
}
