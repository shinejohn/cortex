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
import { Link, router } from "@inertiajs/react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
    AlertTriangle,
    ArrowLeft,
    CheckCircle,
    Clock,
    Edit,
    Eye,
    MapPin,
    Package,
    Sparkles,
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
            <div className="min-h-screen bg-background">
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

                <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    {/* Back link */}
                    <div className="mb-6">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={route("daynews.classifieds.index")}>
                                <ArrowLeft className="mr-2 size-4" />
                                Back to Classifieds
                            </Link>
                        </Button>
                    </div>

                    <div className="grid gap-8 lg:grid-cols-3">
                        {/* Main content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Image gallery */}
                            {classified.images.length > 0 && (
                                <ClassifiedImageGallery images={classified.images} title={classified.title} />
                            )}

                            {/* Header info */}
                            <Card>
                                <CardHeader className="space-y-4">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Badge className="text-lg px-3 py-1">{classified.price_display}</Badge>
                                        {classified.condition_display && (
                                            <Badge variant="secondary" className="gap-1">
                                                {conditionIcons[classified.condition ?? "good"]}
                                                {classified.condition_display}
                                            </Badge>
                                        )}
                                        {isSold && <Badge variant="destructive">Sold</Badge>}
                                        <Badge variant="outline" className="gap-1">
                                            <Tag className="size-3" />
                                            {classified.category.name}
                                        </Badge>
                                    </div>

                                    <CardTitle className="text-2xl sm:text-3xl">{classified.title}</CardTitle>
                                </CardHeader>

                                <CardContent className="space-y-6">
                                    {/* Regions */}
                                    {classified.regions.length > 0 && (
                                        <div className="flex flex-wrap items-center gap-2">
                                            <MapPin className="size-4 text-muted-foreground" />
                                            {classified.regions.map((region) => (
                                                <Badge key={region.id} variant="secondary">
                                                    {region.name}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}

                                    <Separator />

                                    {/* Save and stats */}
                                    <div className="flex flex-wrap items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <ClassifiedSaveButton
                                                classifiedId={classified.id}
                                                isSaved={classified.is_saved}
                                                savesCount={classified.saves_count}
                                                showCount
                                            />
                                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                <Eye className="size-4" />
                                                {classified.view_count} views
                                            </div>
                                        </div>

                                        {/* Contact button */}
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
                                </CardContent>
                            </Card>

                            {/* Description */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Description</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="whitespace-pre-wrap text-muted-foreground">{classified.description}</p>
                                </CardContent>
                            </Card>

                            {/* Specifications */}
                            {classified.specifications.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Specifications</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <dl className="grid gap-3 sm:grid-cols-2">
                                            {classified.specifications.map((spec, index) => (
                                                <div key={index} className="flex justify-between border-b pb-2">
                                                    <dt className="text-muted-foreground">{spec.name}</dt>
                                                    <dd className="font-medium">{spec.value}</dd>
                                                </div>
                                            ))}
                                        </dl>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Custom attributes */}
                            {classified.custom_attributes.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Additional Details</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <dl className="grid gap-3 sm:grid-cols-2">
                                            {classified.custom_attributes.map((attr, index) => (
                                                <div key={index} className="flex justify-between border-b pb-2">
                                                    <dt className="text-muted-foreground">{attr.key}</dt>
                                                    <dd className="font-medium">{attr.value}</dd>
                                                </div>
                                            ))}
                                        </dl>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Seller info */}
                            <Card>
                                <CardContent className="py-4">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <User className="size-4" />
                                        <span>
                                            Posted by{" "}
                                            <span className="font-medium text-foreground">{classified.user.name}</span>
                                        </span>
                                        <span>&middot;</span>
                                        <span>{dayjs(classified.created_at).fromNow()}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Contact card (desktop) */}
                            {!isOwner && !isSold && (
                                <Card className="hidden lg:block">
                                    <CardHeader>
                                        <CardTitle className="text-lg">Contact Seller</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                                                    <User className="size-5 text-muted-foreground" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">{classified.user.name}</p>
                                                    <p className="text-xs text-muted-foreground">
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
                                    </CardContent>
                                </Card>
                            )}

                            {/* Similar listings */}
                            {similarClassifieds.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Similar Listings</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {similarClassifieds.map((similar) => (
                                            <SimilarListingCard key={similar.id} classified={similar} />
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

function SimilarListingCard({ classified }: { classified: SimilarClassified }) {
    return (
        <Link href={route("daynews.classifieds.show", { slug: classified.slug })} className="block">
            <div className="group flex gap-3 rounded-lg p-2 transition-colors hover:bg-muted">
                <div className="size-16 flex-shrink-0 overflow-hidden rounded bg-muted">
                    {classified.primary_image ? (
                        <img
                            src={classified.primary_image}
                            alt={classified.title}
                            className="size-full object-cover"
                        />
                    ) : (
                        <div className="flex size-full items-center justify-center">
                            <Package className="size-6 text-muted-foreground" />
                        </div>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="line-clamp-2 text-sm font-medium group-hover:text-primary">{classified.title}</p>
                    <Badge variant="secondary" className="mt-1 text-xs">
                        {classified.price_display}
                    </Badge>
                </div>
            </div>
        </Link>
    );
}
