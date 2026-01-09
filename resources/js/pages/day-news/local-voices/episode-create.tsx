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
import { Mic, Upload, X } from "lucide-react";
import { useRef, useState } from "react";

interface Podcast {
    id: string;
    title: string;
    slug: string;
}

interface EpisodeCreatePageProps {
    auth?: Auth;
    podcast: Podcast;
}

export default function EpisodeCreate() {
    const { auth, podcast } = usePage<EpisodeCreatePageProps>().props;
    const audioInputRef = useRef<HTMLInputElement>(null);
    const [audioPreview, setAudioPreview] = useState<string | null>(null);

    const form = useForm({
        title: "",
        description: "",
        show_notes: "",
        audio_file: null as File | null,
        episode_number: "",
    });

    const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            form.setData("audio_file", file);
            setAudioPreview(file.name);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(`/local-voices/podcasts/${podcast.slug}/episodes`, {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    return (
        <LocationProvider>
            <div className="min-h-screen bg-background">
                <Head title={`Upload Episode - ${podcast.title}`} />
                <SEO
                    type="website"
                    site="day-news"
                    data={{
                        title: `Upload Episode - ${podcast.title}`,
                        description: "Upload a new podcast episode",
                        url: `/local-voices/podcasts/${podcast.slug}/episodes/create`,
                    }}
                />
                <DayNewsHeader auth={auth} />

                <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="mb-4">
                        <Button variant="ghost" onClick={() => router.visit(`/local-voices/podcasts/${podcast.slug}`)}>
                            ← Back to {podcast.title}
                        </Button>
                    </div>

                    <h1 className="mb-8 text-4xl font-bold">Upload Episode</h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Audio File */}
                        <div>
                            <Label>Audio File *</Label>
                            <div className="mt-2">
                                {audioPreview ? (
                                    <div className="flex items-center justify-between rounded-lg border bg-card p-4">
                                        <div className="flex items-center gap-3">
                                            <Mic className="size-8 text-muted-foreground" />
                                            <div>
                                                <p className="font-medium">{audioPreview}</p>
                                                <p className="text-sm text-muted-foreground">MP3, WAV, or M4A • Max 100MB</p>
                                            </div>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setAudioPreview(null);
                                                form.setData("audio_file", null);
                                                if (audioInputRef.current) {
                                                    audioInputRef.current.value = "";
                                                }
                                            }}
                                        >
                                            <X className="size-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <div
                                        onClick={() => audioInputRef.current?.click()}
                                        className="flex h-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 transition-colors hover:border-muted-foreground/50"
                                    >
                                        <Upload className="mb-2 size-12 text-muted-foreground" />
                                        <p className="text-sm text-muted-foreground">Click to upload audio file</p>
                                        <p className="mt-1 text-xs text-muted-foreground">MP3, WAV, or M4A • Max 100MB</p>
                                    </div>
                                )}
                                <input ref={audioInputRef} type="file" accept="audio/*" onChange={handleAudioChange} className="hidden" required />
                            </div>
                            {form.errors.audio_file && <p className="mt-1 text-sm text-destructive">{form.errors.audio_file}</p>}
                        </div>

                        {/* Title */}
                        <div>
                            <Label htmlFor="title">Episode Title *</Label>
                            <Input
                                id="title"
                                value={form.data.title}
                                onChange={(e) => form.setData("title", e.target.value)}
                                className="mt-2"
                                required
                            />
                            {form.errors.title && <p className="mt-1 text-sm text-destructive">{form.errors.title}</p>}
                        </div>

                        {/* Episode Number */}
                        <div>
                            <Label htmlFor="episode_number">Episode Number (Optional)</Label>
                            <Input
                                id="episode_number"
                                value={form.data.episode_number}
                                onChange={(e) => form.setData("episode_number", e.target.value)}
                                className="mt-2"
                                placeholder="e.g., 001, S01E01"
                            />
                            {form.errors.episode_number && <p className="mt-1 text-sm text-destructive">{form.errors.episode_number}</p>}
                        </div>

                        {/* Description */}
                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={form.data.description}
                                onChange={(e) => form.setData("description", e.target.value)}
                                className="mt-2"
                                rows={4}
                                placeholder="Brief description of this episode..."
                            />
                            {form.errors.description && <p className="mt-1 text-sm text-destructive">{form.errors.description}</p>}
                        </div>

                        {/* Show Notes */}
                        <div>
                            <Label htmlFor="show_notes">Show Notes</Label>
                            <Textarea
                                id="show_notes"
                                value={form.data.show_notes}
                                onChange={(e) => form.setData("show_notes", e.target.value)}
                                className="mt-2"
                                rows={8}
                                placeholder="Detailed show notes, links, timestamps, etc..."
                            />
                            {form.errors.show_notes && <p className="mt-1 text-sm text-destructive">{form.errors.show_notes}</p>}
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
                                <Mic className={`mr-2 size-4 ${form.processing ? "animate-spin" : ""}`} />
                                {form.processing ? "Uploading..." : "Upload Episode"}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.visit(`/local-voices/podcasts/${podcast.slug}`)}
                                disabled={form.processing}
                            >
                                Cancel
                            </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            The episode will be saved as a draft. You can publish it from the podcast page.
                        </p>
                    </form>
                </div>
            </div>
        </LocationProvider>
    );
}
