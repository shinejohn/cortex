import { Head, Link } from "@inertiajs/react";
import axios from "axios";
import {
    ArrowLeftIcon,
    EditIcon,
    MessageSquareIcon,
    MoreHorizontalIcon,
    PinIcon,
    TrashIcon,
} from "lucide-react";
import { toast } from "sonner";
import { route } from "ziggy-js";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import AppLayout from "@/layouts/app-layout";
import { router } from "@inertiajs/react";

interface User {
    id: string;
    name: string;
    avatar?: string;
}

interface GroupMember {
    id: string;
    user_id: string;
    role: "admin" | "moderator" | "member";
    status: "pending" | "approved" | "banned";
}

interface Group {
    id: string;
    name: string;
    description: string;
    cover_image?: string;
    privacy: "public" | "private" | "secret";
    user_membership?: GroupMember;
}

interface GroupPost {
    id: string;
    content: string;
    media?: string[];
    is_pinned: boolean;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    user: User;
    group: {
        id: string;
        name: string;
    };
}

interface Props {
    group: Group;
    post: GroupPost;
}

export default function PostShow({ group, post }: Props) {
    const canManage = group.user_membership?.role === "admin" || group.user_membership?.role === "moderator";
    const isAuthor = post.user?.id === group.user_membership?.user_id;

    const handleDeletePost = async () => {
        if (confirm("Are you sure you want to delete this post?")) {
            try {
                await axios.delete(`/social/groups/${group.id}/posts/${post.id}`);
                toast.success("Post deleted successfully");
                router.visit(`/social/groups/${group.id}/posts`);
            } catch (error) {
                console.error("Error deleting post:", error);
                toast.error("Failed to delete post");
            }
        }
    };

    const handlePinPost = async () => {
        try {
            await axios.patch(`/social/groups/${group.id}/posts/${post.id}/pin`);
            toast.success(post.is_pinned ? "Post unpinned" : "Post pinned");
            router.reload();
        } catch (error) {
            console.error("Error pinning post:", error);
            toast.error("Failed to update pin status");
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
        });
    };

    return (
        <AppLayout>
            <Head title={`Post by ${post.user?.name} - ${group.name}`} />
            <div className="min-h-screen bg-background">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Back Navigation */}
                    <Link href={`/social/groups/${group.id}/posts`}>
                        <Button variant="ghost" size="sm" className="mb-6">
                            <ArrowLeftIcon className="size-4 mr-2" />
                            Back to {group.name}
                        </Button>
                    </Link>

                    {/* Post Card */}
                    <Card className="overflow-hidden rounded-xl border-none bg-card shadow-sm">
                        <CardHeader className="pb-4">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <Avatar className="size-12">
                                        <AvatarImage src={post.user?.avatar} />
                                        <AvatarFallback className="text-lg">{post.user?.name?.[0] || "?"}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-display font-bold tracking-tight">{post.user?.name}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <p className="text-sm text-muted-foreground">{formatDate(post.created_at)}</p>
                                            {post.is_pinned && (
                                                <Badge variant="secondary" className="text-xs">
                                                    <PinIcon className="size-3 mr-1" />
                                                    Pinned
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                {(canManage || isAuthor) && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreHorizontalIcon className="size-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            {canManage && (
                                                <DropdownMenuItem onClick={handlePinPost}>
                                                    <PinIcon className="size-4 mr-2" />
                                                    {post.is_pinned ? "Unpin" : "Pin"} Post
                                                </DropdownMenuItem>
                                            )}
                                            {isAuthor && (
                                                <DropdownMenuItem>
                                                    <EditIcon className="size-4 mr-2" />
                                                    Edit Post
                                                </DropdownMenuItem>
                                            )}
                                            {(canManage || isAuthor) && (
                                                <DropdownMenuItem onClick={handleDeletePost} className="text-destructive">
                                                    <TrashIcon className="size-4 mr-2" />
                                                    Delete Post
                                                </DropdownMenuItem>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </div>
                        </CardHeader>

                        <CardContent className="pt-0 space-y-4">
                            {/* Post Content */}
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                                <p className="whitespace-pre-wrap text-base leading-relaxed">{post.content}</p>
                            </div>

                            {/* Media */}
                            {post.media && post.media.length > 0 && (
                                <div className="grid gap-3">
                                    {post.media.map((mediaUrl, index) => (
                                        <img
                                            key={index}
                                            src={mediaUrl}
                                            alt={`Post media ${index + 1}`}
                                            className="rounded-lg max-w-full h-auto"
                                        />
                                    ))}
                                </div>
                            )}

                            <Separator />

                            {/* Post Metadata */}
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                                <div className="flex items-center gap-4">
                                    <span className="flex items-center gap-1.5">
                                        Posted in{" "}
                                        <Link href={`/social/groups/${group.id}`} className="font-medium text-foreground hover:underline">
                                            {group.name}
                                        </Link>
                                    </span>
                                </div>
                                {post.updated_at !== post.created_at && (
                                    <span className="text-xs">Edited {formatDate(post.updated_at)}</span>
                                )}
                            </div>

                            <Separator />

                            {/* Comment Section Placeholder */}
                            <div className="pt-2">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <MessageSquareIcon className="size-5" />
                                    <span className="text-sm font-medium">Comments</span>
                                </div>
                                <div className="mt-4 rounded-lg bg-muted/50 p-6 text-center">
                                    <MessageSquareIcon className="mx-auto size-8 text-muted-foreground mb-2" />
                                    <p className="text-sm text-muted-foreground">
                                        Comments will appear here.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
