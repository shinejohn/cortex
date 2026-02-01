import { router, useForm } from "@inertiajs/react";
import { ChevronDown, Flag, MessageSquare, Send, ThumbsUp } from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

interface User {
    id: string | number;
    name: string;
    avatar?: string | null;
}

interface Comment {
    id: string | number;
    content: string;
    user: User;
    created_at: string;
    time_ago: string;
    likes_count: number;
    replies_count: number;
    is_liked_by_user: boolean;
    is_pinned?: boolean;
    replies?: Comment[];
}

interface ArticleCommentsProps {
    articleId: number | string;
    comments: Comment[];
    total: number;
    auth?: {
        user: User;
    };
}

export function ArticleComments({ articleId, comments: initialComments, total, auth }: ArticleCommentsProps) {
    const [comments, setComments] = useState<Comment[]>(initialComments);
    const [sortBy, setSortBy] = useState<"best" | "newest" | "oldest">("best");
    const [showComments] = useState(true);
    const [replyingTo, setReplyingTo] = useState<string | number | null>(null);

    const commentForm = useForm({
        content: "",
        parent_id: null as string | number | null,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentForm.data.content.trim() || !auth) return;

        commentForm.post(`/posts/${articleId}/comments`, {
            preserveScroll: true,
            onSuccess: () => {
                commentForm.reset();
                setReplyingTo(null);
                // Reload comments section only
                router.reload({ only: ["comments"] });
            },
        });
    };

    const handleReply = (parentId: string | number) => {
        setReplyingTo(parentId);
        commentForm.setData("parent_id", parentId);
    };

    const handleLike = async (commentId: string | number) => {
        if (!auth) return;

        try {
            const response = await fetch(`/comments/${commentId}/like`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "",
                },
            });
            const data = await response.json();

            setComments((prev) =>
                prev.map((comment) => {
                    if (comment.id === commentId) {
                        return {
                            ...comment,
                            likes_count: data.likes_count,
                            is_liked_by_user: data.liked,
                        };
                    }
                    if (comment.replies) {
                        return {
                            ...comment,
                            replies: comment.replies?.map((reply) =>
                                reply.id === commentId
                                    ? {
                                        ...reply,
                                        likes_count: data.likes_count,
                                        is_liked_by_user: data.liked,
                                    }
                                    : reply,
                            ),
                        };
                    }
                    return comment;
                }),
            );
        } catch (error) {
            console.error("Error liking comment:", error);
        }
    };

    const sortedComments = [...comments].sort((a, b) => {
        if (sortBy === "best") {
            return b.likes_count - a.likes_count;
        }
        if (sortBy === "newest") {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });

    return (
        <div className="mt-8 rounded-lg border bg-card">
            {/* Header */}
            <div className="bg-primary text-primary-foreground flex items-center px-6 py-4">
                <MessageSquare className="mr-2 size-5" />
                <h2 className="text-xl font-bold">Join the Conversation</h2>
            </div>

            {/* Comment Form */}
            {auth && (
                <div className="border-b p-6">
                    <form onSubmit={handleSubmit} className="flex gap-3">
                        <Avatar className="size-10 shrink-0 ring-2 ring-background">
                            <AvatarImage src={auth.user?.avatar || undefined} alt={auth.user?.name || 'User'} />
                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                                {auth.user?.name?.slice(0, 2).toUpperCase() || 'U'}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <Textarea
                                placeholder={replyingTo ? "Write a reply..." : "What's your take?"}
                                value={commentForm.data.content}
                                onChange={(e) => commentForm.setData("content", e.target.value)}
                                className="min-h-[80px] resize-none"
                                rows={3}
                            />
                            <div className="mt-2 flex items-center justify-between">
                                <p className="text-xs text-muted-foreground">Be respectful and thoughtful in your comments.</p>
                                <div className="flex gap-2">
                                    {replyingTo && (
                                        <Button type="button" variant="ghost" size="sm" onClick={() => setReplyingTo(null)}>
                                            Cancel
                                        </Button>
                                    )}
                                    <Button type="submit" size="sm" disabled={!commentForm.data.content.trim() || commentForm.processing}>
                                        <Send className="mr-1.5 size-4" />
                                        Post Comment
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {/* Sort Controls */}
            <div className="flex items-center justify-between border-b bg-muted/50 px-6 py-3">
                <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">Sort by:</span>
                    <div className="relative">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as "best" | "newest" | "oldest")}
                            className="appearance-none rounded-md border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="best">Best</option>
                            <option value="newest">Newest</option>
                            <option value="oldest">Oldest</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-4 -translate-y-1/2" />
                    </div>
                </div>
                <span className="text-sm text-muted-foreground">{total} comments</span>
            </div>

            {/* Comments List */}
            {showComments && (
                <div className="divide-y">
                    {sortedComments.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                            <MessageSquare className="mx-auto mb-2 size-8" />
                            <p>No comments yet. Be the first to comment!</p>
                        </div>
                    ) : (
                        sortedComments.map((comment) => (
                            <CommentItem
                                key={comment.id}
                                comment={comment}
                                onLike={() => handleLike(comment.id)}
                                onReply={() => handleReply(comment.id)}
                                auth={auth}
                            />
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

interface CommentItemProps {
    comment: Comment;
    onLike: () => void;
    onReply: () => void;
    auth?: {
        user: User;
    };
}

function CommentItem({ comment, onLike, onReply, auth }: CommentItemProps) {
    return (
        <div className="p-6">
            <div className="flex gap-3">
                <Avatar className="size-10 shrink-0 ring-2 ring-background">
                    <AvatarImage src={comment.user.avatar || undefined} alt={comment.user.name} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                        {comment.user.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                        <span className="font-semibold">{comment.user.name}</span>
                        {comment.is_pinned && (
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                                PINNED
                            </Badge>
                        )}
                        <span className="text-sm text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground">{comment.time_ago}</span>
                    </div>
                    <p className="mb-3 whitespace-pre-wrap text-sm">{comment.content}</p>
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" onClick={onLike} className="h-8">
                            <ThumbsUp className={`mr-1.5 size-4 ${comment.is_liked_by_user ? "fill-current" : ""}`} />
                            {comment.likes_count}
                        </Button>
                        {auth && (
                            <Button variant="ghost" size="sm" onClick={onReply} className="h-8">
                                Reply
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8"
                            onClick={async () => {
                                if (!auth) return;
                                const reason = prompt("Reason for reporting:\n1. spam\n2. harassment\n3. inappropriate\n4. other");
                                if (!reason) return;
                                try {
                                    await fetch(`/comments/${comment.id}/report`, {
                                        method: "POST",
                                        headers: {
                                            "Content-Type": "application/json",
                                            "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "",
                                        },
                                        body: JSON.stringify({ reason }),
                                    });
                                    alert("Comment reported successfully");
                                } catch (error) {
                                    console.error("Error reporting comment:", error);
                                }
                            }}
                        >
                            <Flag className="mr-1.5 size-4" />
                            Report
                        </Button>
                    </div>
                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                        <div className="ml-8 mt-4 space-y-4 border-l-2 pl-4">
                            {comment.replies.map((reply) => (
                                <div key={reply.id} className="flex gap-3">
                                    <Avatar className="size-8 shrink-0 ring-2 ring-background">
                                        <AvatarImage src={reply.user.avatar || undefined} alt={reply.user.name} />
                                        <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-medium">
                                            {reply.user.name.slice(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <div className="mb-1 flex items-center gap-2">
                                            <span className="text-sm font-semibold">{reply.user.name}</span>
                                            <span className="text-xs text-muted-foreground">•</span>
                                            <span className="text-xs text-muted-foreground">{reply.time_ago}</span>
                                        </div>
                                        <p className="mb-2 whitespace-pre-wrap text-sm">{reply.content}</p>
                                        <div className="flex items-center gap-4">
                                            <Button variant="ghost" size="sm" className="h-7 text-xs">
                                                <ThumbsUp className={`mr-1 size-3 ${reply.is_liked_by_user ? "fill-current" : ""}`} />
                                                {reply.likes_count}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
