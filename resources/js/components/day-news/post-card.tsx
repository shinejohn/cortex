import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@inertiajs/react";
import { Calendar, DollarSign, Edit, Eye, MapPin, Trash2 } from "lucide-react";
import React from "react";

interface Region {
    id: number;
    name: string;
}

interface Payment {
    amount: number;
    status: string;
}

interface DayNewsPost {
    id: number;
    type: string;
    category: string | null;
    title: string;
    slug: string;
    excerpt: string | null;
    status: string;
    view_count: number;
    published_at: string | null;
    expires_at: string | null;
    regions: Region[];
    payment: Payment | null;
    can_edit: boolean;
    can_delete: boolean;
}

interface PostCardProps {
    post: DayNewsPost;
    onDelete?: (postId: number) => void;
}

export default function PostCard({ post, onDelete }: PostCardProps) {
    const getTypeColor = (type: string) => {
        const colors = {
            article: "bg-blue-500",
            announcement: "bg-yellow-500",
            notice: "bg-orange-500",
            ad: "bg-purple-500",
            schedule: "bg-green-500",
        };
        return colors[type as keyof typeof colors] || "bg-gray-500";
    };

    const getStatusColor = (status: string) => {
        const colors = {
            draft: "secondary",
            published: "default",
            expired: "destructive",
            removed: "outline",
        };
        return colors[status as keyof typeof colors] || "secondary";
    };

    return (
        <Card className="overflow-hidden">
            <CardHeader>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                    <Badge className={getTypeColor(post.type)}>{post.type}</Badge>
                    <Badge variant={getStatusColor(post.status)}>{post.status}</Badge>
                    {post.category && <Badge variant="outline">{post.category.replace("_", " ")}</Badge>}
                </div>
                <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                {post.excerpt && <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p>}
            </CardHeader>

            <CardContent>
                <div className="space-y-2 text-sm">
                    {post.regions.length > 0 && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="size-4" />
                            <span>{post.regions.map((r) => r.name).join(", ")}</span>
                        </div>
                    )}

                    {post.published_at && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="size-4" />
                            <span>{new Date(post.published_at).toLocaleDateString()}</span>
                        </div>
                    )}

                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Eye className="size-4" />
                        <span>{post.view_count} views</span>
                    </div>

                    {post.payment && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <DollarSign className="size-4" />
                            <span>
                                ${post.payment.amount.toFixed(2)} ({post.payment.status})
                            </span>
                        </div>
                    )}
                </div>
            </CardContent>

            <CardFooter className="flex gap-2">
                {post.can_edit && (
                    <Button asChild size="sm" variant="outline">
                        <Link href={`/posts/${post.id}/edit`}>
                            <Edit className="mr-2 size-4" />
                            Edit
                        </Link>
                    </Button>
                )}

                {post.status === "draft" && (
                    <Button asChild size="sm">
                        <Link href={`/posts/${post.id}/publish`}>Publish</Link>
                    </Button>
                )}

                {post.status === "published" && (
                    <Button asChild size="sm" variant="outline">
                        <Link href={`/posts/${post.slug}`} target="_blank">
                            View
                        </Link>
                    </Button>
                )}

                {post.can_delete && onDelete && (
                    <Button size="sm" variant="destructive" onClick={() => onDelete(post.id)}>
                        <Trash2 className="mr-2 size-4" />
                        Delete
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}
