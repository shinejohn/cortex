import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { SearchIcon, XIcon } from "lucide-react";
import { useState } from "react";

interface SearchBarProps {
    placeholder?: string;
    onSearch: (query: string) => void;
    className?: string;
}

export function SearchBar({ placeholder = "Search performers, genres, or locations...", onSearch, className }: SearchBarProps) {
    const [query, setQuery] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(query);
    };

    const handleClear = () => {
        setQuery("");
        onSearch("");
    };

    return (
        <div className={cn("w-full max-w-2xl mx-auto", className)}>
            <form onSubmit={handleSubmit} className="relative">
                <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder={placeholder}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="pl-10 pr-10 h-12 text-base"
                    />
                    {query && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={handleClear}
                            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground"
                        >
                            <XIcon className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </form>
        </div>
    );
}
