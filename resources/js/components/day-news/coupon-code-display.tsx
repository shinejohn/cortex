import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Check, Copy } from "lucide-react";
import { useState } from "react";

interface Props {
    code: string;
    size?: "sm" | "default" | "lg";
}

export function CouponCodeDisplay({ code, size = "default" }: Props) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error("Failed to copy code:", error);
        }
    };

    const inputClass = cn(
        "font-mono font-bold text-center uppercase tracking-wider bg-muted border-dashed",
        size === "sm" && "h-8 text-xs",
        size === "default" && "h-10 text-sm",
        size === "lg" && "h-12 text-base",
    );

    const buttonClass = cn(
        size === "sm" && "h-8 px-2",
        size === "default" && "h-10 px-3",
        size === "lg" && "h-12 px-4",
    );

    const iconClass = cn(
        size === "sm" && "size-3",
        size === "default" && "size-4",
        size === "lg" && "size-5",
    );

    return (
        <div className="flex gap-2">
            <Input value={code} readOnly className={inputClass} onClick={(e) => e.currentTarget.select()} />
            <Button variant={copied ? "default" : "outline"} size="sm" className={buttonClass} onClick={handleCopy}>
                {copied ? (
                    <>
                        <Check className={cn(iconClass, "mr-1")} />
                        Copied!
                    </>
                ) : (
                    <>
                        <Copy className={cn(iconClass, "mr-1")} />
                        Copy
                    </>
                )}
            </Button>
        </div>
    );
}
