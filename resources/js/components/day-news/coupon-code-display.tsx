import { Button } from "@/components/ui/button";
import { Check, Clipboard } from "lucide-react";
import { useState } from "react";

interface Props {
    code: string;
    size?: "sm" | "default" | "lg";
}

export function CouponCodeDisplay({ code, size = "default" }: Props) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getSizeClasses = () => {
        switch (size) {
            case "sm":
                return "text-sm p-1";
            case "lg":
                return "text-xl p-3";
            default:
                return "text-base p-2";
        }
    };

    return (
        <div className="flex items-center gap-2">
            <div
                className={`relative flex-1 select-all items-center justify-center rounded-md border border-dashed border-primary bg-primary/10 font-mono font-bold text-primary ${getSizeClasses()}`}
            >
                {code}
            </div>
            <Button
                variant="outline"
                size="icon"
                onClick={handleCopy}
                className="h-full aspect-square"
                title="Copy Code"
            >
                {copied ? <Check className="size-4 text-green-500" /> : <Clipboard className="size-4" />}
            </Button>
        </div>
    );
}
