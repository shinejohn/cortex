import { AlertCircle, X } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ErrorMessageProps {
    title?: string;
    message: string | string[] | Record<string, string[]>;
    onDismiss?: () => void;
    className?: string;
    variant?: "default" | "destructive";
}

export function ErrorMessage({ title, message, onDismiss, className, variant = "destructive" }: ErrorMessageProps) {
    const [dismissed, setDismissed] = useState(false);

    if (dismissed) {
        return null;
    }

    const handleDismiss = () => {
        setDismissed(true);
        onDismiss?.();
    };

    const renderMessage = () => {
        if (typeof message === "string") {
            return <p>{message}</p>;
        }

        if (Array.isArray(message)) {
            return (
                <ul className="list-disc list-inside space-y-1">
                    {message.map((msg, index) => (
                        <li key={index}>{msg}</li>
                    ))}
                </ul>
            );
        }

        if (typeof message === "object") {
            return (
                <ul className="list-disc list-inside space-y-1">
                    {Object.entries(message).map(([field, errors]) => (
                        <li key={field}>
                            <strong>{field}:</strong> {Array.isArray(errors) ? errors.join(", ") : errors}
                        </li>
                    ))}
                </ul>
            );
        }

        return null;
    };

    return (
        <Alert variant={variant} className={cn("mb-4", className)}>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{title || "Error"}</AlertTitle>
            <AlertDescription className="mt-2">{renderMessage()}</AlertDescription>
            {onDismiss && (
                <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-2"
                    onClick={handleDismiss}
                >
                    <X className="h-4 w-4" />
                </Button>
            )}
        </Alert>
    );
}

