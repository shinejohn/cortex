import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { StarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useForm } from "@inertiajs/react";

interface ReviewFormProps {
    onSubmit: (data: { title?: string; content: string; rating: number }) => void;
    theme?: "daynews" | "downtownsguide" | "eventcity";
    className?: string;
    initialRating?: number;
}

export function ReviewForm({ onSubmit, theme = "downtownsguide", className, initialRating = 0 }: ReviewFormProps) {
    const [rating, setRating] = useState(initialRating);
    const [hoveredRating, setHoveredRating] = useState(0);
    const { data, setData, processing, errors, reset } = useForm({
        title: "",
        content: "",
        rating: initialRating,
    });

    const themeColors = {
        daynews: {
            star: "text-blue-500",
            starFilled: "fill-blue-500 text-blue-500",
        },
        downtownsguide: {
            star: "text-purple-500",
            starFilled: "fill-purple-500 text-purple-500",
        },
        eventcity: {
            star: "text-indigo-500",
            starFilled: "fill-indigo-500 text-indigo-500",
        },
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            title: data.title || undefined,
            content: data.content,
            rating: rating || data.rating,
        });
        reset();
        setRating(0);
    };

    const renderStars = () => {
        return Array.from({ length: 5 }).map((_, index) => {
            const starValue = index + 1;
            const isFilled = starValue <= (hoveredRating || rating);

            return (
                <button
                    key={index}
                    type="button"
                    onClick={() => {
                        setRating(starValue);
                        setData("rating", starValue);
                    }}
                    onMouseEnter={() => setHoveredRating(starValue)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="focus:outline-none"
                >
                    <StarIcon className={cn("h-6 w-6 transition-colors", isFilled ? themeColors[theme].starFilled : "text-gray-300")} />
                </button>
            );
        });
    };

    return (
        <form onSubmit={handleSubmit} className={cn("space-y-4", className)}>
            <div className="space-y-2">
                <Label htmlFor="rating">Rating *</Label>
                <div className="flex items-center gap-2">
                    {renderStars()}
                    {rating > 0 && <span className="text-sm text-muted-foreground">{rating} out of 5</span>}
                </div>
                {errors.rating && <p className="text-sm text-red-600">{errors.rating}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="title">Title (Optional)</Label>
                <Input id="title" value={data.title} onChange={(e) => setData("title", e.target.value)} placeholder="Give your review a title" />
                {errors.title && <p className="text-sm text-red-600">{errors.title}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="content">Review *</Label>
                <Textarea
                    id="content"
                    value={data.content}
                    onChange={(e) => setData("content", e.target.value)}
                    placeholder="Share your experience..."
                    rows={5}
                    required
                />
                {errors.content && <p className="text-sm text-red-600">{errors.content}</p>}
            </div>

            <Button type="submit" disabled={processing || !rating || !data.content}>
                {processing ? "Submitting..." : "Submit Review"}
            </Button>
        </form>
    );
}
