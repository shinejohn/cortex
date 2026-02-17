import { Link } from "@inertiajs/react";
import { ExternalLink } from "lucide-react";
import React, { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GoogleAd } from "@/components/ads/GoogleAd";

interface Advertisement {
    id: number;
    type?: string;
    external_code?: string;
    placement: string;
    advertable?: {
        id: number;
        title: string;
        excerpt: string | null;
        featured_image: string | null;
        slug: string;
    } | null;
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

    // External / Google Ad Logic
    if (ad.type === 'google' || ad.type === 'network') {
        if (!ad.external_code) return null;

        return (
            <div className="w-full my-4" onClick={handleClick}>
                <GoogleAd scriptCode={ad.external_code} className={ad.placement === 'sidebar' ? 'min-h-[250px]' : 'min-h-[90px]'} />
                <div className="text-[10px] text-muted-foreground text-center mt-1">Advertisement</div>
            </div>
        );
    }

    // Fallback if local ad but no advertable data
    if (!ad.advertable) return null;

    if (ad.placement === "banner") {
        return (
            <Link href={`/posts/${ad.advertable.slug}`} onClick={handleClick} className="block">
                <Card className="overflow-hidden transition-shadow hover:shadow-md">
                    {ad.advertable.featured_image && (
                        <div className="aspect-[6/1] overflow-hidden">
                            <img
                                src={ad.advertable.featured_image}
                                alt={ad.advertable.title}
                                className="size-full object-cover transition-transform hover:scale-105"
                            />
                        </div>
                    )}
                    <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{ad.advertable.title}</span>
                            <span className="text-xs text-muted-foreground">Sponsored</span>
                        </div>
                    </CardContent>
                </Card>
            </Link>
        );
    }

    if (ad.placement === "sidebar") {
        return (
            <Link href={`/posts/${ad.advertable.slug}`} onClick={handleClick}>
                <Card className="group overflow-hidden transition-shadow hover:shadow-md">
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
                            <span className="text-xs text-muted-foreground">Sponsored</span>
                            <ExternalLink className="size-3" />
                        </div>
                        <CardTitle className="line-clamp-2 text-sm">{ad.advertable.title}</CardTitle>
                        {ad.advertable.excerpt && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{ad.advertable.excerpt}</p>}
                    </CardHeader>
                </Card>
            </Link>
        );
    }

    if (ad.placement === "inline") {
        return (
            <Link href={`/posts/${ad.advertable.slug}`} onClick={handleClick}>
                <Card className="group overflow-hidden border-primary/20 transition-shadow hover:shadow-md">
                    <CardContent className="flex gap-3 p-4">
                        {ad.advertable.featured_image && (
                            <div className="size-20 flex-shrink-0 overflow-hidden rounded">
                                <img
                                    src={ad.advertable.featured_image}
                                    alt={ad.advertable.title}
                                    className="size-full object-cover transition-transform group-hover:scale-105"
                                />
                            </div>
                        )}
                        <div className="flex-1">
                            <div className="mb-1 flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">Sponsored</span>
                                <ExternalLink className="size-3" />
                            </div>
                            <h3 className="line-clamp-1 text-sm font-semibold">{ad.advertable.title}</h3>
                            {ad.advertable.excerpt && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{ad.advertable.excerpt}</p>}
                        </div>
                    </CardContent>
                </Card>
            </Link>
        );
    }

    // Featured placement
    return (
        <Link href={`/posts/${ad.advertable.slug}`} onClick={handleClick}>
            <Card className="group overflow-hidden border-primary transition-shadow hover:shadow-lg">
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
                        <span className="text-xs font-medium text-primary">Featured Sponsor</span>
                        <ExternalLink className="size-4" />
                    </div>
                    <CardTitle className="text-xl">{ad.advertable.title}</CardTitle>
                    {ad.advertable.excerpt && <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{ad.advertable.excerpt}</p>}
                </CardHeader>
            </Card>
        </Link>
    );
}
