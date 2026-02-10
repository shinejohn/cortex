import { SEO } from "@/components/common/seo";
import { ClassifiedContactModal } from "@/components/day-news/classified-contact-modal";
import { ClassifiedImageGallery } from "@/components/day-news/classified-image-gallery";
import { ClassifiedSaveButton } from "@/components/day-news/classified-save-button";
import DayNewsHeader from "@/components/day-news/day-news-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LocationProvider } from "@/contexts/location-context";
import type { Auth } from "@/types";
import type { ClassifiedShowPageProps, SimilarClassified } from "@/types/classified";
import { Link, router, useForm } from "@inertiajs/react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import React from "react";
import {
    AlertTriangle,
    ArrowLeft,
    Calendar,
    CheckCircle,
    Clock,
    Edit,
    Eye,
    Flag,
    Heart,
    MapPin,
    MessageCircle,
    Package,
    Share2,
    Shield,
    Sparkles,
    Star,
    Tag,
    Trash2,
    Undo2,
    User,
} from "lucide-react";
import { route } from "ziggy-js";

dayjs.extend(relativeTime);

interface Props extends ClassifiedShowPageProps {
    auth?: Auth;
}

const conditionIcons: Record<string, React.ReactNode> = {
    new: <Sparkles className="size-3" />,
    like_new: <CheckCircle className="size-3" />,
    good: <CheckCircle className="size-3" />,
    fair: <Clock className="size-3" />,
    for_parts: <AlertTriangle className="size-3" />,
};

export default function ClassifiedShow({ auth, classified, contact, canViewContact, similarClassifieds }: Props) {
    const isOwner = classified.is_owner;
    const isSold = classified.status === "sold";
    const [showReportModal, setShowReportModal] = React.useState(false);
    const [reportSubmitted, setReportSubmitted] = React.useState(false);

    const reportForm = useForm({
        reason: "",
        description: "",
    });

    const handleReport = (e: React.FormEvent) => {
        e.preventDefault();
        reportForm.post(route("daynews.classifieds.report", { classified: classified.id }), {
            preserveScroll: true,
            onSuccess: () => {
                setShowReportModal(false);
                setReportSubmitted(true);
            },
        });
    };

    const handleDelete = () => {
        if (!confirm("Are you sure you want to delete this listing?")) return;
        router.delete(route("daynews.classifieds.destroy", { classified: classified.id }));
    };

    const handleMarkSold = () => {
        if (!confirm("Mark this item as sold?")) return;
        router.post(route("daynews.classifieds.sold", { classified: classified.id }));
    };

    const handleReactivate = () => {
        router.post(route("daynews.classifieds.reactivate", { classified: classified.id }));
    };

    return (
        <LocationProvider>
            <div className="min-h-screen bg-gray-50">
                <SEO
                    type="article"
                    site="day-news"
                    data={{
                        title: classified.title,
                        description:
                            classified.description.substring(0, 160) ||
                            `${classified.price_display} - ${classified.category.name}`,
                        url: `/classifieds/${classified.slug}`,
                        image: classified.images[0]?.url,
                    }}
                />
                <DayNewsHeader auth={auth} />

                <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
                    {/* Back link */}
                    <div className="mb-6">
                        <Button variant="ghost" size="sm" asChild className="text-indigo-600 hover:text-indigo-700">
                            <Link href={route("daynews.classifieds.index")}>
                                <ArrowLeft className="mr-2 size-4" />
                                Back to Classifieds
                            </Link>
                        </Button>
                    </div>

                    <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
                        {/* Main content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Image gallery */}
                            {classified.images.length > 0 && (
                                <div className="overflow-hidden rounded-lg bg-white shadow-sm">
                                    <ClassifiedImageGallery images={classified.images} title={classified.title} />
                                </div>
                            )}

                            {/* Header info */}
                            <div className="overflow-hidden rounded-lg border-none bg-white shadow-sm">
                                <div className="p-6 space-y-4">
                                    {/* Category breadcrumb */}
                                    <div className="flex items-center text-sm text-gray-500">
                                        <Tag className="mr-2 size-4 text-gray-400" />
                                        <span>{classified.category.name}</span>
                                    </div>

                                    {/* Title */}
                                    <h1 className="font-display text-2xl font-black tracking-tight text-gray-900 sm:text-3xl">
                                        {classified.title}
                                    </h1>

                                    {/* Price and badges */}
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-2xl font-bold text-indigo-600">{classified.price_display}</span>
                                        {classified.condition_display && (
                                            <Badge variant="secondary" className="gap-1">
                                                {conditionIcons[classified.condition ?? "good"]}
                                                {classified.condition_display}
                                            </Badge>
                                        )}
                                        {isSold && <Badge variant="destructive">Sold</Badge>}
                                    </div>

                                    {/* Meta info row */}
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                        {classified.regions.length > 0 && (
                                            <div className="flex items-center gap-1">
                                                <MapPin className="size-4 text-gray-400" />
                                                {classified.regions.map((region) => region.name).join(", ")}
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1">
                                            <Calendar className="size-4 text-gray-400" />
                                            <span>Posted {dayjs(classified.created_at).fromNow()}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Eye className="size-4 text-gray-400" />
                                            <span>{classified.view_count} views</span>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                <div className="p-6 space-y-6">
                                    {/* Save and contact actions */}
                                    <div className="flex flex-wrap items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <ClassifiedSaveButton
                                                classifiedId={classified.id}
                                                isSaved={classified.is_saved}
                                                savesCount={classified.saves_count}
                                                showCount
                                            />
                                            {!isOwner && auth?.user && !reportSubmitted && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-gray-500 hover:text-red-600"
                                                    onClick={() => setShowReportModal(true)}
                                                >
                                                    <Flag className="mr-1 size-4" />
                                                    Report
                                                </Button>
                                            )}
                                            {reportSubmitted && (
                                                <span className="flex items-center gap-1 text-sm text-green-600">
                                                    <CheckCircle className="size-4" />
                                                    Reported
                                                </span>
                                            )}
                                        </div>

                                        {/* Report Modal */}
                                        {showReportModal && (
                                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowReportModal(false)}>
                                                <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
                                                    <h3 className="mb-4 font-display text-lg font-black tracking-tight text-gray-900">
                                                        Report This Listing
                                                    </h3>
                                                    <form onSubmit={handleReport} className="space-y-4">
                                                        <div>
                                                            <label className="mb-1 block text-sm font-medium text-gray-700">Reason</label>
                                                            <select
                                                                value={reportForm.data.reason}
                                                                onChange={(e) => reportForm.setData("reason", e.target.value)}
                                                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                                required
                                                            >
                                                                <option value="">Select a reason...</option>
                                                                <option value="spam">Spam or misleading</option>
                                                                <option value="inappropriate">Inappropriate content</option>
                                                                <option value="scam">Suspected scam</option>
                                                                <option value="duplicate">Duplicate listing</option>
                                                                <option value="other">Other</option>
                                                            </select>
                                                            {reportForm.errors.reason && (
                                                                <p className="mt-1 text-sm text-red-600">{reportForm.errors.reason}</p>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                                                Additional details (optional)
                                                            </label>
                                                            <textarea
                                                                value={reportForm.data.description}
                                                                onChange={(e) => reportForm.setData("description", e.target.value)}
                                                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                                rows={3}
                                                                placeholder="Tell us more about the issue..."
                                                            />
                                                        </div>
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => setShowReportModal(false)}
                                                            >
                                                                Cancel
                                                            </Button>
                                                            <Button
                                                                type="submit"
                                                                size="sm"
                                                                className="bg-red-600 hover:bg-red-700"
                                                                disabled={reportForm.processing || !reportForm.data.reason}
                                                            >
                                                                {reportForm.processing ? "Submitting..." : "Submit Report"}
                                                            </Button>
                                                        </div>
                                                    </form>
                                                </div>
                                            </div>
                                        )}

                                        {/* Contact button (mobile) */}
                                        {!isOwner && !isSold && (
                                            <ClassifiedContactModal
                                                contact={contact}
                                                canViewContact={canViewContact}
                                                sellerName={classified.user.name}
                                            />
                                        )}
                                    </div>

                                    {/* Owner actions */}
                                    {isOwner && (
                                        <>
                                            <Separator />
                                            <div className="flex flex-wrap gap-2">
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link
                                                        href={route("daynews.classifieds.edit", {
                                                            classified: classified.id,
                                                        })}
                                                    >
                                                        <Edit className="mr-2 size-4" />
                                                        Edit
                                                    </Link>
                                                </Button>
                                                {!isSold ? (
                                                    <Button variant="secondary" size="sm" onClick={handleMarkSold}>
                                                        <CheckCircle className="mr-2 size-4" />
                                                        Mark as Sold
                                                    </Button>
                                                ) : (
                                                    <Button variant="secondary" size="sm" onClick={handleReactivate}>
                                                        <Undo2 className="mr-2 size-4" />
                                                        Reactivate
                                                    </Button>
                                                )}
                                                <Button variant="destructive" size="sm" onClick={handleDelete}>
                                                    <Trash2 className="mr-2 size-4" />
                                                    Delete
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Specifications */}
                            {classified.specifications.length > 0 && (
                                <div className="overflow-hidden rounded-lg border-none bg-white shadow-sm p-6">
                                    <h2 className="mb-3 text-lg font-bold text-gray-900">Specifications</h2>
                                    <div className="grid grid-cols-1 gap-4 rounded-lg bg-gray-50 p-4 md:grid-cols-2 lg:grid-cols-3">
                                        {classified.specifications.map((spec, index) => (
                                            <div key={index} className="flex items-start">
                                                <div className="w-1/2 text-sm capitalize text-gray-600">{spec.name}:</div>
                                                <div className="w-1/2 text-sm font-medium text-gray-900">{spec.value}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Description */}
                            <div className="overflow-hidden rounded-lg border-none bg-white shadow-sm p-6">
                                <h2 className="mb-3 text-lg font-bold text-gray-900">Description</h2>
                                <div className="whitespace-pre-line text-gray-700">{classified.description}</div>
                            </div>

                            {/* Custom attributes */}
                            {classified.custom_attributes.length > 0 && (
                                <div className="overflow-hidden rounded-lg border-none bg-white shadow-sm p-6">
                                    <h2 className="mb-3 text-lg font-bold text-gray-900">Additional Details</h2>
                                    <dl className="grid gap-3 sm:grid-cols-2">
                                        {classified.custom_attributes.map((attr, index) => (
                                            <div key={index} className="flex justify-between border-b border-gray-100 pb-2">
                                                <dt className="text-gray-600">{attr.key}</dt>
                                                <dd className="font-medium text-gray-900">{attr.value}</dd>
                                            </div>
                                        ))}
                                    </dl>
                                </div>
                            )}

                            {/* Seller info */}
                            <div className="overflow-hidden rounded-lg border-none bg-white shadow-sm p-6">
                                <div className="border-t border-gray-200 pt-6">
                                    <h2 className="mb-4 text-lg font-bold text-gray-900">Seller Information</h2>
                                    <div className="flex items-center gap-4">
                                        <div className="flex size-16 items-center justify-center rounded-full bg-gray-100 text-xl font-bold text-gray-700">
                                            {classified.user.name.substring(0, 2)}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-lg font-bold text-gray-900">{classified.user.name}</h3>
                                                {(classified.user as any).is_verified && (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                                                        <Shield className="size-3" />
                                                        Verified
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600">
                                                Member since {dayjs(classified.user.created_at).format("YYYY")}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Safety tips */}
                            <div className="overflow-hidden rounded-lg border border-amber-100 bg-amber-50 p-6">
                                <div className="flex items-start gap-3">
                                    <Shield className="mt-0.5 size-5 text-amber-600" />
                                    <div>
                                        <h3 className="mb-2 font-bold text-amber-900">Safety Tips</h3>
                                        <ul className="space-y-1 text-sm text-amber-800">
                                            <li>Meet in a public place for exchanges</li>
                                            <li>Never send payment in advance</li>
                                            <li>Inspect the item before purchasing</li>
                                            <li>Trust your instincts — if it seems too good to be true, it probably is</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Contact card (desktop) */}
                            {!isOwner && !isSold && (
                                <div className="hidden overflow-hidden rounded-lg border-none bg-white shadow-sm lg:block">
                                    <div className="p-6">
                                        <h2 className="mb-4 text-lg font-bold text-gray-900">Contact Seller</h2>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex size-12 items-center justify-center rounded-full bg-gray-100">
                                                    <User className="size-5 text-gray-500" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{classified.user.name}</p>
                                                    <p className="text-xs text-gray-500">
                                                        Member since {dayjs(classified.user.created_at).format("MMM YYYY")}
                                                    </p>
                                                </div>
                                            </div>
                                            <ClassifiedContactModal
                                                contact={contact}
                                                canViewContact={canViewContact}
                                                sellerName={classified.user.name}
                                                fullWidth
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Similar listings */}
                            {similarClassifieds.length > 0 && (
                                <div className="overflow-hidden rounded-lg border-none bg-white shadow-sm">
                                    <div className="p-6">
                                        <h2 className="mb-4 text-lg font-bold text-gray-900">Similar Listings</h2>
                                        <div className="space-y-4">
                                            {similarClassifieds.map((similar) => (
                                                <SimilarListingCard key={similar.id} classified={similar} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Disclaimer */}
                    <div className="mt-8 text-center text-xs text-gray-500">
                        Day News is not responsible for the content of classified listings. Please use caution when
                        responding to any classified advertisement and never send money in advance.
                    </div>
                </main>
            </div>
        </LocationProvider>
    );
}

function SimilarListingCard({ classified }: { classified: SimilarClassified }) {
    return (
        <Link href={route("daynews.classifieds.show", { slug: classified.slug })} className="block">
            <div className="group flex gap-3 overflow-hidden rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md">
                <div className="size-20 flex-shrink-0 overflow-hidden rounded-md bg-gray-200">
                    {classified.primary_image ? (
                        <img
                            src={classified.primary_image}
                            alt={classified.title}
                            className="size-full object-cover"
                        />
                    ) : (
                        <div className="flex size-full items-center justify-center">
                            <Package className="size-6 text-gray-400" />
                        </div>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="line-clamp-2 text-sm font-bold text-gray-900 group-hover:text-indigo-600">
                        {classified.title}
                    </h3>
                    <div className="mt-1 text-lg font-bold text-indigo-600">
                        {classified.price_display}
                    </div>
                </div>
            </div>
        </Link>
    );
}
