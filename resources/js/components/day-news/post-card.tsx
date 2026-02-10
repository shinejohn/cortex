import { Link } from "@inertiajs/react";
import { Calendar, DollarSign, Edit, Eye, MapPin, Trash2 } from "lucide-react";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

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
        const colors: Record<string, string> = {
            article: "bg-blue-500 text-white",
            announcement: "bg-yellow-500 text-white",
            notice: "bg-orange-500 text-white",
            ad: "bg-purple-500 text-white",
            schedule: "bg-green-500 text-white",
        };
        return colors[type] || "bg-muted text-muted-foreground";
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
            draft: "secondary",
            published: "default",
            expired: "destructive",
            removed: "outline",
        };
        return colors[status] || "secondary";
    };

    return (
        <Card className="group overflow-hidden border-none shadow-sm hover:shadow-md transition-all duration-300">
            <CardHeader>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                    <Badge className={getTypeColor(post.type)}>
                        <span className="text-[10px] font-black uppercase tracking-widest">{post.type}</span>
                    </Badge>
                    <Badge variant={getStatusColor(post.status)}>
                        <span className="text-[10px] font-black uppercase tracking-widest">{post.status}</span>
                    </Badge>
                    {post.category && (
                        <Badge variant="outline">
                            <span className="text-[10px] uppercase tracking-widest">{post.category.replace("_", " ")}</span>
                        </Badge>
                    )}
                </div>
                <CardTitle className="line-clamp-2 font-display font-black tracking-tight">{post.title}</CardTitle>
                {post.excerpt && <p className="mt-2 line-clamp-2 text-sm text-muted-foreground/90 leading-relaxed">{post.excerpt}</p>}
            </CardHeader>

            <CardContent>
                <div className="space-y-2 text-sm">
                    {post.regions.length > 0 && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                            <MapPin className="size-3.5 text-primary" />
                            <span>{post.regions.map((r) => r.name).join(", ")}</span>
                        </div>
                    )}

                    {post.published_at && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                            <Calendar className="size-3.5 text-primary" />
                            <span>{new Date(post.published_at).toLocaleDateString()}</span>
                        </div>
                    )}

                    <div className="flex items-center gap-1 text-muted-foreground">
                        <Eye className="size-3.5 text-primary" />
                        <span>{post.view_count} views</span>
                    </div>

                    {post.payment && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                            <DollarSign className="size-3.5 text-primary" />
                            <span>
                                ${post.payment.amount.toFixed(2)} ({post.payment.status})
                            </span>
                        </div>
                    )}
                </div>
            </CardContent>

            <CardFooter className="flex gap-2 bg-muted/5 pt-4">
                {post.can_edit && (
                    <Button asChild size="sm" variant="outline">
                        <Link href={route("daynews.posts.edit", post.id) as any}>
                            <Edit className="mr-2 size-4" />
                            Edit
                        </Link>
                    </Button>
                )}

                {post.status === "draft" && (
                    <Button asChild size="sm">
                        <Link href={route("daynews.posts.publish.show", post.id) as any}>Publish</Link>
                    </Button>
                )}

                {post.status === "published" && (
                    <Button asChild size="sm" variant="outline">
                        <Link href={route("daynews.posts.show", post.slug) as any} target="_blank">
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
