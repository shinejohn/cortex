import { Head, router, usePage } from "@inertiajs/react";
import { DollarSign, Eye, MapPin } from "lucide-react";
import { SEO } from "@/components/common/seo";
import DayNewsHeader from "@/components/day-news/day-news-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LocationProvider } from "@/contexts/location-context";
import type { Auth } from "@/types";

interface ClassifiedImage {
    id: number;
    image_path: string;
    image_url: string;
    order: number;
}

interface Classified {
    id: string;
    category: string;
    subcategory: string | null;
    title: string;
    description: string;
    price: number | null;
    price_type: string;
    condition: string | null;
    location: string;
    is_featured: boolean;
    posted_at: string;
    expires_at: string | null;
    views_count: number;
    images: ClassifiedImage[];
    user: {
        id: string;
        name: string;
        email?: string;
    };
    regions: Array<{
        id: string;
        name: string;
    }>;
}

interface ShowClassifiedProps {
    auth?: Auth;
    classified: Classified;
    related: Classified[];
}

export default function ShowClassified() {
    const { auth, classified, related } = usePage<ShowClassifiedProps>().props;

    const formatPrice = (price: number | null, priceType: string) => {
        if (!price && priceType === "contact_for_pricing") return "Contact for pricing";
        if (!price) return "Free";
        return `$${price.toLocaleString()}`;
    };

    return (
        <LocationProvider>
            <div className="min-h-screen bg-background">
                <Head title={`${classified.title} - Day News`} />
                <SEO
                    type="article"
                    site="day-news"
                    data={{
                        title: classified.title,
                        description: classified.description.substring(0, 160),
                        url: `/classifieds/${classified.id}`,
                    }}
                />
                <DayNewsHeader auth={auth} />

                <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                    {/* Images Gallery */}
                    {classified.images.length > 0 && (
                        <div className="mb-6">
                            {classified.images.length === 1 ? (
                                <img src={classified.images[0].image_url} alt={classified.title} className="h-96 w-full rounded-lg object-cover" />
                            ) : (
                                <div className="grid grid-cols-2 gap-4">
                                    <img
                                        src={classified.images[0].image_url}
                                        alt={classified.title}
                                        className="col-span-2 h-96 rounded-lg object-cover"
                                    />
                                    {classified.images.slice(1).map((img) => (
                                        <img
                                            key={img.id}
                                            src={img.image_url}
                                            alt={`${classified.title} ${img.order}`}
                                            className="h-48 rounded-lg object-cover"
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Header */}
                    <div className="mb-6">
                        {classified.is_featured && (
                            <Badge variant="destructive" className="mb-2">
                                Featured
                            </Badge>
                        )}
                        <Badge variant="outline" className="mb-2 capitalize">
                            {classified.category.replace("_", " ")}
                        </Badge>
                        {classified.subcategory && (
                            <Badge variant="outline" className="mb-2 capitalize">
                                {classified.subcategory.replace("_", " ")}
                            </Badge>
                        )}

                        <h1 className="mb-4 text-4xl font-bold">{classified.title}</h1>

                        <div className="mb-4 flex items-center gap-4 text-lg font-bold text-primary">
                            <DollarSign className="size-6" />
                            {formatPrice(classified.price, classified.price_type)}
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <MapPin className="size-4" />
                                {classified.location}
                            </div>
                            {classified.condition && (
                                <div>
                                    Condition: <span className="font-medium capitalize">{classified.condition}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-1">
                                <Eye className="size-4" />
                                {classified.views_count} views
                            </div>
                            <div>Posted {new Date(classified.posted_at).toLocaleDateString()}</div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="mb-8">
                        <h2 className="mb-4 text-2xl font-semibold">Description</h2>
                        <div className="prose prose-lg max-w-none dark:prose-invert">
                            <p className="whitespace-pre-wrap">{classified.description}</p>
                        </div>
                    </div>

                    {/* Contact/Seller Info */}
                    <div className="mb-8 rounded-lg border bg-card p-6">
                        <h3 className="mb-4 font-semibold">Seller Information</h3>
                        <p className="mb-4 text-muted-foreground">Posted by {classified.user.name}</p>
                        {classified.user.email ? (
                            <Button asChild>
                                <a href={`mailto:${classified.user.email}?subject=Inquiry about ${encodeURIComponent(classified.title)}`}>
                                    Contact Seller
                                </a>
                            </Button>
                        ) : (
                            <p className="text-sm text-muted-foreground">Contact information not available</p>
                        )}
                    </div>

                    {/* Related Classifieds */}
                    {related.length > 0 && (
                        <div>
                            <h2 className="mb-4 text-2xl font-bold">Similar Listings</h2>
                            <div className="grid gap-4 md:grid-cols-2">
                                {related.map((item) => (
                                    <div
                                        key={item.id}
                                        className="cursor-pointer rounded-lg border p-4 transition-shadow hover:shadow-md"
                                        onClick={() => router.visit(`/classifieds/${item.id}`)}
                                    >
                                        {item.images.length > 0 && (
                                            <img
                                                src={item.images[0].image_url}
                                                alt={item.title}
                                                className="mb-2 h-32 w-full rounded-lg object-cover"
                                            />
                                        )}
                                        <h3 className="mb-1 font-semibold">{item.title}</h3>
                                        <div className="text-sm font-bold text-primary">{formatPrice(item.price, item.price_type)}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </LocationProvider>
    );
}
