import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import type { SocialPost, SocialPostComment } from "@/types/social";
import type { User } from "@/types";
import { Link, router } from "@inertiajs/react";
import { route } from "ziggy-js";
import axios from "axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);
import {
    HeartIcon,
    MessageCircleIcon,
    ShareIcon,
    MoreHorizontalIcon,
    SendIcon,
    MapPinIcon
} from "lucide-react";
import { useState } from "react";

interface SocialPostCardProps {
    post: SocialPost;
    currentUser: User;
    onUpdate: (post: SocialPost) => void;
    onDelete: (postId: string) => void;
}

export function SocialPostCard({ post, currentUser, onUpdate, onDelete }: SocialPostCardProps) {
    const [isLiked, setIsLiked] = useState(post.is_liked_by_user);
    const [likesCount, setLikesCount] = useState(post.likes_count);
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState("");
    const [comments, setComments] = useState<SocialPostComment[]>(post.recent_comments || []);
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);

    const handleLike = async () => {
        try {
            if (isLiked) {
                const response = await axios.delete(route('social.posts.unlike', post.id));
                setIsLiked(response.data.liked);
                setLikesCount(response.data.likes_count);
            } else {
                const response = await axios.post(route('social.posts.like', post.id));
                setIsLiked(response.data.liked);
                setLikesCount(response.data.likes_count);
            }
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    const handleComment = async () => {
        if (!commentText.trim() || isSubmittingComment) return;

        setIsSubmittingComment(true);
        try {
            const response = await axios.post(route('social.posts.comments.create', post.id), {
                content: commentText
            });
            if (response.data.comment) {
                setComments(prev => [...prev, response.data.comment]);
            }
            setCommentText("");
            setShowComments(true);
        } catch (error) {
            console.error('Error posting comment:', error);
        } finally {
            setIsSubmittingComment(false);
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        if (!confirm('Are you sure you want to delete this comment?')) return;

        try {
            await axios.delete(route('social.comments.delete', commentId));
            setComments(prev => prev.filter(comment => comment.id !== commentId));
        } catch (error) {
            console.error('Error deleting comment:', error);
        }
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: `${post.user.name}'s post`,
                text: post.content,
                url: window.location.href,
            });
        } else {
            // Fallback to clipboard
            navigator.clipboard.writeText(window.location.href);
        }
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this post?')) {
            onDelete(post.id);
        }
    };

    const isOwner = post.user_id === currentUser.id;

    return (
        <Card className="w-full rounded-xl border shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                        <Link href={route('social.profile', post.user.id)}>
                            <Avatar className="cursor-pointer ring-2 ring-background hover:ring-primary/20 transition-all">
                                <AvatarImage src={post.user.avatar} alt={post.user.name} />
                                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                    {post.user.name.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                        </Link>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <Link
                                    href={route('social.profile', post.user.id)}
                                    className="font-semibold text-card-foreground hover:underline truncate"
                                >
                                    {post.user.name}
                                </Link>
                                <span className="text-muted-foreground text-sm">•</span>
                                <span className="text-muted-foreground text-sm">{dayjs(post.created_at).fromNow()}</span>
                            </div>
                            {post.location && (
                                <div className="flex items-center gap-1 mt-1">
                                    <MapPinIcon className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-xs text-muted-foreground">{post.location.name}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    {isOwner && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="rounded-full hover:bg-muted/80">
                                    <MoreHorizontalIcon className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                                    Delete Post
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </CardHeader>

            <CardContent className="pb-3">
                <p className="text-card-foreground whitespace-pre-wrap">{post.content}</p>

                {post.media && post.media.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 gap-2">
                        {post.media.map((mediaUrl, index) => (
                            <img
                                key={index}
                                src={mediaUrl}
                                alt=""
                                className="rounded-lg object-cover w-full h-48"
                            />
                        ))}
                    </div>
                )}
            </CardContent>

            <CardFooter className="pt-2">
                <div className="w-full space-y-3">
                    {/* Engagement stats */}
                    {(likesCount > 0 || post.comments_count > 0 || post.shares_count > 0) && (
                        <>
                            <div className="flex items-center justify-between text-sm text-muted-foreground px-1">
                                {likesCount > 0 && (
                                    <span className="flex items-center gap-1">
                                        <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                                            <HeartIcon className="w-2.5 h-2.5 text-white fill-current" />
                                        </div>
                                        {likesCount}
                                    </span>
                                )}
                                <div className="flex gap-4">
                                    {post.comments_count > 0 && (
                                        <span className="hover:underline cursor-pointer" onClick={() => setShowComments(!showComments)}>
                                            {post.comments_count} {post.comments_count === 1 ? 'comment' : 'comments'}
                                        </span>
                                    )}
                                    {post.shares_count > 0 && (
                                        <span>{post.shares_count} {post.shares_count === 1 ? 'share' : 'shares'}</span>
                                    )}
                                </div>
                            </div>
                            <Separator />
                        </>
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center justify-around">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleLike}
                            className={`flex-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors ${
                                isLiked ? "text-red-500 hover:text-red-600" : "hover:text-red-500"
                            }`}
                        >
                            <HeartIcon className={`h-5 w-5 mr-2 ${isLiked ? "fill-current" : ""}`} />
                            <span className="hidden sm:inline">Like</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowComments(!showComments)}
                            className="flex-1 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/20 hover:text-blue-500 transition-colors"
                        >
                            <MessageCircleIcon className="h-5 w-5 mr-2" />
                            <span className="hidden sm:inline">Comment</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleShare}
                            className="flex-1 rounded-lg hover:bg-green-50 dark:hover:bg-green-950/20 hover:text-green-500 transition-colors"
                        >
                            <ShareIcon className="h-5 w-5 mr-2" />
                            <span className="hidden sm:inline">Share</span>
                        </Button>
                    </div>

                    {/* Comments section */}
                    {showComments && (
                        <div className="space-y-4 pt-2">
                            <Separator />

                            {/* Comment input */}
                            <div className="flex gap-3">
                                <Avatar className="h-8 w-8 ring-2 ring-background">
                                    <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                                    <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs">
                                        {currentUser.name.slice(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 flex gap-2">
                                    <Textarea
                                        placeholder="Write a comment..."
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        className="min-h-[40px] max-h-32 resize-none rounded-full border-border/50 bg-muted/30 focus:bg-background transition-colors px-4 py-2"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleComment();
                                            }
                                        }}
                                    />
                                    <Button
                                        size="sm"
                                        onClick={handleComment}
                                        disabled={!commentText.trim() || isSubmittingComment}
                                        className="rounded-full shrink-0"
                                    >
                                        <SendIcon className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Comments list */}
                            {comments.length > 0 && (
                                <div className="space-y-3 ml-11">
                                    {comments.map((comment) => (
                                        <div key={comment.id} className="flex gap-3">
                                            <Avatar className="h-7 w-7 ring-1 ring-border">
                                                <AvatarImage src={comment.user.avatar} alt={comment.user.name} />
                                                <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs">
                                                    {comment.user.name.slice(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <div className="bg-muted/50 rounded-2xl px-3 py-2 relative group hover:bg-muted/70 transition-colors">
                                                    <div className="font-medium text-sm">{comment.user.name}</div>
                                                    <div className="text-sm text-card-foreground">{comment.content}</div>
                                                    {comment.user.id === currentUser.id && (
                                                        <button
                                                            onClick={() => handleDeleteComment(comment.id)}
                                                            className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/20 hover:text-destructive rounded-full"
                                                            title="Delete comment"
                                                        >
                                                            <MoreHorizontalIcon className="h-3 w-3" />
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground px-1">
                                                    <span>{dayjs(comment.created_at).fromNow()}</span>
                                                    <button className="hover:underline font-medium">Like</button>
                                                    <button className="hover:underline font-medium">Reply</button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </CardFooter>
        </Card>
    );
}