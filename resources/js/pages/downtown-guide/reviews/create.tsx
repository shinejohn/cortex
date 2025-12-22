import { Head, Link, useForm } from "@inertiajs/react";
import { ReviewForm } from "@/components/shared/reviews/ReviewForm";
import { ArrowLeftIcon, StarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { router } from "@inertiajs/react";

interface DowntownGuideReviewsCreateProps {
    business: {
        id: string;
        name: string;
        slug?: string;
    };
}

export default function DowntownGuideReviewsCreate({ business }: DowntownGuideReviewsCreateProps) {
    const { data, setData, post, processing, errors } = useForm({
        title: "",
        content: "",
        rating: 5,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("downtown-guide.reviews.store", business.slug), {
            preserveScroll: true,
            onSuccess: () => {
                router.visit(route("downtown-guide.businesses.show", business.slug));
            },
        });
    };

    return (
        <>
            <Head title={`Write a Review for ${business.name} - DowntownsGuide`} />
            
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
                {/* Header */}
                <div className="border-b-4 border-purple-600 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        <Link
                            href={route("downtown-guide.businesses.show", business.slug)}
                            className="mb-4 inline-flex items-center gap-2 text-purple-100 hover:text-white"
                        >
                            <ArrowLeftIcon className="h-4 w-4" />
                            <span>Back to Business</span>
                        </Link>
                        <h1 className="text-2xl font-bold text-white">
                            Write a Review for {business.name}
                        </h1>
                    </div>
                </div>

                <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="rounded-xl border-2 border-purple-200 bg-white p-6 shadow-lg">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Rating */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Your Rating *
                                </label>
                                <div className="flex items-center gap-2">
                                    {[1, 2, 3, 4, 5].map((rating) => (
                                        <button
                                            key={rating}
                                            type="button"
                                            onClick={() => setData("rating", rating)}
                                            className="focus:outline-none"
                                        >
                                            <StarIcon
                                                className={`h-8 w-8 transition-colors ${
                                                    rating <= data.rating
                                                        ? "fill-yellow-400 text-yellow-400"
                                                        : "text-gray-300 hover:text-yellow-300"
                                                }`}
                                            />
                                        </button>
                                    ))}
                                    <span className="ml-2 text-sm text-gray-600">
                                        {data.rating} {data.rating === 1 ? "star" : "stars"}
                                    </span>
                                </div>
                                {errors.rating && (
                                    <p className="mt-1 text-sm text-red-600">{errors.rating}</p>
                                )}
                            </div>

                            {/* Title */}
                            <div>
                                <label htmlFor="title" className="mb-2 block text-sm font-medium text-gray-700">
                                    Review Title (Optional)
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    value={data.title}
                                    onChange={(e) => setData("title", e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                                    placeholder="Summarize your experience"
                                />
                                {errors.title && (
                                    <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                                )}
                            </div>

                            {/* Content */}
                            <div>
                                <label htmlFor="content" className="mb-2 block text-sm font-medium text-gray-700">
                                    Your Review *
                                </label>
                                <textarea
                                    id="content"
                                    value={data.content}
                                    onChange={(e) => setData("content", e.target.value)}
                                    rows={6}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                                    placeholder="Share your experience with this business..."
                                    required
                                />
                                {errors.content && (
                                    <p className="mt-1 text-sm text-red-600">{errors.content}</p>
                                )}
                                <p className="mt-1 text-xs text-gray-500">
                                    Minimum 10 characters required
                                </p>
                            </div>

                            {/* Submit */}
                            <div className="flex items-center justify-end gap-4">
                                <Link
                                    href={route("downtown-guide.businesses.show", business.slug)}
                                    className="text-gray-600 hover:text-gray-900"
                                >
                                    Cancel
                                </Link>
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-purple-600 hover:bg-purple-700"
                                >
                                    {processing ? "Submitting..." : "Submit Review"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}

