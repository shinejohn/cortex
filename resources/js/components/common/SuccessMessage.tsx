import { CheckCircle2, X } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useState } from "react";
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
        <Alert className={cn("mb-4 border-green-200 bg-green-50", className)}>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">{title || "Success"}</AlertTitle>
            <AlertDescription className="mt-2 text-green-700">{message}</AlertDescription>
            {onDismiss && (
                <Button variant="ghost" size="sm" className="absolute right-2 top-2" onClick={handleDismiss}>
                    <X className="h-4 w-4" />
                </Button>
            )}
        </Alert>
    );
}
