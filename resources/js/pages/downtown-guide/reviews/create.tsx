import { Head, Link, router, useForm } from "@inertiajs/react";
import { ArrowLeft, Star } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface DowntownGuideReviewsCreateProps {
    business: {
        id: string;
        name: string;
        slug?: string;
    };
}

export default function DowntownGuideReviewsCreate({ business }: DowntownGuideReviewsCreateProps) {
    const [hoveredStar, setHoveredStar] = useState(0);
    const { data, setData, post, processing, errors } = useForm({
        title: "",
        content: "",
        rating: 5,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("downtown-guide.reviews.store", business.slug), {
            preserveScroll: true,
            onSuccess: () => {
                router.visit(route("downtown-guide.businesses.show", business.slug));
            },
        });
    };

    return (
        <>
            <Head title={`Write a Review for ${business.name} - DowntownsGuide`} />

            <div className="min-h-screen bg-background">
                <main className="container mx-auto px-4 py-8">
                    {/* Back link */}
                    <Link
                        href={route("downtown-guide.businesses.show", business.slug)}
                        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <ArrowLeft className="size-4" />
                        Back to {business.name}
                    </Link>

                    <div className="mx-auto max-w-2xl">
                        <Card>
                            <CardHeader>
                                <CardTitle className="font-display text-2xl font-black tracking-tight">
                                    Write a Review for {business.name}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Star Rating */}
                                    <div>
                                        <Label className="mb-2 block">Your Rating *</Label>
                                        <div className="flex items-center gap-1">
                                            {[1, 2, 3, 4, 5].map((rating) => (
                                                <button
                                                    key={rating}
                                                    type="button"
                                                    onClick={() => setData("rating", rating)}
                                                    onMouseEnter={() => setHoveredStar(rating)}
                                                    onMouseLeave={() => setHoveredStar(0)}
                                                    className="p-0.5 transition-transform hover:scale-110 focus:outline-none"
                                                >
                                                    <Star
                                                        className={cn(
                                                            "size-8 transition-colors",
                                                            rating <= (hoveredStar || data.rating)
                                                                ? "fill-accent text-accent"
                                                                : "fill-muted text-muted-foreground",
                                                        )}
                                                    />
                                                </button>
                                            ))}
                                            {data.rating > 0 && (
                                                <span className="ml-2 text-sm text-muted-foreground">
                                                    {data.rating} {data.rating === 1 ? "star" : "stars"}
                                                </span>
                                            )}
                                        </div>
                                        {errors.rating && <p className="mt-1 text-sm text-destructive">{errors.rating}</p>}
                                    </div>

                                    {/* Title */}
                                    <div>
                                        <Label htmlFor="title">Title (optional)</Label>
                                        <Input
                                            id="title"
                                            value={data.title}
                                            onChange={(e) => setData("title", e.target.value)}
                                            placeholder="Summarize your experience"
                                            className="mt-1"
                                        />
                                        {errors.title && <p className="mt-1 text-sm text-destructive">{errors.title}</p>}
                                    </div>

                                    {/* Content */}
                                    <div>
                                        <Label htmlFor="content">Your Review *</Label>
                                        <Textarea
                                            id="content"
                                            value={data.content}
                                            onChange={(e) => setData("content", e.target.value)}
                                            placeholder="Share your experience with this place..."
                                            rows={6}
                                            className="mt-1"
                                            required
                                        />
                                        {errors.content && <p className="mt-1 text-sm text-destructive">{errors.content}</p>}
                                        <p className="mt-1 text-xs text-muted-foreground">Minimum 10 characters</p>
                                    </div>

                                    {/* Submit */}
                                    <div className="flex items-center justify-end gap-4">
                                        <Link
                                            href={route("downtown-guide.businesses.show", business.slug)}
                                            className="text-muted-foreground hover:text-foreground"
                                        >
                                            Cancel
                                        </Link>
                                        <Button type="submit" disabled={processing || data.rating === 0}>
                                            {processing ? "Submitting..." : "Submit Review"}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </>
    );
}
