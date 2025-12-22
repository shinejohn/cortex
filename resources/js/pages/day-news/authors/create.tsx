import { SEO } from "@/components/common/seo";
import DayNewsHeader from "@/components/day-news/day-news-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LocationProvider } from "@/contexts/location-context";
import type { Auth } from "@/types";
import { router, useForm } from "@inertiajs/react";
import { Head, usePage } from "@inertiajs/react";
import { User } from "lucide-react";

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
            <div className="min-h-screen bg-background">
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

                <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
                    <h1 className="mb-8 text-4xl font-bold">Create Author Profile</h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Bio */}
                        <div>
                            <Label htmlFor="bio">Bio</Label>
                            <Textarea
                                id="bio"
                                value={form.data.bio}
                                onChange={(e) => form.setData("bio", e.target.value)}
                                className="mt-2"
                                rows={6}
                                placeholder="Tell readers about yourself..."
                            />
                            {form.errors.bio && (
                                <p className="mt-1 text-sm text-destructive">{form.errors.bio}</p>
                            )}
                        </div>

                        {/* Author Slug */}
                        <div>
                            <Label htmlFor="author_slug">Author URL Slug (Optional)</Label>
                            <Input
                                id="author_slug"
                                value={form.data.author_slug}
                                onChange={(e) => form.setData("author_slug", e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                                className="mt-2"
                                placeholder="e.g., john-smith"
                            />
                            <p className="mt-1 text-sm text-muted-foreground">
                                Leave blank to auto-generate from your name. Only letters, numbers, dashes, and underscores.
                            </p>
                            {form.errors.author_slug && (
                                <p className="mt-1 text-sm text-destructive">{form.errors.author_slug}</p>
                            )}
                        </div>

                        {/* Error Display */}
                        {Object.keys(form.errors).length > 0 && (
                            <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
                                <p className="mb-2 font-semibold text-destructive">Please fix the following errors:</p>
                                <ul className="list-disc list-inside space-y-1 text-sm text-destructive">
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
                            <Button type="submit" disabled={form.processing}>
                                <User className={`mr-2 size-4 ${form.processing ? "animate-spin" : ""}`} />
                                {form.processing ? "Creating..." : "Create Profile"}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.visit("/authors")}
                                disabled={form.processing}
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

