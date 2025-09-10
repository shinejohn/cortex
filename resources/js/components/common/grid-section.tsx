import { Button } from "@/components/ui/button";
import { Link } from "@inertiajs/react";
import { ArrowRightIcon, TagIcon } from "lucide-react";
import type { ReactNode } from "react";

interface GridSectionProps {
    readonly title: string;
    readonly description?: string;
    readonly viewAllHref: string;
    readonly viewAllText: string;
    readonly promoteHref: string;
    readonly promoteText: string;
    readonly className?: string;
    readonly children: ReactNode;
}

export const GridSection = ({
    title,
    description = "Sponsored listings",
    viewAllHref,
    viewAllText,
    promoteHref,
    promoteText,
    className = "",
    children,
}: GridSectionProps) => {
    return (
        <div className={`py-4 ${className}`}>
            <div className="max-w-7xl mx-auto px-3 sm:px-4">
                <div className="flex justify-between items-center mb-3">
                    <div>
                        <h2 className="text-xl font-bold text-foreground">
                            {title}
                        </h2>
                        <p className="text-xs text-muted-foreground mt-0.5 flex items-center">
                            <TagIcon className="h-3 w-3 mr-1" />
                            {description}
                        </p>
                    </div>
                    <Button
                        variant="link"
                        size="sm"
                        asChild
                        className="text-primary hover:text-primary/80 font-medium text-sm p-0"
                    >
                        <Link href={viewAllHref}>
                            {viewAllText}
                            <ArrowRightIcon className="ml-1 h-4 w-4" />
                        </Link>
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {children}
                </div>

                <div className="mt-4 text-center">
                    <Button
                        variant="link"
                        size="sm"
                        asChild
                        className="text-primary hover:text-primary/80 text-sm font-medium p-0"
                    >
                        <Link href={promoteHref}>{promoteText}</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
};
