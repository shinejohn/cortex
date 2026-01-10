import { router } from "@inertiajs/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PaginationProps {
    currentPage: number;
    lastPage: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
}

export function Pagination({ currentPage, lastPage, links }: PaginationProps) {
    const handlePageClick = (url: string | null) => {
        if (url) {
            router.get(
                url,
                {},
                {
                    preserveState: true,
                    preserveScroll: true,
                },
            );
        }
    };

    return (
        <div className="flex items-center justify-center gap-2">
            {/* Previous button */}
            <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => {
                    const prevLink = links.find((link) => link.label === "&laquo; Previous" || link.label === "Previous");
                    if (prevLink?.url) {
                        handlePageClick(prevLink.url);
                    }
                }}
            >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous page</span>
            </Button>

            {/* Page numbers */}
            {links
                .filter((link) => {
                    // Show page numbers, not "Previous" or "Next"
                    const label = link.label.trim();
                    return (
                        label !== "&laquo; Previous" &&
                        label !== "Previous" &&
                        label !== "Next" &&
                        label !== "Next &raquo;" &&
                        label !== "..." &&
                        !isNaN(Number(label))
                    );
                })
                .map((link, index) => (
                    <Button
                        key={index}
                        variant={link.active ? "default" : "outline"}
                        size="sm"
                        disabled={!link.url}
                        onClick={() => handlePageClick(link.url)}
                        className={cn(link.active && "bg-primary text-primary-foreground")}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ))}

            {/* Next button */}
            <Button
                variant="outline"
                size="sm"
                disabled={currentPage === lastPage}
                onClick={() => {
                    const nextLink = links.find((link) => link.label === "Next &raquo;" || link.label === "Next");
                    if (nextLink?.url) {
                        handlePageClick(nextLink.url);
                    }
                }}
            >
                <span className="sr-only">Next page</span>
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
    );
}
