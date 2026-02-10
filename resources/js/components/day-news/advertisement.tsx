import { Link } from "@inertiajs/react";
import { ExternalLink } from "lucide-react";
import React, { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Advertisement {
    id: number;
    placement: string;
    advertable: {
        id: number;
        title: string;
        excerpt: string | null;
        featured_image: string | null;
        slug: string;
    };
    expires_at: string;
}

interface AdvertisementProps {
    ad: Advertisement;
    onImpression?: (adId: number) => void;
    onClick?: (adId: number) => void;
}

export default function Advertisement({ ad, onImpression, onClick }: AdvertisementProps) {
    const hasTrackedImpression = useRef(false);

    useEffect(() => {
        if (!hasTrackedImpression.current && onImpression) {
            onImpression(ad.id);
            hasTrackedImpression.current = true;
        }
    }, [ad.id, onImpression]);

    const handleClick = () => {
        if (onClick) {
            onClick(ad.id);
        }
    };

    if (ad.placement === "banner") {
        return (
            <Link href={`/posts/${ad.advertable.slug}`} onClick={handleClick} className="block">
                <Card className="group overflow-hidden border-none shadow-sm hover:shadow-md transition-all">
                    {ad.advertable.featured_image && (
                        <div className="aspect-[6/1] overflow-hidden">
                            <img
                                src={ad.advertable.featured_image}
                                alt={ad.advertable.title}
                                className="size-full object-cover transition-transform group-hover:scale-105"
                            />
                        </div>
                    )}
                    <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{ad.advertable.title}</span>
                            <span className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">Sponsored</span>
                        </div>
                    </CardContent>
                </Card>
            </Link>
        );
    }

    if (ad.placement === "sidebar") {
        return (
            <Link href={`/posts/${ad.advertable.slug}`} onClick={handleClick}>
                <Card className="group overflow-hidden border-none shadow-sm hover:shadow-md transition-all">
                    {ad.advertable.featured_image && (
                        <div className="aspect-square overflow-hidden">
                            <img
                                src={ad.advertable.featured_image}
                                alt={ad.advertable.title}
                                className="size-full object-cover transition-transform group-hover:scale-105"
                            />
                        </div>
                    )}
                    <CardHeader className="p-3">
                        <div className="mb-1 flex items-center justify-between">
                            <span className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">Sponsored</span>
                            <ExternalLink className="size-3 text-muted-foreground" />
                        </div>
                        <CardTitle className="line-clamp-2 text-sm font-bold">{ad.advertable.title}</CardTitle>
                        {ad.advertable.excerpt && (
                            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{ad.advertable.excerpt}</p>
                        )}
                    </CardHeader>
                    <div className="px-3 pb-3">
                        <div className="w-full rounded-sm bg-primary py-1 text-center text-xs font-medium text-primary-foreground">
                            Learn More
                        </div>
                    </div>
                </Card>
            </Link>
        );
    }

    if (ad.placement === "inline") {
        return (
            <Link href={`/posts/${ad.advertable.slug}`} onClick={handleClick}>
                <Card className="group overflow-hidden border-none shadow-sm hover:shadow-md transition-all">
                    <CardContent className="flex gap-3 p-4">
                        {ad.advertable.featured_image && (
                            <div className="size-20 shrink-0 overflow-hidden rounded-md">
                                <img
                                    src={ad.advertable.featured_image}
                                    alt={ad.advertable.title}
                                    className="size-full object-cover transition-transform group-hover:scale-105"
                                />
                            </div>
                        )}
                        <div className="flex-1">
                            <div className="mb-1 flex items-center justify-between">
                                <span className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">Sponsored</span>
                                <ExternalLink className="size-3 text-muted-foreground" />
                            </div>
                            <h3 className="line-clamp-1 text-sm font-bold">{ad.advertable.title}</h3>
                            {ad.advertable.excerpt && (
                                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{ad.advertable.excerpt}</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </Link>
        );
    }

    // Featured placement
    return (
        <Link href={`/posts/${ad.advertable.slug}`} onClick={handleClick}>
            <Card className="group overflow-hidden border-none shadow-sm hover:shadow-lg transition-all">
                {ad.advertable.featured_image && (
                    <div className="aspect-[16/9] overflow-hidden">
                        <img
                            src={ad.advertable.featured_image}
                            alt={ad.advertable.title}
                            className="size-full object-cover transition-transform group-hover:scale-105"
                        />
                    </div>
                )}
                <CardHeader>
                    <div className="mb-2 flex items-center justify-between">
                        <span className="text-[10px] uppercase tracking-widest font-black text-primary">Featured Sponsor</span>
                        <ExternalLink className="size-4 text-muted-foreground" />
                    </div>
                    <CardTitle className="font-display text-xl font-black tracking-tight">{ad.advertable.title}</CardTitle>
                    {ad.advertable.excerpt && (
                        <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{ad.advertable.excerpt}</p>
                    )}
                </CardHeader>
            </Card>
        </Link>
    );
}
