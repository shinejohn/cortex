import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Coupon } from "@/types/coupon";
import { Link } from "@inertiajs/react";
import { BadgeCheck, Calendar, MapPin, Store, Tag } from "lucide-react";
import { route } from "ziggy-js";
import { CouponCodeDisplay } from "./coupon-code-display";
import { CouponSaveButton } from "./coupon-save-button";
import { CouponVoteButtons } from "./coupon-vote-buttons";

interface Props {
    coupon: Coupon;
    featured?: boolean;
    compact?: boolean;
}

export function CouponCard({ coupon, featured = false, compact = false }: Props) {
    const couponUrl = route("daynews.coupons.show", { slug: coupon.slug });
    const businessImage = coupon.business?.images?.[0] ?? coupon.image ?? null;

    const isExpiringSoon = coupon.valid_until && new Date(coupon.valid_until) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const isExpired = coupon.valid_until ? new Date(coupon.valid_until) < new Date() : false;

    const formatCategory = (cat: string) => {
        return cat
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    };

    if (compact) {
        return (
            <Card className="group overflow-hidden border-none shadow-sm hover:shadow-md transition-all p-0">
                <div className="flex gap-3 p-4">
                    <div className="size-16 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                        {businessImage ? (
                            <img src={businessImage} alt={coupon.business?.name ?? coupon.title} className="size-full object-cover" />
                        ) : (
                            <div className="flex size-full items-center justify-center">
                                <Store className="size-6 text-muted-foreground" />
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <Link href={couponUrl}>
                            <h3 className="line-clamp-1 font-display font-black tracking-tight text-sm transition-colors group-hover:text-primary">{coupon.title}</h3>
                        </Link>
                        {coupon.business && <p className="text-xs text-muted-foreground">{coupon.business.name}</p>}
                        <div className="mt-1 flex items-center gap-2">
                            <Badge variant="secondary" className="text-[10px] uppercase tracking-widest font-black">
                                {coupon.discount_display}
                            </Badge>
                            {coupon.business?.is_verified && (
                                <BadgeCheck className="size-4 text-primary" title="Verified Business" />
                            )}
                        </div>
                    </div>
                </div>
            </Card>
        );
    }

    if (featured) {
        return (
            <Card className="group overflow-hidden border-none shadow-sm hover:shadow-lg transition-all p-0">
                <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                    {businessImage ? (
                        <img
                            src={businessImage}
                            alt={coupon.business?.name ?? coupon.title}
                            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                    ) : (
                        <div className="flex size-full items-center justify-center">
                            <Store className="size-12 text-muted-foreground" />
                        </div>
                    )}
                    <div className="absolute top-3 left-3">
                        <Badge className="bg-primary text-primary-foreground font-black">{coupon.discount_display}</Badge>
                    </div>
                    {coupon.business?.is_verified && (
                        <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-xs font-medium text-primary backdrop-blur-sm">
                            <BadgeCheck className="size-3.5" />
                            Verified
                        </div>
                    )}
                </div>
                <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                        <Link href={couponUrl} className="flex-1">
                            <CardTitle className="line-clamp-2 font-display font-black tracking-tight text-lg transition-colors group-hover:text-primary">{coupon.title}</CardTitle>
                        </Link>
                        <CouponSaveButton couponId={coupon.id} isSaved={coupon.is_saved ?? false} savesCount={coupon.saves_count ?? 0} />
                    </div>
                    {coupon.business && (
                        <p className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Store className="size-4" />
                            {coupon.business.name}
                        </p>
                    )}
                </CardHeader>
                <CardContent className="space-y-3 pb-4">
                    {coupon.code && <CouponCodeDisplay code={coupon.code} />}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-3">
                            {coupon.regions && coupon.regions.length > 0 && (
                                <span className="flex items-center gap-1">
                                    <MapPin className="size-3.5 text-primary" />
                                    {coupon.regions[0].name}
                                </span>
                            )}
                            {coupon.valid_until && (
                                <span
                                    className={`flex items-center gap-1 ${isExpiringSoon ? "text-orange-500" : ""} ${isExpired ? "text-red-500" : ""}`}
                                >
                                    <Calendar className="size-3.5 text-primary" />
                                    {isExpired ? "Expired" : `Expires ${new Date(coupon.valid_until).toLocaleDateString()}`}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t bg-muted/5">
                        <CouponVoteButtons
                            couponId={coupon.id}
                            score={coupon.score ?? 0}
                            upvotesCount={coupon.upvotes_count ?? 0}
                            downvotesCount={coupon.downvotes_count ?? 0}
                            userVote={coupon.user_vote}
                        />
                        {coupon.category && (
                            <Badge variant="outline" className="text-xs">
                                <Tag className="mr-1 size-3" />
                                {formatCategory(coupon.category)}
                            </Badge>
                        )}
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Default card
    return (
        <Card className="group overflow-hidden border-none shadow-sm hover:shadow-md transition-all p-0">
            <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                {businessImage ? (
                    <img
                        src={businessImage}
                        alt={coupon.business?.name ?? coupon.title}
                        className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex size-full items-center justify-center">
                        <Store className="size-10 text-muted-foreground" />
                    </div>
                )}
                <div className="absolute top-2 left-2">
                    <Badge className="bg-primary text-primary-foreground font-black text-sm">{coupon.discount_display}</Badge>
                </div>
                {coupon.business?.is_verified && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-xs font-medium text-primary backdrop-blur-sm">
                        <BadgeCheck className="size-3.5" />
                        Verified
                    </div>
                )}
            </div>
            <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                    <Link href={couponUrl} className="flex-1">
                        <CardTitle className="line-clamp-2 font-display font-black tracking-tight text-base transition-colors group-hover:text-primary">{coupon.title}</CardTitle>
                    </Link>
                    <CouponSaveButton couponId={coupon.id} isSaved={coupon.is_saved ?? false} savesCount={coupon.saves_count ?? 0} size="sm" />
                </div>
                {coupon.business && (
                    <p className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Store className="size-3" />
                        {coupon.business.name}
                    </p>
                )}
            </CardHeader>
            <CardContent className="space-y-2 pb-4">
                {coupon.code && <CouponCodeDisplay code={coupon.code} size="sm" />}
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    {coupon.regions && coupon.regions.length > 0 && (
                        <span className="flex items-center gap-1">
                            <MapPin className="size-3.5 text-primary" />
                            {coupon.regions[0].name}
                        </span>
                    )}
                    {coupon.valid_until && (
                        <span className={`flex items-center gap-1 ${isExpiringSoon ? "text-orange-500" : ""} ${isExpired ? "text-red-500" : ""}`}>
                            <Calendar className="size-3.5 text-primary" />
                            {isExpired ? "Expired" : new Date(coupon.valid_until).toLocaleDateString()}
                        </span>
                    )}
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                    <CouponVoteButtons
                        couponId={coupon.id}
                        score={coupon.score ?? 0}
                        upvotesCount={coupon.upvotes_count ?? 0}
                        downvotesCount={coupon.downvotes_count ?? 0}
                        userVote={coupon.user_vote}
                        size="sm"
                    />
                </div>
            </CardContent>
        </Card>
    );
}
