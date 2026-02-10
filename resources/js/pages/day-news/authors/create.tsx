import { Head, router, useForm, usePage } from "@inertiajs/react";
import { ChevronRight, User } from "lucide-react";
import { SEO } from "@/components/common/seo";
import DayNewsHeader from "@/components/day-news/day-news-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LocationProvider } from "@/contexts/location-context";
import type { Auth } from "@/types";

interface AuthorCreatePageProps {
    auth?: Auth;
}

export default function AuthorCreate() {
    const { auth } = usePage<AuthorCreatePageProps>().props;

    const form = useForm({
        bio: "",
        author_slug: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post("/authors", {
            preserveScroll: true,
        });
    };

    return (
        <LocationProvider>
            <div className="min-h-screen bg-gray-50">
                <Head title="Create Author Profile - Day News" />
                <SEO
                    type="website"
                    site="day-news"
                    data={{
                        title: "Create Author Profile - Day News",
                        description: "Set up your author profile",
                        url: "/authors/create",
                    }}
                />
                <DayNewsHeader auth={auth} />

                <div className="container mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
                    {/* Page Header */}
                    <div className="mb-8">
                        <h1 className="font-display text-2xl font-black tracking-tight text-gray-900">
                            Create Author Profile
                        </h1>
                        <p className="mt-1 text-gray-600">
                            Set up your author profile to start publishing content
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Profile Details Card */}
                        <div className="overflow-hidden rounded-lg border-none bg-white p-6 shadow-sm">
                            <h2 className="mb-4 text-lg font-semibold text-gray-900">Profile Details</h2>
                            <div className="space-y-5">
                                {/* Bio */}
                                <div>
                                    <Label htmlFor="bio" className="text-sm font-medium text-gray-700">
                                        Bio
                                    </Label>
                                    <Textarea
                                        id="bio"
                                        value={form.data.bio}
                                        onChange={(e) => form.setData("bio", e.target.value)}
                                        className="mt-2 w-full rounded-md border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                                        rows={6}
                                        placeholder="Tell readers about yourself..."
                                    />
                                    {form.errors.bio && (
                                        <p className="mt-1 text-sm text-red-600">{form.errors.bio}</p>
                                    )}
                                </div>

                                {/* Author Slug */}
                                <div>
                                    <Label htmlFor="author_slug" className="text-sm font-medium text-gray-700">
                                        Author URL Slug (Optional)
                                    </Label>
                                    <Input
                                        id="author_slug"
                                        value={form.data.author_slug}
                                        onChange={(e) =>
                                            form.setData("author_slug", e.target.value.toLowerCase().replace(/\s+/g, "-"))
                                        }
                                        className="mt-2 w-full rounded-md border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                                        placeholder="e.g., john-smith"
                                    />
                                    <p className="mt-1 text-sm text-gray-500">
                                        Leave blank to auto-generate from your name. Only letters, numbers, dashes, and
                                        underscores.
                                    </p>
                                    {form.errors.author_slug && (
                                        <p className="mt-1 text-sm text-red-600">{form.errors.author_slug}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Error Display */}
                        {Object.keys(form.errors).length > 0 && (
                            <div className="overflow-hidden rounded-lg border border-red-200 bg-red-50 p-4">
                                <p className="mb-2 font-semibold text-red-700">Please fix the following errors:</p>
                                <ul className="list-inside list-disc space-y-1 text-sm text-red-600">
                                    {Object.entries(form.errors).map(([field, error]) => (
                                        <li key={field}>
                                            <strong>{field}:</strong> {error as string}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Submit */}
                        <div className="flex gap-4">
                            <Button
                                type="submit"
                                disabled={form.processing}
                                className="bg-indigo-600 text-white hover:bg-indigo-700"
                            >
                                <User className={`mr-2 size-4 ${form.processing ? "animate-spin" : ""}`} />
                                {form.processing ? "Creating..." : "Create Profile"}
                                <ChevronRight className="ml-1 size-4" />
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.visit("/authors")}
                                disabled={form.processing}
                                className="border-gray-300 text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </LocationProvider>
    );
}
