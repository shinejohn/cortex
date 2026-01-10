import { SEO } from "@/components/common/seo";
import GoLocalVoicesLayout from "@/layouts/go-local-voices-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Auth } from "@/types";
import { router, useForm } from "@inertiajs/react";
import { Head, usePage } from "@inertiajs/react";
import { Mic, Upload, X } from "lucide-react";
import { useRef, useState } from "react";

interface CreatorRegisterPageProps {
    auth?: Auth;
    existingProfile?: {
        id: string;
        display_name: string;
        status: string;
    } | null;
    viewMode?: string;
}

export default function CreatorRegister() {
    const { auth, existingProfile } = usePage<CreatorRegisterPageProps>().props;
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [coverPreview, setCoverPreview] = useState<string | null>(null);

    const form = useForm({
        display_name: "",
        bio: "",
        avatar: null as File | null,
        cover_image: null as File | null,
        social_links: {
            twitter: "",
            instagram: "",
            facebook: "",
            youtube: "",
        },
    });

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            form.setData("avatar", file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            form.setData("cover_image", file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setCoverPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post("/register", {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    if (existingProfile) {
        return (
            <GoLocalVoicesLayout auth={auth}>
                <Head title="Creator Profile - Go Local Voices" />
                <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                    <div className="rounded-lg border border bg-card p-8 text-center shadow-sm">
                        <Mic className="mx-auto mb-4 h-12 w-12 text-purple-400" />
                        <h2 className="mb-2 text-2xl font-bold text-foreground">Creator Profile Already Exists</h2>
                        <p className="mb-4 text-muted-foreground">
                            Your creator profile "{existingProfile.display_name}" is {existingProfile.status}.
                        </p>
                        <Button
                            onClick={() => router.visit("/dashboard")}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        >
                            Go to Dashboard
                        </Button>
                    </div>
                </div>
            </GoLocalVoicesLayout>
        );
    }

    return (
        <GoLocalVoicesLayout auth={auth}>
            <Head title="Become a Creator - Go Local Voices" />
            <SEO
                type="website"
                site="go-local-voices"
                data={{
                    title: "Become a Creator - Go Local Voices",
                    description: "Register as a podcast creator on Go Local Voices",
                    url: "/register",
                }}
            />

            <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-white py-12">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            Become a Creator
                        </h1>
                        <p className="text-muted-foreground">Share your voice with the community</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 bg-card rounded-lg border border p-8 shadow-sm">
                        {/* Cover Image */}
                        <div>
                            <Label>Cover Image (Optional)</Label>
                            <div className="mt-2">
                                {coverPreview ? (
                                    <div className="relative">
                                        <img
                                            src={coverPreview}
                                            alt="Cover preview"
                                            className="h-48 w-full rounded-lg border border object-cover"
                                        />
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="sm"
                                            className="absolute right-2 top-2"
                                            onClick={() => {
                                                setCoverPreview(null);
                                                form.setData("cover_image", null);
                                                if (coverInputRef.current) {
                                                    coverInputRef.current.value = "";
                                                }
                                            }}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <div
                                        onClick={() => coverInputRef.current?.click()}
                                        className="flex h-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border transition-colors hover:border-purple-400 hover:bg-accent/50"
                                    >
                                        <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                                        <p className="text-sm text-muted-foreground">Upload cover image</p>
                                    </div>
                                )}
                                <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
                            </div>
                        </div>

                        {/* Avatar */}
                        <div>
                            <Label>Profile Picture (Optional)</Label>
                            <div className="mt-2">
                                {avatarPreview ? (
                                    <div className="relative inline-block">
                                        <img
                                            src={avatarPreview}
                                            alt="Avatar preview"
                                            className="h-32 w-32 rounded-full border-2 border object-cover"
                                        />
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="sm"
                                            className="absolute right-0 top-0"
                                            onClick={() => {
                                                setAvatarPreview(null);
                                                form.setData("avatar", null);
                                                if (avatarInputRef.current) {
                                                    avatarInputRef.current.value = "";
                                                }
                                            }}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <div
                                        onClick={() => avatarInputRef.current?.click()}
                                        className="flex h-32 w-32 cursor-pointer flex-col items-center justify-center rounded-full border-2 border-dashed border transition-colors hover:border-purple-400 hover:bg-accent/50"
                                    >
                                        <Upload className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                )}
                                <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                            </div>
                        </div>

                        {/* Display Name */}
                        <div>
                            <Label htmlFor="display_name">Display Name *</Label>
                            <Input
                                id="display_name"
                                value={form.data.display_name}
                                onChange={(e) => form.setData("display_name", e.target.value)}
                                className="mt-2 border focus:border-purple-500 focus:ring-purple-500"
                                required
                            />
                            {form.errors.display_name && <p className="mt-1 text-sm text-destructive">{form.errors.display_name}</p>}
                        </div>

                        {/* Bio */}
                        <div>
                            <Label htmlFor="bio">Bio</Label>
                            <Textarea
                                id="bio"
                                value={form.data.bio}
                                onChange={(e) => form.setData("bio", e.target.value)}
                                className="mt-2 border focus:border-purple-500 focus:ring-purple-500"
                                rows={6}
                                placeholder="Tell listeners about yourself and your podcast..."
                            />
                            {form.errors.bio && <p className="mt-1 text-sm text-destructive">{form.errors.bio}</p>}
                        </div>

                        {/* Social Links */}
                        <div className="rounded-lg border border bg-muted/50 p-4">
                            <h3 className="mb-4 font-semibold text-foreground">Social Media Links (Optional)</h3>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="twitter">Twitter/X</Label>
                                    <Input
                                        id="twitter"
                                        type="url"
                                        value={form.data.social_links.twitter}
                                        onChange={(e) =>
                                            form.setData("social_links", {
                                                ...form.data.social_links,
                                                twitter: e.target.value,
                                            })
                                        }
                                        className="mt-2 border focus:border-purple-500 focus:ring-purple-500"
                                        placeholder="https://twitter.com/yourhandle"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="instagram">Instagram</Label>
                                    <Input
                                        id="instagram"
                                        type="url"
                                        value={form.data.social_links.instagram}
                                        onChange={(e) =>
                                            form.setData("social_links", {
                                                ...form.data.social_links,
                                                instagram: e.target.value,
                                            })
                                        }
                                        className="mt-2 border focus:border-purple-500 focus:ring-purple-500"
                                        placeholder="https://instagram.com/yourhandle"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="facebook">Facebook</Label>
                                    <Input
                                        id="facebook"
                                        type="url"
                                        value={form.data.social_links.facebook}
                                        onChange={(e) =>
                                            form.setData("social_links", {
                                                ...form.data.social_links,
                                                facebook: e.target.value,
                                            })
                                        }
                                        className="mt-2 border focus:border-purple-500 focus:ring-purple-500"
                                        placeholder="https://facebook.com/yourpage"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="youtube">YouTube</Label>
                                    <Input
                                        id="youtube"
                                        type="url"
                                        value={form.data.social_links.youtube}
                                        onChange={(e) =>
                                            form.setData("social_links", {
                                                ...form.data.social_links,
                                                youtube: e.target.value,
                                            })
                                        }
                                        className="mt-2 border focus:border-purple-500 focus:ring-purple-500"
                                        placeholder="https://youtube.com/@yourchannel"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Error Display */}
                        {Object.keys(form.errors).length > 0 && (
                            <div className="rounded-lg border border-destructive/20 bg-red-50 p-4">
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
                            <Button
                                type="submit"
                                disabled={form.processing}
                                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                            >
                                <Mic className={`mr-2 h-4 w-4 ${form.processing ? "animate-spin" : ""}`} />
                                {form.processing ? "Submitting..." : "Submit Application"}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.visit("/")}
                                disabled={form.processing}
                                className="border"
                            >
                                Cancel
                            </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Your application will be reviewed before approval. You'll be notified once your creator profile is approved.
                        </p>
                    </form>
                </div>
            </div>
        </GoLocalVoicesLayout>
    );
}
