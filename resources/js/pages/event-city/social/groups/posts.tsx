import { Head, Link, router } from "@inertiajs/react";
import axios from "axios";
import { ArrowLeftIcon, EditIcon, MessageSquareIcon, MoreHorizontalIcon, PinIcon, PlusIcon, TrashIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import AppLayout from "@/layouts/app-layout";

interface User {
    id: string;
    name: string;
    avatar?: string;
}

interface GroupPost {
    id: string;
    content: string;
    media?: string[];
    is_pinned: boolean;
    is_active: boolean;
    created_at: string;
    user: User;
    group: {
        id: string;
        name: string;
    };
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

interface Props {
    group: Group;
    posts: {
        data: GroupPost[];
        links: {
            first: string | null;
            last: string | null;
            prev: string | null;
            next: string | null;
        };
        meta: {
            current_page: number;
            from: number | null;
            last_page: number;
            per_page: number;
            to: number | null;
            total: number;
        };
    };
}

export default function GroupPosts({ group, posts }: Props) {
    const [newPostContent, setNewPostContent] = useState("");
    const [isCreatingPost, setIsCreatingPost] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);

    const handleCreatePost = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPostContent.trim()) return;

        setIsCreatingPost(true);
        try {
            await axios.post(`/social/groups/${group.id}/posts`, {
                content: newPostContent,
            });
            setNewPostContent("");
            setShowCreateForm(false);
            toast.success("Post created successfully");
            router.reload({ only: ["posts"] });
        } catch (error) {
            console.error("Error creating post:", error);
        } finally {
            setIsCreatingPost(false);
        }
    };

    const handleDeletePost = async (postId: string) => {
        if (confirm("Are you sure you want to delete this post?")) {
            try {
                await axios.delete(`/social/groups/${group.id}/posts/${postId}`);
                toast.success("Post deleted successfully");
                router.reload({ only: ["posts"] });
            } catch (error) {
                console.error("Error deleting post:", error);
            }
        }
    };

    const handlePinPost = async (postId: string) => {
        try {
            await axios.patch(`/social/groups/${group.id}/posts/${postId}/pin`);
            toast.success("Post pin status updated");
            router.reload({ only: ["posts"] });
        } catch (error) {
            console.error("Error pinning post:", error);
        }
    };

    const canManage = group.user_membership?.role === "admin" || group.user_membership?.role === "moderator";
    const isMember = group.user_membership?.status === "approved";

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));

        if (hours < 1) {
            return "Just now";
        } else if (hours < 24) {
            return `${hours}h ago`;
        } else {
            const days = Math.floor(hours / 24);
            if (days < 7) {
                return `${days}d ago`;
            } else {
                return date.toLocaleDateString();
            }
        }
    };

    return (
        <AppLayout>
            <Head title={`${group.name} - Posts`} />
            <div className="min-h-screen bg-background">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <div className="mb-6">
                        <Link href={`/social/groups/${group.id}`}>
                            <Button variant="ghost" size="sm" className="mb-4">
                                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                                Back to {group.name}
                            </Button>
                        </Link>
                        <h1 className="text-3xl font-bold text-foreground">{group.name}</h1>
                        <p className="text-muted-foreground mt-1">Group Posts</p>
                    </div>

                    {/* Create post form */}
                    {isMember && (
                        <Card className="mb-6">
                            <CardContent className="p-6">
                                {!showCreateForm ? (
                                    <Button variant="outline" className="w-full justify-start" onClick={() => setShowCreateForm(true)}>
                                        <PlusIcon className="h-4 w-4 mr-2" />
                                        Share something with the group...
                                    </Button>
                                ) : (
                                    <form onSubmit={handleCreatePost} className="space-y-4">
                                        <Textarea
                                            placeholder="What's on your mind?"
                                            value={newPostContent}
                                            onChange={(e) => setNewPostContent(e.target.value)}
                                            rows={3}
                                            maxLength={2000}
                                        />
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs text-muted-foreground">{newPostContent.length}/2000 characters</p>
                                            <div className="flex gap-2">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setShowCreateForm(false);
                                                        setNewPostContent("");
                                                    }}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button type="submit" disabled={isCreatingPost || !newPostContent.trim()}>
                                                    {isCreatingPost ? "Posting..." : "Post"}
                                                </Button>
                                            </div>
                                        </div>
                                    </form>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Posts list */}
                    <div className="space-y-6">
                        {posts.data.length > 0 ? (
                            posts.data.map((post) => (
                                <Card key={post.id}>
                                    <CardHeader className="pb-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarImage src={post.user.avatar} />
                                                    <AvatarFallback>{post.user.name[0]}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">{post.user.name}</p>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm text-muted-foreground">{formatDate(post.created_at)}</p>
                                                        {post.is_pinned && (
                                                            <Badge variant="secondary" className="text-xs">
                                                                <PinIcon className="h-3 w-3 mr-1" />
                                                                Pinned
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            {(canManage || post.user.id === group.user_membership?.user_id) && (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreHorizontalIcon className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        {canManage && (
                                                            <DropdownMenuItem onClick={() => handlePinPost(post.id)}>
                                                                <PinIcon className="h-4 w-4 mr-2" />
                                                                {post.is_pinned ? "Unpin" : "Pin"} Post
                                                            </DropdownMenuItem>
                                                        )}
                                                        {post.user.id === group.user_membership?.user_id && (
                                                            <DropdownMenuItem>
                                                                <EditIcon className="h-4 w-4 mr-2" />
                                                                Edit Post
                                                            </DropdownMenuItem>
                                                        )}
                                                        {(canManage || post.user.id === group.user_membership?.user_id) && (
                                                            <DropdownMenuItem onClick={() => handleDeletePost(post.id)} className="text-destructive">
                                                                <TrashIcon className="h-4 w-4 mr-2" />
                                                                Delete Post
                                                            </DropdownMenuItem>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        <div className="prose prose-sm max-w-none">
                                            <p className="whitespace-pre-wrap">{post.content}</p>
                                        </div>
                                        {post.media && post.media.length > 0 && (
                                            <div className="mt-4 grid gap-2">
                                                {post.media.map((mediaUrl, index) => (
                                                    <img key={index} src={mediaUrl} alt="Post media" className="rounded-md max-w-full h-auto" />
                                                ))}
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between mt-4 pt-4 border-t">
                                            <div className="flex items-center gap-4">
                                                <Button variant="ghost" size="sm">
                                                    <MessageSquareIcon className="h-4 w-4 mr-2" />
                                                    Comment
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <Card>
                                <CardContent className="p-8 text-center">
                                    <MessageSquareIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-medium mb-2">No posts yet</h3>
                                    <p className="text-muted-foreground mb-4">Be the first to share something with this group!</p>
                                    {isMember && (
                                        <Button onClick={() => setShowCreateForm(true)}>
                                            <PlusIcon className="h-4 w-4 mr-2" />
                                            Create Post
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Pagination */}
                    {posts.links && posts.data.length > 0 && (
                        <div className="mt-8 flex justify-center gap-2">
                            {posts.links.map((link: any, index: number) =>
                                link.url ? (
                                    <Link key={index} href={link.url}>
                                        <Button
                                            variant={link.active ? "default" : "outline"}
                                            size="sm"
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    </Link>
                                ) : (
                                    <Button
                                        key={index}
                                        variant={link.active ? "default" : "outline"}
                                        size="sm"
                                        disabled
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ),
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
