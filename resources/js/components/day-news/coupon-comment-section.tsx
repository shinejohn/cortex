import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { Auth } from "@/types";
import type { Comment } from "@/types/coupon";
import { Link, useForm } from "@inertiajs/react";
import { Heart, MessageCircle, Reply, Send, Trash2, X } from "lucide-react";
import { FormEventHandler, useState } from "react";
import { route } from "ziggy-js";

interface Props {
    couponId: number;
    comments: Comment[];
    auth?: Auth;
}

function getInitials(name: string) {
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}

function formatRelativeTime(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
}

interface SingleCommentProps {
    comment: Comment;
    couponId: number;
    auth?: Auth;
    depth?: number;
}

function SingleComment({ comment, couponId, auth, depth = 0 }: SingleCommentProps) {
    const canDelete = auth?.user?.id === comment.user?.id;

    return (
        <div className={cn("group", depth > 0 && "ml-8 border-l-2 border-muted pl-4")}>
            <div className="flex gap-3">
                <Avatar className="size-8 shrink-0">
                    <AvatarImage src={comment.user?.avatar} alt={comment.user?.name} />
                    <AvatarFallback className="text-xs">{getInitials(comment.user?.name ?? "?")}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">{comment.user?.name ?? "Unknown"}</span>
                        <span className="text-xs text-muted-foreground">{formatRelativeTime(comment.created_at)}</span>
                    </div>
                    <p className="mt-1 text-sm text-foreground whitespace-pre-wrap break-words">{comment.content}</p>
                    <div className="mt-2 flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className={cn("h-7 px-2 text-xs", comment.is_liked && "text-red-500")}
                        >
                            <Heart className={cn("mr-1 size-3", comment.is_liked && "fill-current")} />
                            {comment.likes_count ?? 0}
                        </Button>
                        {canDelete && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                            >
                                <Trash2 className="mr-1 size-3" />
                                Delete
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {comment.replies && comment.replies.length > 0 && (
                <div className="mt-3 space-y-3">
                    {comment.replies.map((reply) => (
                        <SingleComment
                            key={reply.id}
                            comment={reply}
                            couponId={couponId}
                            auth={auth}
                            depth={depth + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export function CouponCommentSection({ couponId, comments, auth }: Props) {
    const { data, setData, post, processing, reset } = useForm({
        content: "",
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route("daynews.coupons.comments.store", couponId), {
            onSuccess: () => reset(),
        });
    };

    const totalComments = comments?.length ?? 0;

    return (
        <div className="mt-8 border-t pt-8">
            <h2 className="mb-6 flex items-center gap-2 font-display font-black tracking-tight text-xl">
                <MessageCircle className="size-5" />
                Comments ({totalComments})
            </h2>

            {auth?.user ? (
                <div className="mb-6">
                    <form onSubmit={submit} className="space-y-2">
                        <Textarea
                            placeholder="Ask a question or share your experience..."
                            value={data.content}
                            onChange={(e) => setData("content", e.target.value)}
                            className="min-h-[80px] resize-none"
                            maxLength={2000}
                        />
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">{data.content.length}/2000</span>
                            <Button type="submit" size="sm" disabled={processing || !data.content.trim()}>
                                <Send className="mr-1 size-4" />
                                {processing ? "Posting..." : "Post"}
                            </Button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="mb-6 rounded-lg border border-dashed p-4 text-center">
                    <p className="text-sm text-muted-foreground">
                        <Link href={route("login")} className="font-medium text-primary hover:underline">
                            Sign in
                        </Link>{" "}
                        to join the conversation
                    </p>
                </div>
            )}

            {comments && comments.length > 0 ? (
                <div className="space-y-6">
                    {comments.map((comment) => (
                        <SingleComment
                            key={comment.id}
                            comment={comment}
                            couponId={couponId}
                            auth={auth}
                        />
                    ))}
                </div>
            ) : (
                <p className="text-center text-sm text-muted-foreground py-8">No comments yet. Be the first to share your thoughts!</p>
            )}
        </div>
    );
}
