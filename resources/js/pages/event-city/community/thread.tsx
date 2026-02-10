import { Head, Link, router, usePage } from "@inertiajs/react";
import axios from "axios";
import dayjs from "dayjs";
import { sanitizeHtml } from "@/lib/sanitize";
import relativeTime from "dayjs/plugin/relativeTime";
import {
    AlertCircleIcon,
    ArrowLeftIcon,
    BookmarkIcon,
    BriefcaseIcon,
    CalendarIcon,
    EyeIcon,
    HelpCircleIcon,
    LockIcon,
    MessageCircleIcon,
    MessageSquareIcon,
    PinIcon,
    ShareIcon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Footer } from "@/components/common/footer";
import Header from "@/components/common/header";
import { ThreadReply } from "@/components/community/thread-reply";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import type { ThreadPageProps } from "@/types/community";

// Initialize dayjs plugins
dayjs.extend(relativeTime);

export default function ThreadDetail() {
    const { auth, community, thread, replies } = usePage<ThreadPageProps>().props;
    const [replyContent, setReplyContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const getThreadTypeIcon = (type: string) => {
        switch (type) {
            case "Question":
                return <HelpCircleIcon className="h-5 w-5 text-chart-2" />;
            case "Announcement":
                return <AlertCircleIcon className="h-5 w-5 text-destructive" />;
            case "Resource":
                return <BriefcaseIcon className="h-5 w-5 text-chart-3" />;
            case "Event":
                return <CalendarIcon className="h-5 w-5 text-chart-4" />;
            case "Discussion":
            default:
                return <MessageSquareIcon className="h-5 w-5 text-primary" />;
        }
    };

    const getThreadTypeBadgeColor = (type: string): string => {
        switch (type) {
            case "Question":
                return "bg-chart-2/10 text-chart-2 border-chart-2/20";
            case "Announcement":
                return "bg-destructive/10 text-destructive border-destructive/20";
            case "Resource":
                return "bg-chart-3/10 text-chart-3 border-chart-3/20";
            case "Event":
                return "bg-chart-4/10 text-chart-4 border-chart-4/20";
            case "Discussion":
            default:
                return "bg-primary/10 text-primary border-primary/20";
        }
    };

    const formatDate = (dateString: string): string => {
        if (!dateString) return "Unknown date";

        const date = dayjs(dateString);

        // Check if the date is valid
        if (!date.isValid()) {
            return "Invalid date";
        }

        return date.format("MMMM D, YYYY [at] h:mm A");
    };

    const handleShare = async (): Promise<void> => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: thread.title,
                    text: `Check out this thread: ${thread.title}`,
                    url: window.location.href,
                });
            } catch {
                // User cancelled sharing
            }
        } else {
            await navigator.clipboard.writeText(window.location.href);
            // Could show a toast notification here
        }
    };

    const handleSubmitReply = async (): Promise<void> => {
        if (!replyContent.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            await axios.post(route("community.thread.reply.store", thread.id) as any, {
                content: replyContent.trim(),
            });
            setReplyContent("");
            toast.success("Reply posted successfully");
            router.reload({ only: ["thread"] });
        } catch (error: any) {
            console.error("Failed to submit reply:", error);
            const errorMessage = error.response?.data?.message || error.response?.data?.error || "Failed to post reply. Please try again.";
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Head title={`${thread.title} - ${community.name}`} />
            <Header auth={auth} />

            <div className="min-h-screen bg-background py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Breadcrumb Navigation and Back Button */}
                    <div className="flex items-center space-x-2 text-sm mb-6">
                        <Link
                            href={route("community.index") as any}
                            className="p-0 h-auto text-muted-foreground hover:text-foreground text-sm underline-offset-4 hover:underline"
                        >
                            Communities
                        </Link>
                        <span className="text-muted-foreground">/</span>
                        <Link
                            href={route("community.show", community.id) as any}
                            className="p-0 h-auto text-muted-foreground hover:text-foreground text-sm underline-offset-4 hover:underline"
                        >
                            {community.name}
                        </Link>
                        <span className="text-muted-foreground">/</span>
                        <span className="font-medium text-foreground">Thread</span>
                    </div>

                    {/* Main Thread Content */}
                    <Card>
                        <CardHeader className="border-b px-6 py-4">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center space-x-3">
                                    {getThreadTypeIcon(thread.type)}
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                            <Badge className={getThreadTypeBadgeColor(thread.type)}>{thread.type}</Badge>
                                            {thread.isPinned && (
                                                <Badge variant="outline" className="flex items-center gap-1">
                                                    <PinIcon className="h-3 w-3" />
                                                    Pinned
                                                </Badge>
                                            )}
                                            {thread.isLocked && (
                                                <Badge variant="outline" className="flex items-center gap-1">
                                                    <LockIcon className="h-3 w-3" />
                                                    Locked
                                                </Badge>
                                            )}
                                        </div>
                                        <h1 className="text-2xl font-bold leading-tight">{thread.title}</h1>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Button variant="ghost" size="icon" onClick={handleShare} aria-label="Share thread">
                                        <ShareIcon className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" aria-label="Bookmark thread">
                                        <BookmarkIcon className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Thread Meta */}
                            <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center">
                                        <Avatar className="h-6 w-6 mr-2">
                                            <AvatarImage src={thread.author.avatar} alt={thread.author.name} />
                                            <AvatarFallback>{thread.author.name.charAt(0).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <span className="font-medium text-foreground">{thread.author.name}</span>
                                        {thread.author.role && <span className="ml-1 text-muted-foreground">• {thread.author.role}</span>}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <CalendarIcon className="h-4 w-4" />
                                        <span>{formatDate(thread.createdAt)}</span>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center gap-1">
                                        <EyeIcon className="h-4 w-4" />
                                        <span>{thread.viewsCount}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <MessageCircleIcon className="h-4 w-4" />
                                        <span>{thread.replyCount} replies</span>
                                    </div>
                                </div>
                            </div>

                            {/* Tags */}
                            {thread.tags.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-border">
                                    <div className="flex flex-wrap gap-2">
                                        {thread.tags.map((tag, index) => (
                                            <Badge key={index} variant="secondary">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardHeader>

                        {/* Thread Content */}
                        <CardContent className="px-6 py-4">
                            <div
                                className="prose prose-slate dark:prose-invert max-w-none"
                                dangerouslySetInnerHTML={{
                                    __html: sanitizeHtml(thread.content.replace(/\n/g, "<br>")),
                                }}
                            />
                        </CardContent>

                        {/* Thread Actions / Footer */}
                        <CardContent className="border-t bg-muted/30 px-6 py-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    {auth.user ? (
                                        <Button
                                            disabled={thread.isLocked}
                                            onClick={() => router.visit((route('community.thread.show', { id: community.id, threadId: thread.id }) as string) + '#reply-form')}
                                        >
                                            <MessageCircleIcon className="h-4 w-4 mr-2" />
                                            Reply to Thread
                                        </Button>
                                    ) : (
                                        <Link href={route("login") as any}>
                                            <Button variant="outline">Sign in to Reply</Button>
                                        </Link>
                                    )}
                                    {thread.isLocked && <p className="text-sm text-muted-foreground ml-2">This thread is locked.</p>}
                                </div>
                                <span className="text-xs text-muted-foreground">Thread ID: {thread.id}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Replies Section */}
                    <div className="mt-8">
                        <Card>
                            <CardHeader className="px-6 py-4">
                                <h3 className="text-lg font-semibold">Replies ({thread.replyCount})</h3>
                            </CardHeader>
                            <CardContent className="px-6 py-4">
                                {/* Main Reply Form */}
                                {auth.user && !thread.isLocked && (
                                    <div id="reply-form" className="mb-6 p-4 border rounded-lg bg-secondary/20">
                                        <Textarea
                                            value={replyContent}
                                            onChange={(e) => setReplyContent(e.target.value)}
                                            placeholder="Share your thoughts on this thread..."
                                            className="min-h-24 mb-3"
                                        />
                                        <div className="flex justify-end">
                                            <Button onClick={handleSubmitReply} disabled={!replyContent.trim() || isSubmitting}>
                                                {isSubmitting ? "Posting..." : "Post Reply"}
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* Replies List */}
                                {replies.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <MessageCircleIcon className="mx-auto h-12 w-12 mb-2" />
                                        <h4 className="mt-2 text-lg font-medium">No replies yet</h4>
                                        <p className="mt-1 text-sm">Be the first to share your thoughts on this thread.</p>
                                        {!auth.user && (
                                            <Link href={route("login") as any}>
                                                <Button variant="outline" className="mt-4">
                                                    Sign in to Reply
                                                </Button>
                                            </Link>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {replies.map((reply) => (
                                            <ThreadReply key={reply.id} reply={reply} threadId={thread.id} currentUserId={auth.user?.id} />
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Related Threads Section */}
                    <div className="mt-8">
                        <Card>
                            <CardHeader className="px-6 py-4">
                                <h3 className="text-lg font-semibold">Related Threads</h3>
                            </CardHeader>
                            <CardContent className="px-6 py-4">
                                <div className="text-center py-8 text-muted-foreground">
                                    <p className="mb-2">Related threads will appear here based on tags and content similarity.</p>
                                    <Link href={route("community.show", community.id) as any}>
                                        <Button variant="outline">View All {community.name} Threads</Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            <Footer />
        </>
    );
}
