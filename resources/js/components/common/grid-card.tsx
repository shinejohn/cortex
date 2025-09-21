import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@inertiajs/react";
import type { ReactNode } from "react";

interface GridCardProps {
    readonly id: string;
    readonly href: string;
    readonly image: string;
    readonly imageAlt: string;
    readonly badge?: string;
    readonly title: string;
    readonly children?: ReactNode;
    readonly actions?: ReactNode;
    readonly detailsButton?: boolean;
    readonly className?: string;
    readonly imageOverlay?: ReactNode;
    readonly hideTitle?: boolean;
}

export const GridCard = ({
    id,
    href,
    image,
    imageAlt,
    badge,
    title,
    children,
    actions,
    detailsButton = true,
    className = "",
    imageOverlay,
    hideTitle = false,
}: GridCardProps) => {
    const isHorizontal = className?.includes("flex-row");

    return (
        <Card
            key={id}
            className={`gap-0 bg-card rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer p-0 border-0 flex ${isHorizontal ? 'flex-row h-auto w-full' : 'flex-col h-full'} ${className}`}
        >
            <Link href={href} className={isHorizontal ? "flex-shrink-0" : "block"}>
                <div className={`overflow-hidden relative ${isHorizontal ? 'w-48 h-32 sm:w-56 sm:h-36' : 'h-48'}`}>
                    <img src={image} alt={imageAlt} className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" />
                    {badge && (
                        <div className="absolute top-2 right-2">
                            <Badge variant="secondary" className="px-2 py-1 bg-black/30 backdrop-blur-sm text-white text-xs rounded-full border-0">
                                {badge}
                            </Badge>
                        </div>
                    )}
                    {imageOverlay}
                </div>
            </Link>

            <CardContent className={`p-3 flex flex-col ${isHorizontal ? 'flex-1 justify-between' : 'h-full'}`}>
                <div className="flex-grow">
                    {!hideTitle && (
                        <Link href={href} className="block">
                            <h3 className={`font-bold text-foreground mb-1 hover:text-primary transition-colors ${isHorizontal ? 'text-base sm:text-lg' : 'text-lg'}`}>{title}</h3>
                        </Link>
                    )}

                    {children}
                </div>

                {(actions || detailsButton) && (
                    <div className={`flex justify-between items-center ${isHorizontal ? 'mt-2 pt-2' : 'mt-3 pt-3'} border-t border-border`}>
                        {actions && <div className="flex gap-2">{actions}</div>}
                        {detailsButton && (
                            <Button variant="secondary" size="sm" asChild className="text-xs border-0 ml-auto">
                                <Link href={href}>Details</Link>
                            </Button>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
