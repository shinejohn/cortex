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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import GoLocalVoicesLayout from "@/layouts/go-local-voices-layout";
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
        <GoLocalVoicesLayout auth={auth}>
            <Head title={`Edit ${episode.title} - ${podcast.title}`} />
            <SEO
                type="website"
                site="go-local-voices"
                data={{
                    title: `Edit ${episode.title} - ${podcast.title}`,
                    description: "Edit episode",
                    url: `/podcasts/${podcast.slug}/episodes/${episode.slug}/edit`,
                }}
            />

            <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-white py-12">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-4 flex items-center justify-between">
                        <Button
                            variant="ghost"
                            onClick={() => router.visit(`/podcasts/${podcast.slug}/episodes/${episode.slug}`)}
                            className="text-primary hover:text-primary"
                        >
                            ← Back to episode
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setDeleteDialogOpen(true)}
                            className="border-destructive"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Episode
                        </Button>
                    </div>

                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            Edit Episode
                        </h1>
                        <p className="text-muted-foreground">Update episode metadata. Duration: {episode.formatted_duration}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 bg-card rounded-lg border border p-8 shadow-sm">
                        <div>
                            <Label>Replace Audio File (Optional)</Label>
                            <div className="mt-2">
                                {audioPreview ? (
                                    <div className="flex items-center justify-between rounded-lg border border bg-muted/50 p-4">
                                        <div className="flex items-center gap-3">
                                            <Mic className="h-8 w-8 text-primary" />
                                            <div>
                                                <p className="font-medium text-foreground">{audioPreview}</p>
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
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <div
                                        onClick={() => audioInputRef.current?.click()}
                                        className="flex h-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border transition-colors hover:border-purple-400 hover:bg-accent/50"
                                    >
                                        <Upload className="mb-2 h-12 w-12 text-muted-foreground" />
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
                                className="mt-2 border focus:border-purple-500 focus:ring-purple-500"
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
                                className="mt-2 border focus:border-purple-500 focus:ring-purple-500"
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
                                className="mt-2 border focus:border-purple-500 focus:ring-purple-500"
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
                                className="mt-2 border focus:border-purple-500 focus:ring-purple-500"
                                rows={8}
                                placeholder="Detailed show notes, links, timestamps, etc..."
                            />
                            {form.errors.show_notes && <p className="mt-1 text-sm text-destructive">{form.errors.show_notes}</p>}
                        </div>

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

                        <div className="flex gap-4">
                            <Button
                                type="submit"
                                disabled={form.processing}
                                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                            >
                                <Pencil className={`mr-2 h-4 w-4 ${form.processing ? "animate-spin" : ""}`} />
                                {form.processing ? "Saving..." : "Save Changes"}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.visit(`/podcasts/${podcast.slug}/episodes/${episode.slug}`)}
                                disabled={form.processing}
                                className="border"
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
        </GoLocalVoicesLayout>
    );
}
