import { Head, router, useForm, usePage } from "@inertiajs/react";
import { Pencil, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { SEO } from "@/components/common/seo";
import DayNewsHeader from "@/components/day-news/day-news-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LocationProvider } from "@/contexts/location-context";
import type { Auth } from "@/types";

interface EditProfilePageProps {
    auth?: Auth;
    profile: {
        id: string;
        display_name: string;
        bio: string | null;
        avatar: string | null;
        cover_image: string | null;
        social_links: {
            twitter?: string;
            instagram?: string;
            facebook?: string;
            youtube?: string;
        };
    };
    updateProfileUrl: string;
    viewMode?: string;
}

export default function EditProfile() {
    const { auth, profile, updateProfileUrl } = usePage<EditProfilePageProps>().props;
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatar);
    const [coverPreview, setCoverPreview] = useState<string | null>(profile.cover_image);

    const form = useForm({
        display_name: profile.display_name,
        bio: profile.bio ?? "",
        avatar: null as File | null,
        cover_image: null as File | null,
        social_links: {
            twitter: profile.social_links?.twitter ?? "",
            instagram: profile.social_links?.instagram ?? "",
            facebook: profile.social_links?.facebook ?? "",
            youtube: profile.social_links?.youtube ?? "",
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
        form.transform((data) => ({
            ...data,
            _method: "patch",
        })).post(updateProfileUrl, {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    return (
        <LocationProvider>
            <div className="min-h-screen bg-background">
                <Head title="Edit Profile - Local Voices" />
                <SEO
                    type="website"
                    site="day-news"
                    data={{
                        title: "Edit Profile - Local Voices",
                        description: "Update your creator profile",
                        url: "/local-voices/creator/edit-profile",
                    }}
                />
                <DayNewsHeader auth={auth} />

                <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="mb-4">
                        <Button
                            variant="ghost"
                            onClick={() => router.visit("/local-voices/dashboard")}
                        >
                            ← Back to Dashboard
                        </Button>
                    </div>

                    <h1 className="mb-8 text-4xl font-bold">Edit Profile</h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <Label>Cover Image (Optional)</Label>
                            <div className="mt-2">
                                {coverPreview ? (
                                    <div className="relative">
                                        <img src={coverPreview} alt="Cover preview" className="h-48 w-full rounded-lg border object-cover" />
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
                                            <X className="size-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <div
                                        onClick={() => coverInputRef.current?.click()}
                                        className="flex h-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 transition-colors hover:border-muted-foreground/50"
                                    >
                                        <Upload className="mb-2 size-8 text-muted-foreground" />
                                        <p className="text-sm text-muted-foreground">Upload cover image</p>
                                    </div>
                                )}
                                <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
                            </div>
                        </div>

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
                                            <X className="size-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <div
                                        onClick={() => avatarInputRef.current?.click()}
                                        className="flex h-32 w-32 cursor-pointer flex-col items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/25 transition-colors hover:border-muted-foreground/50"
                                    >
                                        <Upload className="size-8 text-muted-foreground" />
                                    </div>
                                )}
                                <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="display_name">Display Name *</Label>
                            <Input
                                id="display_name"
                                value={form.data.display_name}
                                onChange={(e) => form.setData("display_name", e.target.value)}
                                className="mt-2"
                                required
                            />
                            {form.errors.display_name && <p className="mt-1 text-sm text-destructive">{form.errors.display_name}</p>}
                        </div>

                        <div>
                            <Label htmlFor="bio">Bio</Label>
                            <Textarea
                                id="bio"
                                value={form.data.bio}
                                onChange={(e) => form.setData("bio", e.target.value)}
                                className="mt-2"
                                rows={6}
                                placeholder="Tell listeners about yourself and your podcast..."
                            />
                            {form.errors.bio && <p className="mt-1 text-sm text-destructive">{form.errors.bio}</p>}
                        </div>

                        <div className="rounded-lg border bg-muted/50 p-4">
                            <h3 className="mb-4 font-semibold">Social Media Links (Optional)</h3>
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
                                        className="mt-2"
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
                                        className="mt-2"
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
                                        className="mt-2"
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
                                        className="mt-2"
                                        placeholder="https://youtube.com/@yourchannel"
                                    />
                                </div>
                            </div>
                        </div>

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

                        <div className="flex gap-4">
                            <Button type="submit" disabled={form.processing}>
                                <Pencil className={`mr-2 size-4 ${form.processing ? "animate-spin" : ""}`} />
                                {form.processing ? "Saving..." : "Save Changes"}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.visit("/local-voices/dashboard")}
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
