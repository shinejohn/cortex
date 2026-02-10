import { Head, router, usePage } from "@inertiajs/react";
import { ArrowLeft, Award, Calendar, Check, Eye, FileText, Star, TrendingUp, User } from "lucide-react";
import { SEO } from "@/components/common/seo";
import DayNewsHeader from "@/components/day-news/day-news-header";
import NewsArticleCard from "@/components/day-news/news-article-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LocationProvider } from "@/contexts/location-context";
import type { Auth } from "@/types";

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
            return "bg-indigo-100 text-indigo-800";
        case "gold":
            return "bg-yellow-100 text-yellow-800";
        case "silver":
            return "bg-gray-200 text-gray-800";
        default:
            return "bg-amber-100 text-amber-800";
    }
};

export default function AuthorShow() {
    const { auth, author, articles, analytics } = usePage<AuthorShowPageProps>().props;

    return (
        <LocationProvider>
            <div className="min-h-screen bg-gray-50">
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

                <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    <button
                        onClick={() => router.visit("/authors")}
                        className="mb-4 flex items-center text-indigo-600 hover:underline"
                    >
                        <ArrowLeft className="mr-1 size-4" />
                        Back to Authors
                    </button>

                    {/* Author Header Card */}
                    <div className="mb-8 overflow-hidden rounded-lg border-none bg-white shadow-sm">
                        <div className="p-8">
                            <div className="flex flex-col items-center text-center md:flex-row md:text-left">
                                <div className="relative mb-4 md:mb-0 md:mr-8">
                                    <img
                                        src={author.avatar}
                                        alt={author.name}
                                        className="size-32 rounded-full object-cover"
                                    />
                                    {author.is_verified_author && (
                                        <div className="absolute bottom-2 right-2 rounded-full bg-blue-500 p-1.5 text-white shadow-md">
                                            <Check className="size-4" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="mb-2 flex items-center justify-center gap-2 md:justify-start">
                                        <h1 className="font-display text-3xl font-black tracking-tight text-gray-900">
                                            {author.name}
                                        </h1>
                                    </div>
                                    {author.trust_tier && (
                                        <Badge className={`mb-3 ${getTierColor(author.trust_tier)}`}>
                                            <Award className="mr-1 size-3" />
                                            {author.trust_tier}
                                        </Badge>
                                    )}
                                    <div className="mb-4 flex items-center justify-center gap-6 md:justify-start">
                                        <div className="flex items-center gap-1">
                                            <div className="text-2xl font-bold text-indigo-600">
                                                {author.trust_score.toFixed(1)}
                                            </div>
                                            <div className="flex">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Star
                                                        key={star}
                                                        className={`size-4 ${
                                                            star <= Math.round(author.trust_score)
                                                                ? "fill-current text-yellow-400"
                                                                : "text-gray-300"
                                                        }`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <div className="text-gray-600">
                                            {author.posts_count} {author.posts_count === 1 ? "article" : "articles"}
                                        </div>
                                    </div>
                                    {author.bio && <p className="text-gray-600">{author.bio}</p>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Analytics */}
                    {analytics.total_posts > 0 && (
                        <div className="mb-8 grid gap-4 md:grid-cols-4">
                            <div className="overflow-hidden rounded-lg border-none bg-white p-4 shadow-sm">
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Eye className="size-4" />
                                    Total Views
                                </div>
                                <div className="mt-1 text-2xl font-bold text-gray-900">
                                    {analytics.total_views.toLocaleString()}
                                </div>
                            </div>
                            <div className="overflow-hidden rounded-lg border-none bg-white p-4 shadow-sm">
                                <div className="text-sm text-gray-500">Total Comments</div>
                                <div className="mt-1 text-2xl font-bold text-gray-900">
                                    {analytics.total_comments.toLocaleString()}
                                </div>
                            </div>
                            <div className="overflow-hidden rounded-lg border-none bg-white p-4 shadow-sm">
                                <div className="text-sm text-gray-500">Total Likes</div>
                                <div className="mt-1 text-2xl font-bold text-gray-900">
                                    {analytics.total_likes.toLocaleString()}
                                </div>
                            </div>
                            <div className="overflow-hidden rounded-lg border-none bg-white p-4 shadow-sm">
                                <div className="text-sm text-gray-500">Avg Views/Post</div>
                                <div className="mt-1 text-2xl font-bold text-gray-900">
                                    {analytics.average_views_per_post.toLocaleString()}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Top Posts */}
                    {analytics.top_posts.length > 0 && (
                        <div className="mb-8">
                            <h2 className="mb-4 flex items-center gap-2 font-display text-2xl font-bold tracking-tight text-gray-900">
                                <TrendingUp className="size-6 text-indigo-600" />
                                Top Performing Articles
                            </h2>
                            <div className="space-y-2">
                                {analytics.top_posts.map((post) => (
                                    <div
                                        key={post.id}
                                        className="group flex cursor-pointer items-center justify-between overflow-hidden rounded-lg border-none bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                                        onClick={() => router.visit(`/posts/${post.slug}`)}
                                    >
                                        <div>
                                            <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600">
                                                {post.title}
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                                <Eye className="mr-1 inline size-3" />
                                                {post.views.toLocaleString()} views
                                                <span className="mx-1.5">-</span>
                                                <Calendar className="mr-1 inline size-3" />
                                                {new Date(post.published_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Articles */}
                    <div>
                        <h2 className="mb-4 flex items-center gap-2 font-display text-2xl font-bold tracking-tight text-gray-900">
                            <FileText className="size-6 text-indigo-600" />
                            Articles ({articles.meta?.total || articles.data.length})
                        </h2>
                        {articles.data.length === 0 ? (
                            <div className="overflow-hidden rounded-lg border-none bg-white p-12 text-center shadow-sm">
                                <User className="mx-auto mb-4 size-12 text-gray-400" />
                                <p className="text-gray-600">No articles yet.</p>
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
                                                className={link.active ? "bg-indigo-600 hover:bg-indigo-700" : ""}
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
