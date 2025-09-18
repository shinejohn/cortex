import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import type { CommunityThreadReply } from "@/types/community";
import { router } from "@inertiajs/react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { HeartIcon, MessageCircleIcon, MoreHorizontalIcon, PencilIcon, PinIcon, StarIcon, TrashIcon } from "lucide-react";
import { useState } from "react";

// Initialize dayjs plugins
dayjs.extend(relativeTime);

interface ThreadReplyProps {
    readonly reply: CommunityThreadReply;
    readonly threadId: string;
    readonly currentUserId?: string;
    readonly depth?: number;
}

export function ThreadReply({ reply, threadId, currentUserId, depth = 0 }: ThreadReplyProps) {
    const [isReplying, setIsReplying] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [replyContent, setReplyContent] = useState("");
    const [editContent, setEditContent] = useState(reply.content);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isOwnReply = currentUserId === reply.author.id;
    const maxDepth = 3;
    const shouldShowNestedReplies = depth < maxDepth;

    const handleReply = async (): Promise<void> => {
        if (!replyContent.trim() || isSubmitting) return;

        setIsSubmitting(true);
        router.post(
            `/community/thread/${threadId}/replies`,
            {
                content: replyContent.trim(),
                reply_to_id: reply.id,
            },
            {
                onSuccess: () => {
                    setReplyContent("");
                    setIsReplying(false);
                },
                onFinish: () => setIsSubmitting(false),
            },
        );
    };

    const handleEdit = async (): Promise<void> => {
        if (!editContent.trim() || isSubmitting) return;

        setIsSubmitting(true);
        router.patch(
            `/community/reply/${reply.id}`,
            { content: editContent.trim() },
            {
                onSuccess: () => setIsEditing(false),
                onFinish: () => setIsSubmitting(false),
            },
        );
    };

    const handleDelete = (): void => {
        if (confirm("Are you sure you want to delete this reply?")) {
            router.delete(`/community/reply/${reply.id}`);
        }
    };

    const handleLike = (): void => {
        router.post(`/community/reply/${reply.id}/like`);
    };

    return (
        <div className={`${depth > 0 ? "ml-8 mt-4" : ""}`}>
            <Card className="bg-background shadow-sm border">
                <CardContent className="p-4">
                    {/* Reply Header */}
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                            <Avatar className="h-9 w-9">
                                <AvatarImage src={reply.author.avatar} alt={reply.author.name} />
                                <AvatarFallback>{reply.author.name.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="flex items-center space-x-2">
                                    <span className="font-semibold text-sm text-foreground">{reply.author.name}</span>
                                    <Badge variant="secondary" className="text-xs font-normal">
                                        {reply.author.role}
                                    </Badge>
                                    {reply.isSolution && (
                                        <Badge variant="success" className="text-xs font-normal flex items-center gap-1">
                                            <StarIcon className="h-3 w-3" />
                                            Solution
                                        </Badge>
                                    )}
                                    {reply.isPinned && (
                                        <Badge variant="secondary" className="text-xs font-normal flex items-center gap-1">
                                            <PinIcon className="h-3 w-3" />
                                            Pinned
                                        </Badge>
                                    )}
                                </div>
                                <div className="text-xs text-muted-foreground mt-0.5">
                                    {dayjs(reply.createdAt).fromNow()}
                                    {reply.isEdited && reply.editedAt && <span className="ml-2">(edited {dayjs(reply.editedAt).fromNow()})</span>}
                                </div>
                            </div>
                        </div>

                        {/* Reply Actions (Edit/Delete) */}
                        {isOwnReply && (
                            <div className="flex items-center space-x-1">
                                <Button variant="ghost" size="sm" onClick={() => setIsEditing(!isEditing)} aria-label="Edit reply">
                                    <PencilIcon className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={handleDelete} aria-label="Delete reply">
                                    <TrashIcon className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Reply Content / Edit Form */}
                    {isEditing ? (
                        <div className="mb-3">
                            <Textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                placeholder="Edit your reply..."
                                className="min-h-20 mb-3 focus-visible:ring-primary"
                            />
                            <div className="flex justify-end space-x-2">
                                <Button size="sm" onClick={handleEdit} disabled={!editContent.trim() || isSubmitting}>
                                    {isSubmitting ? "Saving..." : "Save"}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setIsEditing(false);
                                        setEditContent(reply.content);
                                    }}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div
                            className="prose prose-sm dark:prose-invert max-w-none text-foreground mb-3"
                            dangerouslySetInnerHTML={{
                                __html: reply.content.replace(/\n/g, "<br>"),
                            }}
                        />
                    )}

                    {/* Reply Interaction Actions (Like/Reply) */}
                    {!isEditing && (
                        <div className="flex items-center justify-between border-t border-border pt-3">
                            <div className="flex items-center space-x-4">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleLike}
                                    className={`text-muted-foreground ${reply.isLiked ? "text-primary hover:text-primary" : "hover:text-red-500"}`}
                                    aria-label={reply.isLiked ? "Unlike reply" : "Like reply"}
                                >
                                    <HeartIcon className="h-4 w-4 mr-1" />
                                    {reply.likesCount}
                                </Button>
                                {shouldShowNestedReplies && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setIsReplying(!isReplying)}
                                        className="text-muted-foreground hover:text-primary"
                                    >
                                        <MessageCircleIcon className="h-4 w-4 mr-1" />
                                        Reply
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Nested Reply Form */}
                    {isReplying && (
                        <div className="mt-4 pt-4 border-t border-border bg-secondary/10 p-4 rounded-lg">
                            <Textarea
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                placeholder={`Reply to ${reply.author.name}...`}
                                className="min-h-20 mb-3 focus-visible:ring-primary"
                            />
                            <div className="flex justify-end space-x-2">
                                <Button size="sm" onClick={handleReply} disabled={!replyContent.trim() || isSubmitting}>
                                    {isSubmitting ? "Posting..." : "Post Reply"}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setIsReplying(false);
                                        setReplyContent("");
                                    }}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Nested Replies */}
            {shouldShowNestedReplies && reply.replies.length > 0 && (
                <div className="ml-8 mt-4 border-l pl-4 space-y-4">
                    {reply.replies.map((nestedReply) => (
                        <ThreadReply key={nestedReply.id} reply={nestedReply} threadId={threadId} currentUserId={currentUserId} depth={depth + 1} />
                    ))}
                </div>
            )}
        </div>
    );
}
