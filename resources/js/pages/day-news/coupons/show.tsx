import { SEO } from "@/components/common/seo";
import { CouponBusinessSidebar } from "@/components/day-news/coupon-business-sidebar";
import { CouponCard } from "@/components/day-news/coupon-card";
import { CouponCodeDisplay } from "@/components/day-news/coupon-code-display";
import { CouponCommentSection } from "@/components/day-news/coupon-comment-section";
import { CouponSaveButton } from "@/components/day-news/coupon-save-button";
import { CouponVoteButtons } from "@/components/day-news/coupon-vote-buttons";
import DayNewsHeader from "@/components/day-news/day-news-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LocationProvider } from "@/contexts/location-context";
import type { Auth } from "@/types";
import type { CouponShowPageProps } from "@/types/coupon";
import { Link, router } from "@inertiajs/react";
import dayjs from "dayjs";
import { ArrowLeft, BadgeCheck, Calendar, Edit, Eye, MapPin, Store, Tag, Trash2 } from "lucide-react";
import { route } from "ziggy-js";

interface Props extends CouponShowPageProps {
    auth?: Auth;
}

export default function CouponShow({ auth, coupon, relatedCoupons }: Props) {
    const isExpired = coupon.valid_until && new Date(coupon.valid_until) < new Date();
    const isOwner = auth?.user?.id === coupon.user?.id;

    const handleDelete = () => {
        if (!confirm("Are you sure you want to delete this coupon?")) return;
        router.delete(route("daynews.coupons.destroy", { coupon: coupon.id }));
    };

    const formatCategory = (category: string): string => {
        return category
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    };

    return (
        <LocationProvider>
            <div className="min-h-screen bg-background">
                <SEO
                    type="article"
                    site="day-news"
                    data={{
                        title: `${coupon.title} - ${coupon.discount_display}`,
                        description: coupon.description || `Get ${coupon.discount_display} at ${coupon.business.name}`,
                        url: `/coupons/${coupon.slug}`,
                        image: coupon.image || coupon.business.images?.[0],
                    }}
                />
                <DayNewsHeader auth={auth} />

                <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    {/* Back link */}
                    <div className="mb-6">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={route("daynews.coupons.index")}>
                                <ArrowLeft className="mr-2 size-4" />
                                Back to Coupons
                            </Link>
                        </Button>
                    </div>

                    <div className="grid gap-8 lg:grid-cols-3">
                        {/* Main content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Coupon header */}
                            <Card>
                                <CardHeader className="space-y-4">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Badge className="text-lg px-3 py-1">{coupon.discount_display}</Badge>
                                        {coupon.is_verified && (
                                            <Badge variant="secondary" className="gap-1">
                                                <BadgeCheck className="size-4" />
                                                Verified
                                            </Badge>
                                        )}
                                        {isExpired && <Badge variant="destructive">Expired</Badge>}
                                        <Badge variant="outline" className="gap-1">
                                            <Tag className="size-3" />
                                            {formatCategory(coupon.category)}
                                        </Badge>
                                    </div>

                                    <CardTitle className="text-2xl sm:text-3xl">{coupon.title}</CardTitle>

                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Store className="size-4" />
                                        <span className="font-medium">{coupon.business.name}</span>
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-6">
                                    {/* Coupon code */}
                                    {coupon.code && (
                                        <div>
                                            <h3 className="mb-2 text-sm font-semibold text-muted-foreground">Coupon Code</h3>
                                            <CouponCodeDisplay code={coupon.code} size="lg" />
                                        </div>
                                    )}

                                    {/* Validity dates */}
                                    <div className="flex flex-wrap gap-4 text-sm">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="size-4 text-muted-foreground" />
                                            <span>Valid from {dayjs(coupon.valid_from).format("MMM D, YYYY")}</span>
                                        </div>
                                        {coupon.valid_until && (
                                            <div className={`flex items-center gap-2 ${isExpired ? "text-red-500" : ""}`}>
                                                <Calendar className="size-4" />
                                                <span>
                                                    {isExpired ? "Expired" : "Valid until"} {dayjs(coupon.valid_until).format("MMM D, YYYY")}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Regions */}
                                    {coupon.regions.length > 0 && (
                                        <div className="flex flex-wrap items-center gap-2">
                                            <MapPin className="size-4 text-muted-foreground" />
                                            {coupon.regions.map((region) => (
                                                <Badge key={region.id} variant="secondary">
                                                    {region.name}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}

                                    <Separator />

                                    {/* Vote and save buttons */}
                                    <div className="flex flex-wrap items-center justify-between gap-4">
                                        <CouponVoteButtons
                                            couponId={coupon.id}
                                            score={coupon.score}
                                            upvotesCount={coupon.upvotes_count}
                                            downvotesCount={coupon.downvotes_count}
                                            userVote={coupon.user_vote}
                                        />
                                        <div className="flex items-center gap-2">
                                            <CouponSaveButton
                                                couponId={coupon.id}
                                                isSaved={coupon.is_saved}
                                                savesCount={coupon.saves_count}
                                                showCount
                                            />
                                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                <Eye className="size-4" />
                                                {coupon.view_count} views
                                            </div>
                                        </div>
                                    </div>

                                    {/* Owner actions */}
                                    {isOwner && (
                                        <>
                                            <Separator />
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={route("daynews.coupons.edit", { coupon: coupon.id })}>
                                                        <Edit className="mr-2 size-4" />
                                                        Edit
                                                    </Link>
                                                </Button>
                                                <Button variant="destructive" size="sm" onClick={handleDelete}>
                                                    <Trash2 className="mr-2 size-4" />
                                                    Delete
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Description */}
                            {coupon.description && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">About This Offer</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="whitespace-pre-wrap text-muted-foreground">{coupon.description}</p>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Terms and conditions */}
                            {coupon.terms_conditions && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Terms & Conditions</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="whitespace-pre-wrap text-sm text-muted-foreground">{coupon.terms_conditions}</p>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Submitter info */}
                            <Card>
                                <CardContent className="py-4">
                                    <p className="text-sm text-muted-foreground">
                                        Submitted by <span className="font-medium text-foreground">{coupon.user?.name}</span> &middot;{" "}
                                        {dayjs(coupon.created_at).fromNow()}
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Comments */}
                            <CouponCommentSection couponId={coupon.id} comments={coupon.comments ?? []} auth={auth} />
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Business info */}
                            <CouponBusinessSidebar business={coupon.business} />

                            {/* Related coupons */}
                            {relatedCoupons.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">More Deals</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {relatedCoupons.map((related) => (
                                            <Link key={related.id} href={route("daynews.coupons.show", { slug: related.slug })} className="block">
                                                <div className="group flex gap-3 rounded-lg p-2 transition-colors hover:bg-muted">
                                                    <div className="size-12 flex-shrink-0 overflow-hidden rounded bg-muted">
                                                        {related.business.images?.[0] ? (
                                                            <img
                                                                src={related.business.images[0]}
                                                                alt={related.business.name}
                                                                className="size-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex size-full items-center justify-center">
                                                                <Store className="size-4 text-muted-foreground" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="line-clamp-1 font-medium text-sm group-hover:text-primary">{related.title}</p>
                                                        <p className="text-xs text-muted-foreground">{related.business.name}</p>
                                                        <Badge variant="secondary" className="mt-1 text-xs">
                                                            {related.discount_display}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </LocationProvider>
    );
}
