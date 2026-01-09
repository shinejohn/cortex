import { SEO } from "@/components/common/seo";
import DayNewsHeader from "@/components/day-news/day-news-header";
import NewsArticleCard from "@/components/day-news/news-article-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LocationProvider } from "@/contexts/location-context";
import type { Auth } from "@/types";
import { router } from "@inertiajs/react";
import { Head, usePage } from "@inertiajs/react";
import { Award, Check, FileText, Star, TrendingUp, User } from "lucide-react";

interface Author {
    id: string;
    name: string;
    bio: string | null;
    avatar: string;
    author_slug: string | null;
    trust_score: number;
    trust_tier: string | null;
    is_verified_author: boolean;
    posts_count: number;
}

interface Article {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    featured_image: string | null;
    published_at: string;
    view_count: number;
    regions: Array<{
        id: number;
        name: string;
    }>;
}

interface AuthorShowPageProps {
    auth?: Auth;
    author: Author;
    articles: {
        data: Article[];
        links: any;
        meta: any;
    };
    analytics: {
        total_posts: number;
        total_views: number;
        total_comments: number;
        total_likes: number;
        average_views_per_post: number;
        views_over_time: Record<string, number>;
        top_posts: Array<{
            id: string;
            title: string;
            slug: string;
            views: number;
            published_at: string;
        }>;
    };
}

const getTierColor = (tier: string | null) => {
    switch (tier) {
        case "platinum":
            return "bg-purple-100 text-purple-700";
        case "gold":
            return "bg-yellow-100 text-yellow-700";
        case "silver":
            return "bg-gray-100 text-gray-700";
        default:
            return "bg-orange-100 text-orange-700";
    }
};

export default function AuthorShow() {
    const { auth, author, articles, analytics } = usePage<AuthorShowPageProps>().props;

    return (
        <LocationProvider>
            <div className="min-h-screen bg-background">
                <Head title={`${author.name} - Author`} />
                <SEO
                    type="profile"
                    site="day-news"
                    data={{
                        title: `${author.name} - Author`,
                        description: author.bio || `Articles by ${author.name}`,
                        image: author.avatar,
                        url: `/authors/${author.author_slug || author.id}`,
                    }}
                />
                <DayNewsHeader auth={auth} />

                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="mb-4">
                        <Button variant="ghost" onClick={() => router.visit("/authors")}>
                            ← Back to Authors
                        </Button>
                    </div>

                    {/* Author Header */}
                    <div className="mb-8 rounded-lg border bg-card p-8">
                        <div className="flex flex-col items-center text-center md:flex-row md:text-left">
                            <img src={author.avatar} alt={author.name} className="mb-4 size-32 rounded-full object-cover md:mb-0 md:mr-8" />
                            <div className="flex-1">
                                <div className="mb-2 flex items-center justify-center gap-2 md:justify-start">
                                    <h1 className="text-3xl font-bold">{author.name}</h1>
                                    {author.is_verified_author && <Check className="size-6 text-blue-500" />}
                                </div>
                                {author.trust_tier && (
                                    <Badge className={`mb-2 ${getTierColor(author.trust_tier)}`}>
                                        <Award className="mr-1 size-3" />
                                        {author.trust_tier}
                                    </Badge>
                                )}
                                <div className="mb-4 flex items-center justify-center gap-4 md:justify-start">
                                    <div className="flex items-center gap-1">
                                        <Star className="size-4 text-yellow-500" />
                                        <span className="font-medium">{author.trust_score.toFixed(1)}</span>
                                    </div>
                                    <div className="text-muted-foreground">
                                        {author.posts_count} {author.posts_count === 1 ? "article" : "articles"}
                                    </div>
                                </div>
                                {author.bio && <p className="text-muted-foreground">{author.bio}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Analytics */}
                    {analytics.total_posts > 0 && (
                        <div className="mb-8 grid gap-4 md:grid-cols-4">
                            <div className="rounded-lg border bg-card p-4">
                                <div className="text-sm text-muted-foreground">Total Views</div>
                                <div className="text-2xl font-bold">{analytics.total_views.toLocaleString()}</div>
                            </div>
                            <div className="rounded-lg border bg-card p-4">
                                <div className="text-sm text-muted-foreground">Total Comments</div>
                                <div className="text-2xl font-bold">{analytics.total_comments.toLocaleString()}</div>
                            </div>
                            <div className="rounded-lg border bg-card p-4">
                                <div className="text-sm text-muted-foreground">Total Likes</div>
                                <div className="text-2xl font-bold">{analytics.total_likes.toLocaleString()}</div>
                            </div>
                            <div className="rounded-lg border bg-card p-4">
                                <div className="text-sm text-muted-foreground">Avg Views/Post</div>
                                <div className="text-2xl font-bold">{analytics.average_views_per_post.toLocaleString()}</div>
                            </div>
                        </div>
                    )}

                    {/* Top Posts */}
                    {analytics.top_posts.length > 0 && (
                        <div className="mb-8">
                            <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold">
                                <TrendingUp className="size-6" />
                                Top Performing Articles
                            </h2>
                            <div className="space-y-2">
                                {analytics.top_posts.map((post) => (
                                    <div
                                        key={post.id}
                                        className="flex cursor-pointer items-center justify-between rounded-lg border bg-card p-4 transition-shadow hover:shadow-md"
                                        onClick={() => router.visit(`/posts/${post.slug}`)}
                                    >
                                        <div>
                                            <h3 className="font-semibold">{post.title}</h3>
                                            <p className="text-sm text-muted-foreground">
                                                {post.views.toLocaleString()} views • {new Date(post.published_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Articles */}
                    <div>
                        <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold">
                            <FileText className="size-6" />
                            Articles ({articles.meta.total || articles.data.length})
                        </h2>
                        {articles.data.length === 0 ? (
                            <div className="py-12 text-center">
                                <User className="mx-auto mb-4 size-12 text-muted-foreground" />
                                <p className="text-muted-foreground">No articles yet.</p>
                            </div>
                        ) : (
                            <>
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {articles.data.map((article) => (
                                        <NewsArticleCard key={article.id} article={article} />
                                    ))}
                                </div>

                                {/* Pagination */}
                                {articles.links && articles.links.length > 3 && (
                                    <div className="mt-8 flex justify-center gap-2">
                                        {articles.links.map((link: any, index: number) => (
                                            <Button
                                                key={index}
                                                variant={link.active ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => link.url && router.visit(link.url)}
                                                disabled={!link.url}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </LocationProvider>
    );
}
