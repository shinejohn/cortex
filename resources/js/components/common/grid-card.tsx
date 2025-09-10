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
}: GridCardProps) => {
    return (
        <Card
            key={id}
            className={`gap-0 bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer p-0 border-0 ${className}`}
        >
            <Link href={href} className="block">
                <div className="h-48 overflow-hidden relative">
                    <img
                        src={image}
                        alt={imageAlt}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                    {badge && (
                        <div className="absolute top-2 right-2">
                            <Badge
                                variant="secondary"
                                className="px-2 py-1 bg-black/30 backdrop-blur-sm text-white text-xs rounded-full border-0"
                            >
                                {badge}
                            </Badge>
                        </div>
                    )}
                </div>
            </Link>

            <CardContent className="p-3">
                <Link href={href} className="block">
                    <h3 className="font-bold text-lg text-gray-900 mb-1 hover:text-primary-600 transition-colors">
                        {title}
                    </h3>
                </Link>

                {children}

                {(actions || detailsButton) && (
                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                        {actions && <div className="flex gap-2">{actions}</div>}
                        {detailsButton && (
                            <Button
                                variant="secondary"
                                size="sm"
                                asChild
                                className="text-xs bg-primary-100 text-primary-700 hover:bg-primary-200 border-0 ml-auto"
                            >
                                <Link href={href}>Details</Link>
                            </Button>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
