import { Head, usePage } from "@inertiajs/react";
import DOMPurify from "dompurify";
import { Calendar, ChevronLeft, ChevronRight, Eye, MapPin, User, Share2, Bookmark, MessageSquare, ThumbsUp, Heart, AlertCircle, Clock, Zap, Shield } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import Advertisement from "@/components/day-news/advertisement";
import { ArticleComments } from "@/components/day-news/article-comments";
import { TrustMetrics } from "@/components/day-news/trust-metrics";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { ArticleNavigation } from "@/components/day-news/article-navigation";
import { ArticleSidebar } from "@/components/day-news/article-sidebar";
import { MobileArticleBar } from "@/components/day-news/mobile-article-bar";
import { cn } from "@/lib/utils";
import type { Auth } from "@/types";
import DayNewsLayout from "@/layouts/day-news-layout";

interface Region {
    id: number;
    name: string;
}

interface Author {
    id: number;
    name: string;
    avatar?: string | null;
}

interface WriterAgent {
    id: string;
    name: string;
    avatar: string | null;
    bio: string | null;
}

interface Post {
    id: number;
    type: string;
    category: string | null;
    title: string;
    slug: string;
    content: string;
    excerpt: string | null;
    featured_image: string | null;
    view_count: number;
    published_at: string | null;
    author: Author | null;
    writer_agent: WriterAgent | null;
    regions: Region[];
    metadata?: {
        trust_metrics?: {
            fact_accuracy: number;
            bias_level: number;
            reliability: number;
            objectivity: number;
            source_quality: number;
            community_relevance: number;
            overall_score: number;
            analysis_rationale?: string;
        };
        [key: string]: unknown;
    };
}

interface ArticleShowProps {
    [key: string]: any;
    auth?: Auth;
    post: Post;
    comments: any[];
    commentsCount: number;
    previousPost?: { id: number; title: string; slug: string } | null;
    nextPost?: { id: number; title: string; slug: string } | null;
    relatedPosts: any[];
    trendingPosts: any[];
    upcomingEvents: any[];
}

export default function ArticleShow() {
    const { auth, post, comments, commentsCount, relatedPosts, trendingPosts, upcomingEvents } = usePage<ArticleShowProps>().props;
    const [readingProgress, setReadingProgress] = useState(0);

    const trustMetrics = useMemo(() => post.metadata?.trust_metrics || null, [post.metadata]);

    useEffect(() => {
        const updateReadingProgress = () => {
            const currentProgress = window.scrollY;
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            if (scrollHeight > 0) {
                setReadingProgress(Number((currentProgress / scrollHeight).toFixed(2)));
            }
        };

        window.addEventListener("scroll", updateReadingProgress);
        return () => window.removeEventListener("scroll", updateReadingProgress);
    }, []);

    const plainTextContent = useMemo(() => {
        return post.content.replace(/<[^>]*>/g, "").trim();
    }, [post.content]);

    return (
        <DayNewsLayout
            auth={auth}
            containerClassName="container mx-auto px-4 py-8 lg:px-8 pb-20 md:pb-0"
            seo={{
                type: "article",
                title: post.title,
                description: post.excerpt || undefined,
                image: post.featured_image,
                url: `/posts/${post.slug}`,
                publishedAt: post.published_at,
                author: post.author?.name || post.writer_agent?.name,
                section: post.category,
                articleBody: plainTextContent,
            }}
        >
            {/* Reading Progress Bar */}
            <div className="fixed top-0 left-0 right-0 z-[60] h-1 bg-muted">
                <div
                    className="h-full bg-primary transition-all duration-150"
                    style={{ width: `${Math.min(100, readingProgress * 100)}%` }}
                />
            </div>

            {/* Breadcrumbs */}
            <div className="mb-6">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/">Home</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        {post.category && (
                            <>
                                <BreadcrumbItem>
                                    <BreadcrumbLink href={`/category/${post.category.toLowerCase()}`}>
                                        {post.category}
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                            </>
                        )}
                        <BreadcrumbItem>
                            <BreadcrumbPage className="line-clamp-1">{post.title}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>

            <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
                {/* Left sidebar - Navigation (Hidden on mobile) */}
                <div className="hidden lg:col-span-2 lg:block">
                    <ArticleNavigation commentCount={commentsCount} relatedStories={relatedPosts} />
                </div>

                {/* Middle - Content */}
                <div className="lg:col-span-7">
                    <article>
                        {/* Header section */}
                        <header className="mb-8">
                            <div className="mb-4 flex flex-wrap items-center gap-3">
                                {post.category && (
                                    <Badge variant="default" className="uppercase tracking-[0.2em] text-[10px] font-black px-2.5 py-0.5">
                                        {post.category}
                                    </Badge>
                                )}
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-bold uppercase tracking-widest">
                                    <Clock className="size-3.5 text-primary" />
                                    <span>5 min read</span>
                                </div>
                            </div>

                            <h1 className="mb-6 font-display text-3xl font-black leading-[1.1] tracking-tight md:text-5xl text-zinc-900">
                                {post.title}
                            </h1>

                            {/* Author bar - inspired by spec-ui ArticleDetailPage enhanced author section */}
                            <div className="flex items-center justify-between rounded-xl border bg-card p-5 shadow-sm">
                                <div className="flex items-center gap-4">
                                    <Avatar className="size-12 border-2 border-white shadow-sm">
                                        <AvatarImage src={post.writer_agent?.avatar || post.author?.avatar || undefined} />
                                        <AvatarFallback className="bg-zinc-100 font-bold text-zinc-400">
                                            <User className="size-5" />
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="text-sm font-black text-zinc-900 leading-none mb-1">
                                            {post.writer_agent?.name || post.author?.name || "Staff Writer"}
                                        </div>
                                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                            {post.published_at ? new Date(post.published_at).toLocaleDateString(undefined, {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            }) : 'Recently Published'}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="icon" className="size-9 rounded-full hover:bg-primary/5 hover:text-primary transition-colors">
                                        <Share2 className="size-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="size-9 rounded-full hover:bg-primary/5 hover:text-primary transition-colors">
                                        <Bookmark className="size-4" />
                                    </Button>
                                </div>
                            </div>
                        </header>

                        {/* Featured image */}
                        {post.featured_image && (
                            <div className="mb-8 overflow-hidden rounded-2xl border shadow-lg shadow-zinc-200/50">
                                <img
                                    src={post.featured_image}
                                    alt={post.title}
                                    className="aspect-video w-full object-cover"
                                />
                            </div>
                        )}

                        {/* Content section */}
                        <div
                            className="prose prose-zinc prose-lg dark:prose-invert max-w-none
                            prose-headings:font-display prose-headings:font-black prose-headings:tracking-tight
                            prose-p:leading-[1.8] prose-a:text-primary prose-strong:text-foreground
                            prose-blockquote:border-l-4 prose-blockquote:border-primary/20 prose-blockquote:italic prose-blockquote:text-zinc-600"
                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
                        />

                        {/* AI Trust Metrics - inspired by spec-ui AI Quality Assessment panel */}
                        {trustMetrics && (
                            <div className="mt-12">
                                <TrustMetrics metrics={trustMetrics} />
                            </div>
                        )}

                        <Separator className="my-12" />

                        {/* Reactions Section - enhanced with spec-ui styling */}
                        <div className="mb-12 rounded-2xl border bg-card p-8 shadow-sm">
                            <h3 className="mb-8 text-center text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                                How do you feel about this story?
                            </h3>
                            <div className="flex flex-wrap justify-center gap-10">
                                {[
                                    { icon: ThumbsUp, label: "Helpful", count: 124, hoverColor: "group-hover:bg-blue-50 group-hover:border-blue-100", iconHover: "group-hover:text-blue-500" },
                                    { icon: Heart, label: "Love", count: 45, hoverColor: "group-hover:bg-red-50 group-hover:border-red-100", iconHover: "group-hover:text-red-500" },
                                    { icon: AlertCircle, label: "Surprising", count: 23, hoverColor: "group-hover:bg-yellow-50 group-hover:border-yellow-100", iconHover: "group-hover:text-yellow-500" }
                                ].map((reaction, i) => (
                                    <button key={i} className="group flex flex-col items-center gap-2">
                                        <div className={cn(
                                            "flex size-16 items-center justify-center rounded-full border bg-background shadow-sm transition-all group-hover:scale-110 group-hover:shadow-md",
                                            reaction.hoverColor
                                        )}>
                                            <reaction.icon className={cn("size-7 text-zinc-400 transition-colors", reaction.iconHover)} />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest">{reaction.label}</span>
                                        <span className="text-sm font-black text-muted-foreground">{reaction.count}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Comments section */}
                        <div id="comments" className="mt-12 pt-8 border-t">
                            <h2 className="mb-8 font-display text-2xl font-black tracking-tight">
                                Discussion ({commentsCount})
                            </h2>
                            <ArticleComments articleId={post.id} comments={comments} total={commentsCount} auth={auth} />
                        </div>
                    </article>
                </div>

                {/* Right sidebar - Discovery */}
                <div className="lg:col-span-3">
                    <ArticleSidebar trendingPosts={trendingPosts} upcomingEvents={upcomingEvents} commentCount={commentsCount} />
                </div>
            </div>

            {/* Related Articles Footer */}
            {relatedPosts.length > 0 && (
                <div className="mt-20 border-t pt-16">
                    <div className="mb-8 flex items-end justify-between">
                        <div>
                            <Badge variant="outline" className="mb-2 border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest px-2">
                                Keep Reading
                            </Badge>
                            <h2 className="font-display text-3xl font-black tracking-tight text-zinc-900">Related Stories</h2>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        {relatedPosts.slice(0, 3).map((rp) => (
                            <div key={rp.id} className="group relative aspect-[16/10] overflow-hidden rounded-2xl border shadow-sm hover:shadow-md transition-all">
                                <img src={rp.featured_image || ""} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-end">
                                    <h4 className="text-sm font-black text-white line-clamp-2">{rp.title}</h4>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Mobile Bottom Bar */}
            <MobileArticleBar
                commentCount={commentsCount}
                reactions={{ helpful: 124, love: 45, surprising: 23 }}
                onReaction={(type) => console.log(type)}
                onShare={() => console.log("share")}
                onSave={() => console.log("save")}
            />
        </DayNewsLayout>
    );
}
