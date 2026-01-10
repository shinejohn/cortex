import { cn } from "@/lib/utils";
import { NewsCard } from "./NewsCard";

interface NewsListProps {
    articles: Array<{
        id: string;
        title: string;
        excerpt?: string;
        featured_image?: string;
        published_at?: string;
        author?: {
            id: string;
            name: string;
            avatar?: string;
        };
        category?: string;
        view_count?: number;
        slug?: string;
    }>;
    theme?: "daynews" | "downtownsguide" | "eventcity";
    className?: string;
    gridCols?: 1 | 2 | 3 | 4;
    showExcerpt?: boolean;
    showAuthor?: boolean;
    showDate?: boolean;
    showCategory?: boolean;
}

export function NewsList({
    articles,
    theme = "daynews",
    className,
    gridCols = 3,
    showExcerpt = true,
    showAuthor = true,
    showDate = true,
    showCategory = true,
}: NewsListProps) {
    const gridClasses = {
        1: "grid-cols-1",
        2: "grid-cols-1 md:grid-cols-2",
        3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
    };

    if (articles.length === 0) {
        return (
            <div className="rounded-lg border border-dashed p-8 text-center">
                <p className="text-muted-foreground">No articles found</p>
            </div>
        );
    }

    return (
        <div className={cn("grid gap-4", gridClasses[gridCols], className)}>
            {articles.map((article) => (
                <NewsCard
                    key={article.id}
                    article={article}
                    theme={theme}
                    showExcerpt={showExcerpt}
                    showAuthor={showAuthor}
                    showDate={showDate}
                    showCategory={showCategory}
                />
            ))}
        </div>
    );
}
