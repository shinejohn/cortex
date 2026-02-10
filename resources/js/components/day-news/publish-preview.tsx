import { useForm } from "@inertiajs/react";
import DOMPurify from "dompurify";
import { AlertCircle, CheckCircle2, DollarSign, MapPin } from "lucide-react";
import React, { useMemo } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface Region {
    id: number;
    name: string;
}

interface Post {
    id: number;
    type: string;
    category: string | null;
    title: string;
    excerpt: string | null;
    content: string;
    featured_image: string | null;
    metadata: {
        ad_days?: number;
        ad_placement?: string;
    };
    regions: Region[];
}

interface Pricing {
    is_free: boolean;
    cost: number;
    reason: string | null;
}

interface PublishPreviewProps {
    post: Post;
    pricing: Pricing;
}

export default function PublishPreview({ post, pricing }: PublishPreviewProps) {
    const { post: submitForm, processing } = useForm();

    const sanitizedContent = useMemo(() => {
        const sanitized = DOMPurify.sanitize(post.content, {
            ALLOWED_TAGS: ["p", "h2", "h3", "h4", "h5", "h6", "strong", "em", "a", "ul", "ol", "li", "blockquote", "br", "span"],
            ALLOWED_ATTR: ["href", "target", "rel", "class"],
        });
        return sanitized.replace(/^\s*<h1[^>]*>.*?<\/h1>\s*/i, "");
    }, [post.content]);

    const handlePublish = () => {
        submitForm(`/posts/${post.id}/publish`, {
            preserveScroll: true,
        });
    };

    return (
        <div className="space-y-6">
            {pricing.is_free ? (
                <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30">
                    <CheckCircle2 className="size-4 text-green-600" />
                    <AlertTitle className="font-display font-black tracking-tight">Free Publishing</AlertTitle>
                    <AlertDescription>{pricing.reason || "This post will be published for free."}</AlertDescription>
                </Alert>
            ) : (
                <Alert variant="default" className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
                    <DollarSign className="size-4 text-amber-600" />
                    <AlertTitle className="font-display font-black tracking-tight">Payment Required</AlertTitle>
                    <AlertDescription>
                        This post requires a payment of ${pricing.cost.toFixed(2)} to publish. You will be redirected to our secure
                        payment page.
                    </AlertDescription>
                </Alert>
            )}

            <Card className="overflow-hidden border-none shadow-sm">
                <CardHeader>
                    <CardTitle className="font-display font-black tracking-tight">Post Preview</CardTitle>
                    <CardDescription>Review your post before publishing</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <div className="mb-2 flex flex-wrap gap-2">
                            <Badge className="text-[10px] font-black uppercase tracking-widest">{post.type}</Badge>
                            {post.category && (
                                <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest">
                                    {post.category.replace("_", " ")}
                                </Badge>
                            )}
                        </div>
                    </div>

                    {post.featured_image && (
                        <div className="overflow-hidden rounded-lg">
                            <img src={post.featured_image} alt={post.title} className="w-full object-cover" />
                        </div>
                    )}

                    <div>
                        <h2 className="font-display text-2xl font-black tracking-tight">{post.title}</h2>
                        {post.excerpt && <p className="mt-2 text-muted-foreground">{post.excerpt}</p>}
                    </div>

                    <Separator />

                    <div className="prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: sanitizedContent }} />

                    <Separator />

                    <div>
                        <h3 className="mb-2 text-sm font-semibold">Regions</h3>
                        <div className="flex flex-wrap gap-2">
                            {post.regions.map((region) => (
                                <Badge key={region.id} variant="secondary">
                                    <MapPin className="mr-1 size-3" />
                                    {region.name}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    {post.type === "ad" && post.metadata.ad_days && (
                        <div>
                            <h3 className="mb-2 text-sm font-semibold">Advertisement Details</h3>
                            <div className="space-y-1 text-sm">
                                <p>Duration: {post.metadata.ad_days} days</p>
                                {post.metadata.ad_placement && <p>Placement: {post.metadata.ad_placement}</p>}
                                <p className="font-medium">Cost: ${(post.metadata.ad_days * 5).toFixed(2)}</p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {!pricing.is_free && (
                <Card className="overflow-hidden border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="font-display font-black tracking-tight">Payment Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Post Fee:</span>
                                <span>${post.type === "ad" ? "0.00" : "10.00"}</span>
                            </div>
                            {post.type === "ad" && post.metadata.ad_days && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">
                                        Ad Duration ({post.metadata.ad_days} day{post.metadata.ad_days > 1 ? "s" : ""} x $5):
                                    </span>
                                    <span>${(post.metadata.ad_days * 5).toFixed(2)}</span>
                                </div>
                            )}
                            <Separator />
                            <div className="flex justify-between text-lg font-black">
                                <span>Total:</span>
                                <span>${pricing.cost.toFixed(2)}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Alert>
                <AlertCircle className="size-4" />
                <AlertTitle className="font-display font-black tracking-tight">Important</AlertTitle>
                <AlertDescription>
                    Once published, you cannot edit your post. Please review carefully before proceeding.
                </AlertDescription>
            </Alert>

            <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => window.history.back()} disabled={processing}>
                    Back to Edit
                </Button>
                <Button onClick={handlePublish} disabled={processing}>
                    {processing ? "Publishing..." : pricing.is_free ? "Publish Now" : "Proceed to Payment"}
                </Button>
            </div>
        </div>
    );
}
