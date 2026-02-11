import type { SocialPost } from "@/types/social";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Heart, Share2 } from "lucide-react";
import { Link } from "@inertiajs/react";
import { route } from "ziggy-js";

interface CommunityVoicesWidgetProps {
    posts: SocialPost[];
}

export default function CommunityVoicesWidget({ posts }: CommunityVoicesWidgetProps) {
    if (!posts || posts.length === 0) return null;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between border-b-2 border-border pb-2">
                <h2 className="font-serif text-2xl font-bold">Community Voices</h2>
                <Link
                    href={route("daynews.local-voices.index") as any}
                    className="text-xs font-bold text-news-primary uppercase tracking-wider hover:underline"
                >
                    View All
                </Link>
            </div>

            <div className="space-y-4">
                {posts.map((post) => (
                    <div key={post.id} className="rounded-lg border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
                        <div className="flex items-start gap-3">
                            <Avatar className="h-10 w-10 border">
                                <AvatarImage src={post.user?.avatar} alt={post.user?.name || 'User'} />
                                <AvatarFallback>{(post.user?.name || 'U').substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between">
                                    <span className="font-semibold text-sm">{post.user?.name || 'Anonymous'}</span>
                                    <span className="text-xs text-muted-foreground">
                                        {new Date(post.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-sm text-card-foreground line-clamp-3">{post.content}</p>

                                {post.media && post.media.length > 0 && (
                                    <div className="mt-2 overflow-hidden rounded-md">
                                        <img
                                            src={post.media[0]}
                                            alt="Post media"
                                            className="h-32 w-full object-cover"
                                        />
                                    </div>
                                )}

                                <div className="mt-3 flex items-center gap-4 text-muted-foreground">
                                    <button className="flex items-center gap-1 text-xs hover:text-foreground">
                                        <Heart className="size-3.5" />
                                        <span>{post.likes_count}</span>
                                    </button>
                                    <button className="flex items-center gap-1 text-xs hover:text-foreground">
                                        <MessageSquare className="size-3.5" />
                                        <span>{post.comments_count}</span>
                                    </button>
                                    <button className="flex items-center gap-1 text-xs hover:text-foreground ml-auto">
                                        <Share2 className="size-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="text-center">
                <Link
                    href={route("daynews.local-voices.index") as any}
                    className="inline-flex w-full justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground"
                >
                    Matters to you? Be heard. Join the conversation.
                </Link>
            </div>
        </div>
    );
}
