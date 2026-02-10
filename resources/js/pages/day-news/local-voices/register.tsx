import { Head, router, useForm, usePage } from "@inertiajs/react";
import { ArrowLeft, ImagePlus, Mic, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { SEO } from "@/components/common/seo";
import DayNewsHeader from "@/components/day-news/day-news-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LocationProvider } from "@/contexts/location-context";
import type { Auth } from "@/types";

interface CreatorRegisterPageProps {
    auth?: Auth;
    existingProfile?: {
        id: string;
        display_name: string;
        status: string;
    } | null;
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
        form.post(route("daynews.local-voices.register.store") as any, {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    // Existing profile early return
    if (existingProfile) {
        return (
            <LocationProvider>
                <div className="min-h-screen bg-[#F8F9FB]">
                    <Head title="Creator Profile - Local Voices" />
                    <DayNewsHeader auth={auth} />
                    <div className="container mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
                        <div className="overflow-hidden rounded-2xl border-none bg-white p-12 text-center shadow-sm">
                            <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-blue-50">
                                <Mic className="size-8 text-indigo-400" />
                            </div>
                            <h2 className="mb-3 font-display text-2xl font-black tracking-tight text-zinc-900">
                                Creator Profile Already Exists
                            </h2>
                            <p className="mx-auto mb-6 max-w-md text-zinc-500">
                                Your creator profile "{existingProfile.display_name}" is currently{" "}
                                <span className="font-bold">{existingProfile.status}</span>.
                            </p>
                            <Button
                                onClick={() => router.visit(route("daynews.local-voices.dashboard") as any)}
                                className="rounded-xl font-bold shadow-lg shadow-primary/20"
                            >
                                Go to Dashboard
                            </Button>
                        </div>
                    </div>
                </div>
            </LocationProvider>
        );
    }

    return (
        <LocationProvider>
            <div className="min-h-screen bg-[#F8F9FB]">
                <Head title="Become a Creator - Local Voices" />
                <SEO
                    type="website"
                    site="day-news"
                    data={{
                        title: "Become a Creator - Local Voices",
                        description: "Register as a podcast creator",
                        url: route("daynews.local-voices.register") as any,
                    }}
                />
                <DayNewsHeader auth={auth} />

                <div className="container mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
                    {/* Back navigation */}
                    <div className="mb-6">
                        <button
                            onClick={() => router.visit(route("daynews.local-voices.index") as any)}
                            className="group inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900"
                        >
                            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
                            Back to Local Voices
                        </button>
                    </div>

                    {/* Page heading */}
                    <div className="mb-8">
                        <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary">Creator Registration</p>
                        <h1 className="font-display text-4xl font-black tracking-tight text-zinc-900">Become a Creator</h1>
                        <p className="mt-3 max-w-xl text-zinc-500">
                            Share your voice with the community. Fill out the form below to apply as a podcast creator.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Cover Image */}
                        <div className="overflow-hidden rounded-2xl border-none bg-white p-6 shadow-sm sm:p-8">
                            <h2 className="mb-4 font-display text-lg font-black tracking-tight text-zinc-900">Cover Image</h2>
                            <p className="mb-4 text-sm text-zinc-400">This banner will appear at the top of your creator profile.</p>
                            <div>
                                {coverPreview ? (
                                    <div className="relative overflow-hidden rounded-2xl">
                                        <img src={coverPreview} alt="Cover preview" className="h-48 w-full object-cover" />
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="sm"
                                            className="absolute right-3 top-3 rounded-full shadow-md"
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
                                        className="flex h-40 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50 transition-all hover:border-primary/40 hover:bg-primary/5"
                                    >
                                        <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-primary/10">
                                            <ImagePlus className="size-5 text-primary" />
                                        </div>
                                        <p className="font-medium text-zinc-700">Upload cover image</p>
                                        <p className="mt-1 text-sm text-zinc-400">Recommended: 1200 x 400px</p>
                                    </div>
                                )}
                                <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
                            </div>
                        </div>

                        {/* Avatar + Display Name */}
                        <div className="overflow-hidden rounded-2xl border-none bg-white p-6 shadow-sm sm:p-8">
                            <h2 className="mb-6 font-display text-lg font-black tracking-tight text-zinc-900">Profile</h2>

                            <div className="mb-6 flex flex-col items-start gap-6 sm:flex-row">
                                {/* Avatar upload */}
                                <div className="shrink-0">
                                    <Label className="mb-2 block text-sm font-bold text-zinc-700">Profile Picture</Label>
                                    {avatarPreview ? (
                                        <div className="relative inline-block">
                                            <img src={avatarPreview} alt="Avatar preview" className="size-32 rounded-full object-cover ring-4 ring-zinc-100" />
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                className="absolute right-0 top-0 rounded-full shadow-md"
                                                onClick={() => {
                                                    setAvatarPreview(null);
                                                    form.setData("avatar", null);
                                                    if (avatarInputRef.current) {
                                                        avatarInputRef.current.value = "";
                                                    }
                                                }}
                                            >
                                                <X className="size-3" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <div
                                            onClick={() => avatarInputRef.current?.click()}
                                            className="flex size-32 cursor-pointer flex-col items-center justify-center rounded-full border-2 border-dashed border-zinc-200 bg-zinc-50 transition-all hover:border-primary/40 hover:bg-primary/5"
                                        >
                                            <Upload className="size-6 text-zinc-400" />
                                        </div>
                                    )}
                                    <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                                </div>

                                {/* Display Name + Bio */}
                                <div className="flex-1 space-y-6">
                                    <div>
                                        <Label htmlFor="display_name" className="text-sm font-bold text-zinc-700">
                                            Display Name <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="display_name"
                                            value={form.data.display_name}
                                            onChange={(e) => form.setData("display_name", e.target.value)}
                                            className="mt-2 h-12 border-none bg-zinc-50 ring-1 ring-zinc-200 focus:ring-2 focus:ring-primary"
                                            placeholder="Your creator name"
                                            required
                                        />
                                        {form.errors.display_name && (
                                            <p className="mt-1.5 text-sm font-medium text-destructive">{form.errors.display_name}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="bio" className="text-sm font-bold text-zinc-700">
                                            Bio
                                        </Label>
                                        <Textarea
                                            id="bio"
                                            value={form.data.bio}
                                            onChange={(e) => form.setData("bio", e.target.value)}
                                            className="mt-2 min-h-[120px] border-none bg-zinc-50 ring-1 ring-zinc-200 focus:ring-2 focus:ring-primary"
                                            rows={6}
                                            placeholder="Tell listeners about yourself and your podcast..."
                                        />
                                        {form.errors.bio && (
                                            <p className="mt-1.5 text-sm font-medium text-destructive">{form.errors.bio}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Social Links */}
                        <div className="overflow-hidden rounded-2xl border-none bg-white p-6 shadow-sm sm:p-8">
                            <h2 className="mb-2 font-display text-lg font-black tracking-tight text-zinc-900">Social Media Links</h2>
                            <p className="mb-6 text-sm text-zinc-400">Optional - help listeners find you elsewhere on the web.</p>

                            <div className="grid gap-6 sm:grid-cols-2">
                                <div>
                                    <Label htmlFor="twitter" className="text-sm font-bold text-zinc-700">
                                        Twitter/X
                                    </Label>
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
                                        className="mt-2 h-12 border-none bg-zinc-50 ring-1 ring-zinc-200 focus:ring-2 focus:ring-primary"
                                        placeholder="https://twitter.com/yourhandle"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="instagram" className="text-sm font-bold text-zinc-700">
                                        Instagram
                                    </Label>
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
                                        className="mt-2 h-12 border-none bg-zinc-50 ring-1 ring-zinc-200 focus:ring-2 focus:ring-primary"
                                        placeholder="https://instagram.com/yourhandle"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="facebook" className="text-sm font-bold text-zinc-700">
                                        Facebook
                                    </Label>
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
                                        className="mt-2 h-12 border-none bg-zinc-50 ring-1 ring-zinc-200 focus:ring-2 focus:ring-primary"
                                        placeholder="https://facebook.com/yourpage"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="youtube" className="text-sm font-bold text-zinc-700">
                                        YouTube
                                    </Label>
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
                                        className="mt-2 h-12 border-none bg-zinc-50 ring-1 ring-zinc-200 focus:ring-2 focus:ring-primary"
                                        placeholder="https://youtube.com/@yourchannel"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Error Display */}
                        {Object.keys(form.errors).length > 0 && (
                            <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-5">
                                <p className="mb-2 font-bold text-destructive">Please fix the following errors:</p>
                                <ul className="list-inside list-disc space-y-1 text-sm text-destructive">
                                    {Object.entries(form.errors).map(([field, error]) => (
                                        <li key={field}>
                                            <strong>{field}:</strong> {error as string}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Submit */}
                        <div className="flex items-center gap-4">
                            <Button
                                type="submit"
                                disabled={form.processing}
                                className="rounded-xl px-8 py-3 font-bold shadow-lg shadow-primary/20"
                            >
                                <Mic className={`mr-2 size-4 ${form.processing ? "animate-spin" : ""}`} />
                                {form.processing ? "Submitting..." : "Submit Application"}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.visit(route("daynews.local-voices.index") as any)}
                                disabled={form.processing}
                                className="rounded-xl"
                            >
                                Cancel
                            </Button>
                        </div>
                        <p className="text-sm text-zinc-400">
                            Your application will be reviewed before approval. You'll be notified once your creator profile is approved.
                        </p>
                    </form>
                </div>
            </div>
        </LocationProvider>
    );
}
