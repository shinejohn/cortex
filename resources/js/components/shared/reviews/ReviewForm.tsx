import { useForm } from "@inertiajs/react";
import { StarIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

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

    return (
        <div className={cn("overflow-hidden rounded-xl border-none bg-card p-6 shadow-sm", className)}>
            <h3 className="mb-6 font-display text-xl font-black tracking-tight text-foreground">Write a Review</h3>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Rating */}
                <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">Your Rating</Label>
                    <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, index) => {
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
                                    className="p-0.5 transition-transform hover:scale-110 focus:outline-none"
                                >
                                    <StarIcon
                                        className={cn(
                                            "size-8 transition-colors",
                                            isFilled ? "fill-yellow-400 text-yellow-400" : "fill-muted text-muted-foreground",
                                        )}
                                    />
                                </button>
                            );
                        })}
                        {rating > 0 && (
                            <span className="ml-2 text-sm text-muted-foreground">
                                {rating} star{rating !== 1 ? "s" : ""}
                            </span>
                        )}
                    </div>
                    {errors.rating && <p className="text-sm text-destructive">{errors.rating}</p>}
                </div>

                {/* Title */}
                <div className="space-y-2">
                    <Label htmlFor="title" className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">
                        Title (Optional)
                    </Label>
                    <Input
                        id="title"
                        value={data.title}
                        onChange={(e) => setData("title", e.target.value)}
                        placeholder="Summarize your experience"
                        className="rounded-lg"
                    />
                    {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
                </div>

                {/* Content */}
                <div className="space-y-2">
                    <Label htmlFor="content" className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">
                        Your Review
                    </Label>
                    <Textarea
                        id="content"
                        value={data.content}
                        onChange={(e) => setData("content", e.target.value)}
                        placeholder="Share your experience..."
                        rows={5}
                        required
                        className="rounded-lg"
                    />
                    {errors.content && <p className="text-sm text-destructive">{errors.content}</p>}
                    <p className="text-xs text-muted-foreground">Minimum 10 characters</p>
                </div>

                <Button type="submit" disabled={processing || !rating || !data.content} className="rounded-lg">
                    {processing ? "Submitting..." : "Submit Review"}
                </Button>
            </form>
        </div>
    );
}
