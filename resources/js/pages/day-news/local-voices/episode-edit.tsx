import { Head, router, useForm, usePage } from "@inertiajs/react";
import { Mic, Pencil, Trash2, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { SEO } from "@/components/common/seo";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import DayNewsHeader from "@/components/day-news/day-news-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LocationProvider } from "@/contexts/location-context";
import type { Auth } from "@/types";

interface EpisodeEditPageProps {
    auth?: Auth;
    podcast: {
        id: string;
        title: string;
        slug: string;
    };
    episode: {
        id: string;
        title: string;
        slug: string;
        description: string | null;
        show_notes: string | null;
        episode_number: string | null;
        formatted_duration: string;
    };
    updateUrl: string;
    destroyUrl: string;
    viewMode?: string;
}

export default function EpisodeEdit() {
    const { auth, podcast, episode, updateUrl, destroyUrl } = usePage<EpisodeEditPageProps>().props;
    const audioInputRef = useRef<HTMLInputElement>(null);
    const [audioPreview, setAudioPreview] = useState<string | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const form = useForm({
        title: episode.title,
        description: episode.description ?? "",
        show_notes: episode.show_notes ?? "",
        episode_number: episode.episode_number ?? "",
        audio_file: null as File | null,
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
        form.transform((data) => ({
            ...data,
            _method: "patch",
        })).post(updateUrl, {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    const handleDelete = () => {
        router.delete(destroyUrl, {
            preserveScroll: false,
            onSuccess: () => {
                setDeleteDialogOpen(false);
            },
        });
    };

    return (
        <LocationProvider>
            <div className="min-h-screen bg-background">
                <Head title={`Edit ${episode.title} - Local Voices`} />
                <SEO
                    type="website"
                    site="day-news"
                    data={{
                        title: `Edit ${episode.title} - Local Voices`,
                        description: "Edit episode",
                        url: `/local-voices/podcasts/${podcast.slug}/episodes/${episode.slug}/edit`,
                    }}
                />
                <DayNewsHeader auth={auth} />

                <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="mb-4 flex items-center justify-between">
                        <Button
                            variant="ghost"
                            onClick={() => router.visit(`/local-voices/podcasts/${podcast.slug}/episodes/${episode.slug}`)}
                        >
                            ← Back to episode
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setDeleteDialogOpen(true)}
                        >
                            <Trash2 className="mr-2 size-4" />
                            Delete Episode
                        </Button>
                    </div>

                    <h1 className="mb-8 text-4xl font-bold">Edit Episode</h1>
                    <p className="mb-8 text-muted-foreground">Update episode metadata. Duration: {episode.formatted_duration}</p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <Label>Replace Audio File (Optional)</Label>
                            <div className="mt-2">
                                {audioPreview ? (
                                    <div className="flex items-center justify-between rounded-lg border bg-muted/50 p-4">
                                        <div className="flex items-center gap-3">
                                            <Mic className="size-8 text-primary" />
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
                                        <p className="text-sm text-muted-foreground">Click to replace audio file</p>
                                        <p className="mt-1 text-xs text-muted-foreground">Leave empty to keep current audio</p>
                                    </div>
                                )}
                                <input ref={audioInputRef} type="file" accept="audio/*" onChange={handleAudioChange} className="hidden" />
                            </div>
                            {form.errors.audio_file && <p className="mt-1 text-sm text-destructive">{form.errors.audio_file}</p>}
                        </div>

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
                                onClick={() => router.visit(`/local-voices/podcasts/${podcast.slug}/episodes/${episode.slug}`)}
                                disabled={form.processing}
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </div>
            </div>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete episode?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete this episode and its audio file. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </LocationProvider>
    );
}
