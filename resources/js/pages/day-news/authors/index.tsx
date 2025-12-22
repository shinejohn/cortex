import { SEO } from "@/components/common/seo";
import DayNewsHeader from "@/components/day-news/day-news-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LocationProvider } from "@/contexts/location-context";
import type { Auth } from "@/types";
import { router, useForm } from "@inertiajs/react";
import { Head, usePage } from "@inertiajs/react";
import { Award, Check, Search, Star, User } from "lucide-react";

interface Author {
    id: string;
    name: string;
    bio: string | null;
    avatar: string;
    author_slug: string | null;
    trust_score: number;
    trust_tier: string | null;
    is_verified_author: boolean;
    authored_day_news_posts_count: number;
}

interface AuthorsPageProps {
    auth?: Auth;
    authors: {
        data: Author[];
        links: any;
        meta: any;
    };
    filters: {
        search: string;
    };
}

export default function AuthorsIndex() {
    const { auth, authors, filters } = usePage<AuthorsPageProps>().props;

    const searchForm = useForm({
        search: filters.search || "",
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        searchForm.get("/authors", {
            preserveState: true,
            preserveScroll: true,
        });
    };

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

    return (
        <LocationProvider>
            <div className="min-h-screen bg-background">
                <Head title="Authors - Day News" />
                <SEO
                    type="website"
                    site="day-news"
                    data={{
                        title: "Authors - Day News",
                        description: "Meet our community authors",
                        url: "/authors",
                    }}
                />
                <DayNewsHeader auth={auth} />

                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold">Authors</h1>
                        <p className="mt-2 text-muted-foreground">Meet the writers behind the stories</p>
                    </div>

                    {/* Search */}
                    <form onSubmit={handleSearch} className="mb-6">
                        <div className="relative flex gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="text"
                                    value={searchForm.data.search}
                                    onChange={(e) => searchForm.setData("search", e.target.value)}
                                    placeholder="Search authors..."
                                    className="pl-10"
                                />
                            </div>
                            <Button type="submit" disabled={searchForm.processing}>
                                Search
                            </Button>
                        </div>
                    </form>

                    {/* Authors Grid */}
                    {authors.data.length === 0 ? (
                        <div className="py-12 text-center">
                            <User className="mx-auto mb-4 size-12 text-muted-foreground" />
                            <p className="text-muted-foreground">No authors found.</p>
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {authors.data.map((author) => (
                                <div
                                    key={author.id}
                                    className="cursor-pointer rounded-lg border bg-card p-6 transition-shadow hover:shadow-md"
                                    onClick={() => router.visit(`/authors/${author.author_slug || author.id}`)}
                                >
                                    <div className="mb-4 flex items-center gap-4">
                                        <img
                                            src={author.avatar}
                                            alt={author.name}
                                            className="size-16 rounded-full object-cover"
                                        />
                                        <div className="flex-1">
                                            <div className="mb-1 flex items-center gap-2">
                                                <h3 className="text-lg font-semibold">{author.name}</h3>
                                                {author.is_verified_author && (
                                                    <Check className="size-4 text-blue-500" />
                                                )}
                                            </div>
                                            {author.trust_tier && (
                                                <Badge className={getTierColor(author.trust_tier)}>
                                                    <Award className="mr-1 size-3" />
                                                    {author.trust_tier}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    {author.bio && (
                                        <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">{author.bio}</p>
                                    )}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1 text-sm">
                                            <Star className="size-4 text-yellow-500" />
                                            <span className="font-medium">{author.trust_score.toFixed(1)}</span>
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {author.authored_day_news_posts_count} articles
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {authors.links && authors.links.length > 3 && (
                        <div className="mt-8 flex justify-center gap-2">
                            {authors.links.map((link: any, index: number) => (
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
                </div>
            </div>
        </LocationProvider>
    );
}

