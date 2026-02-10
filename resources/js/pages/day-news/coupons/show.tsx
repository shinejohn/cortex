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
import { Separator } from "@/components/ui/separator";
import { LocationProvider } from "@/contexts/location-context";
import type { Auth } from "@/types";
import type { CouponShowPageProps } from "@/types/coupon";
import { Link, router } from "@inertiajs/react";
import dayjs from "dayjs";
import { AlertCircle, ArrowLeft, BadgeCheck, Calendar, Edit, ExternalLink, Eye, Info, MapPin, Store, Tag, Trash2 } from "lucide-react";
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
            <div className="min-h-screen bg-gray-50">
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

                {/* Hero Image Section */}
                {coupon.image && (
                    <div className="relative h-64 md:h-80">
                        <img
                            src={coupon.image}
                            alt={coupon.title}
                            className="size-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                        <div className="absolute inset-x-0 bottom-0 p-4 md:p-8">
                            <div className="container mx-auto">
                                <div className="mb-2 flex items-center">
                                    <span className="rounded bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
                                        {formatCategory(coupon.category).toUpperCase()}
                                    </span>
                                </div>
                                <h1 className="mb-2 font-display text-3xl font-black tracking-tight text-white md:text-4xl">
                                    {coupon.title}
                                </h1>
                                <div className="flex items-center text-white">
                                    <span className="text-lg">{coupon.business.name}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <main className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    {/* Back link */}
                    <div className="mb-6">
                        <Button variant="ghost" size="sm" asChild className="text-indigo-600 hover:text-indigo-700">
                            <Link href={route("daynews.coupons.index")}>
                                <ArrowLeft className="mr-2 size-4" />
                                Back to Coupons
                            </Link>
                        </Button>
                    </div>

                    <div className="grid gap-8 lg:grid-cols-3">
                        {/* Main content */}
                        <div className="space-y-6 lg:col-span-2">
                            {/* Coupon header card */}
                            <div className="overflow-hidden rounded-lg border-none bg-white shadow-sm">
                                <div className="p-6">
                                    <div className="mb-4 flex flex-wrap items-center gap-2">
                                        <span className="rounded-md bg-yellow-100 px-3 py-1 text-lg font-bold text-yellow-800">
                                            {coupon.discount_display}
                                        </span>
                                        {coupon.is_verified && (
                                            <Badge variant="secondary" className="gap-1 bg-green-100 text-green-800">
                                                <BadgeCheck className="size-4" />
                                                Verified
                                            </Badge>
                                        )}
                                        {isExpired && (
                                            <Badge variant="destructive">Expired</Badge>
                                        )}
                                        <Badge variant="outline" className="gap-1 border-gray-300">
                                            <Tag className="size-3" />
                                            {formatCategory(coupon.category)}
                                        </Badge>
                                    </div>

                                    {!coupon.image && (
                                        <h1 className="mb-4 font-display text-2xl font-black tracking-tight text-gray-900 sm:text-3xl">
                                            {coupon.title}
                                        </h1>
                                    )}

                                    <div className="mb-4 flex items-center gap-2 text-gray-600">
                                        <Store className="size-4" />
                                        <span className="font-medium">{coupon.business.name}</span>
                                    </div>

                                    {/* Coupon code */}
                                    {coupon.code && (
                                        <div className="mb-6">
                                            <h3 className="mb-2 text-sm font-semibold text-gray-500">Use this code at checkout:</h3>
                                            <CouponCodeDisplay code={coupon.code} size="lg" />
                                        </div>
                                    )}

                                    {/* Validity dates */}
                                    <div className="mb-4 flex flex-wrap gap-4 text-sm">
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Calendar className="size-4 text-gray-400" />
                                            <span>Valid from {dayjs(coupon.valid_from).format("MMM D, YYYY")}</span>
                                        </div>
                                        {coupon.valid_until && (
                                            <div className={`flex items-center gap-2 ${isExpired ? "text-red-500" : "text-gray-600"}`}>
                                                <Calendar className="size-4" />
                                                <span>
                                                    {isExpired ? "Expired" : "Valid until"} {dayjs(coupon.valid_until).format("MMM D, YYYY")}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Regions */}
                                    {coupon.regions.length > 0 && (
                                        <div className="mb-4 flex flex-wrap items-center gap-2">
                                            <MapPin className="size-4 text-gray-400" />
                                            {coupon.regions.map((region) => (
                                                <Badge key={region.id} variant="secondary" className="bg-gray-100 text-gray-700">
                                                    {region.name}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}

                                    <Separator className="my-4" />

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
                                            <div className="flex items-center gap-1 text-sm text-gray-500">
                                                <Eye className="size-4" />
                                                {coupon.view_count} views
                                            </div>
                                        </div>
                                    </div>

                                    {/* Owner actions */}
                                    {isOwner && (
                                        <>
                                            <Separator className="my-4" />
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm" asChild className="border-gray-300">
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
                                </div>
                            </div>

                            {/* Description */}
                            {coupon.description && (
                                <div className="overflow-hidden rounded-lg border-none bg-white shadow-sm">
                                    <div className="p-6">
                                        <h2 className="mb-3 text-lg font-bold text-gray-900">About This Offer</h2>
                                        <p className="whitespace-pre-wrap text-gray-600">{coupon.description}</p>
                                    </div>
                                </div>
                            )}

                            {/* Terms and conditions */}
                            {coupon.terms_conditions && (
                                <div className="overflow-hidden rounded-lg border-none bg-white shadow-sm">
                                    <div className="p-6">
                                        <h2 className="mb-3 text-lg font-bold text-gray-900">Terms & Conditions</h2>
                                        <p className="mb-4 whitespace-pre-wrap text-sm text-gray-600">{coupon.terms_conditions}</p>
                                        <div className="border-l-4 border-yellow-400 bg-yellow-50 p-4">
                                            <div className="flex">
                                                <Info className="mr-3 size-5 shrink-0 text-yellow-400" />
                                                <p className="text-sm text-yellow-700">
                                                    Present this coupon at time of purchase. Management reserves the right to modify or cancel this promotion at any time.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Submitter info */}
                            <div className="overflow-hidden rounded-lg border-none bg-white shadow-sm">
                                <div className="p-4">
                                    <p className="text-sm text-gray-500">
                                        Submitted by <span className="font-medium text-gray-900">{coupon.user?.name}</span> &middot;{" "}
                                        {dayjs(coupon.created_at).fromNow()}
                                    </p>
                                </div>
                            </div>

                            {/* Comments */}
                            <CouponCommentSection couponId={coupon.id} comments={coupon.comments ?? []} auth={auth} />

                            {/* Related coupons - inline section from spec */}
                            {relatedCoupons.length > 0 && (
                                <div className="overflow-hidden rounded-lg border-none bg-white shadow-sm">
                                    <div className="p-6">
                                        <h2 className="mb-4 text-lg font-bold text-gray-900">You May Also Like</h2>
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                            {relatedCoupons.map((related) => (
                                                <Link key={related.id} href={route("daynews.coupons.show", { slug: related.slug })} className="block">
                                                    <div className="group overflow-hidden rounded-lg border border-gray-200 transition-shadow hover:shadow-md">
                                                        <div className="p-4">
                                                            <div className="mb-3 flex items-center">
                                                                <div className="mr-2 size-10 overflow-hidden rounded-full bg-gray-100">
                                                                    {related.business.images?.[0] ? (
                                                                        <img
                                                                            src={related.business.images[0]}
                                                                            alt={related.business.name}
                                                                            className="size-full object-cover"
                                                                        />
                                                                    ) : (
                                                                        <div className="flex size-full items-center justify-center">
                                                                            <Store className="size-4 text-gray-400" />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <div className="text-sm font-medium text-gray-900">
                                                                        {related.business.name}
                                                                    </div>
                                                                    <div className="text-xs font-medium text-yellow-600">
                                                                        {related.discount_display}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <h3 className="mb-2 line-clamp-2 text-sm font-medium text-gray-900 group-hover:text-indigo-600">
                                                                {related.title}
                                                            </h3>
                                                            <div className="flex items-center text-xs text-indigo-600 font-medium">
                                                                View Coupon
                                                                <ExternalLink className="ml-1 size-3" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Business info */}
                            <CouponBusinessSidebar business={coupon.business} />

                            {/* Coupon Details Card from spec */}
                            <div className="overflow-hidden rounded-lg border-none bg-white shadow-sm">
                                <div className="p-6">
                                    <h2 className="mb-4 text-lg font-bold text-gray-900">Coupon Details</h2>
                                    <div className="space-y-4">
                                        <div className="flex items-start">
                                            <Tag className="mr-3 mt-0.5 size-5 shrink-0 text-gray-400" />
                                            <div>
                                                <div className="font-medium text-gray-900">Discount</div>
                                                <div className="text-sm text-gray-600">{coupon.discount_display}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-start">
                                            <Calendar className="mr-3 mt-0.5 size-5 shrink-0 text-gray-400" />
                                            <div>
                                                <div className="font-medium text-gray-900">Valid Period</div>
                                                <div className="text-sm text-gray-600">
                                                    {dayjs(coupon.valid_from).format("MMM D, YYYY")}
                                                    {coupon.valid_until && ` - ${dayjs(coupon.valid_until).format("MMM D, YYYY")}`}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Report section from spec */}
                            <div className="text-center">
                                <button className="mx-auto flex items-center justify-center text-gray-400 transition-colors hover:text-gray-600">
                                    <AlertCircle className="mr-1 size-4" />
                                    <span className="text-sm">Report this coupon</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </LocationProvider>
    );
}
