import { route } from "ziggy-js";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ProviderIcon from "./provider-icon";

interface SocialButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    provider: string;
    loading?: boolean;
    invitation?: string;
}

export default function SocialButton({ provider, className, invitation, ...props }: SocialButtonProps) {
    return (
        <a href={route("auth.socialite.redirect", { provider, invitation }, true)} className="w-full">
            <Button
                type="button"
                aria-label={`Continue with ${provider}`}
                variant="outline"
                className={cn("bg-background hover:bg-accent/5 w-full cursor-pointer gap-2", className)}
                {...props}
            >
                <ProviderIcon provider={provider} className="h-4 w-4" />
            </Button>
        </a>
    );
}
