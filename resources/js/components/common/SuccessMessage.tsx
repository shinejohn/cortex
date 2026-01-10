import { CheckCircle2, X } from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SuccessMessageProps {
    title?: string;
    message: string;
    onDismiss?: () => void;
    className?: string;
    autoDismiss?: boolean;
    autoDismissDelay?: number;
}

export function SuccessMessage({ title, message, onDismiss, className, autoDismiss = false, autoDismissDelay = 5000 }: SuccessMessageProps) {
    const [dismissed, setDismissed] = useState(false);

    if (dismissed) {
        return null;
    }

    const handleDismiss = () => {
        setDismissed(true);
        onDismiss?.();
    };

    if (autoDismiss) {
        setTimeout(() => {
            handleDismiss();
        }, autoDismissDelay);
    }

    return (
        <Alert className={cn("mb-4 border-success/50 bg-success/10 [&>svg]:text-success", className)} variant="default">
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle className="text-success-foreground">{title || "Success"}</AlertTitle>
            <AlertDescription className="mt-2 text-success-foreground/80">{message}</AlertDescription>
            {onDismiss && (
                <Button variant="ghost" size="sm" className="absolute right-2 top-2" onClick={handleDismiss}>
                    <X className="h-4 w-4" />
                </Button>
            )}
        </Alert>
    );
}
