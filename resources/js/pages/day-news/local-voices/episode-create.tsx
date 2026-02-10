import { Head, router, useForm, usePage } from "@inertiajs/react";
import { ArrowLeft, FileAudio, Mic, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { SEO } from "@/components/common/seo";
import DayNewsHeader from "@/components/day-news/day-news-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LocationProvider } from "@/contexts/location-context";
import type { Auth } from "@/types";

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
            <div className="min-h-screen bg-[#F8F9FB]">
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

                <div className="container mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
                    {/* Back navigation */}
                    <div className="mb-6">
                        <button
                            onClick={() => router.visit(`/local-voices/podcasts/${podcast.slug}`)}
                            className="group inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900"
                        >
                            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
                            Back to {podcast.title}
                        </button>
                    </div>

                    {/* Page heading */}
                    <div className="mb-8">
                        <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary">New Episode</p>
                        <h1 className="font-display text-4xl font-black tracking-tight text-zinc-900">Upload Episode</h1>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Audio File Upload */}
                        <div className="overflow-hidden rounded-2xl border-none bg-white p-6 shadow-sm sm:p-8">
                            <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-black tracking-tight text-zinc-900">
                                <FileAudio className="size-5 text-primary" />
                                Audio File
                            </h2>
                            <div>
                                {audioPreview ? (
                                    <div className="flex items-center justify-between rounded-2xl bg-zinc-50 p-5 ring-1 ring-zinc-200">
                                        <div className="flex items-center gap-4">
                                            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10">
                                                <Mic className="size-6 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-zinc-900">{audioPreview}</p>
                                                <p className="text-sm text-zinc-500">MP3, WAV, or M4A -- Max 100MB</p>
                                            </div>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="rounded-full text-zinc-400 hover:text-destructive"
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
                                        className="flex h-40 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50 transition-all hover:border-primary/40 hover:bg-primary/5"
                                    >
                                        <div className="mb-3 flex size-14 items-center justify-center rounded-2xl bg-primary/10">
                                            <Upload className="size-6 text-primary" />
                                        </div>
                                        <p className="font-medium text-zinc-700">Click to upload audio file</p>
                                        <p className="mt-1 text-sm text-zinc-400">MP3, WAV, or M4A -- Max 100MB</p>
                                    </div>
                                )}
                                <input ref={audioInputRef} type="file" accept="audio/*" onChange={handleAudioChange} className="hidden" required />
                            </div>
                            {form.errors.audio_file && <p className="mt-2 text-sm font-medium text-destructive">{form.errors.audio_file}</p>}
                        </div>

                        {/* Basic Information */}
                        <div className="overflow-hidden rounded-2xl border-none bg-white p-6 shadow-sm sm:p-8">
                            <h2 className="mb-6 font-display text-lg font-black tracking-tight text-zinc-900">Basic Information</h2>

                            <div className="space-y-6">
                                {/* Title */}
                                <div>
                                    <Label htmlFor="title" className="text-sm font-bold text-zinc-700">
                                        Episode Title <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="title"
                                        value={form.data.title}
                                        onChange={(e) => form.setData("title", e.target.value)}
                                        className="mt-2 h-12 border-none bg-zinc-50 ring-1 ring-zinc-200 focus:ring-2 focus:ring-primary"
                                        placeholder="Enter episode title"
                                        required
                                    />
                                    {form.errors.title && <p className="mt-1.5 text-sm font-medium text-destructive">{form.errors.title}</p>}
                                </div>

                                {/* Episode Number */}
                                <div>
                                    <Label htmlFor="episode_number" className="text-sm font-bold text-zinc-700">
                                        Episode Number <span className="text-zinc-400">(Optional)</span>
                                    </Label>
                                    <Input
                                        id="episode_number"
                                        value={form.data.episode_number}
                                        onChange={(e) => form.setData("episode_number", e.target.value)}
                                        className="mt-2 h-12 border-none bg-zinc-50 ring-1 ring-zinc-200 focus:ring-2 focus:ring-primary"
                                        placeholder="e.g., 001, S01E01"
                                    />
                                    {form.errors.episode_number && (
                                        <p className="mt-1.5 text-sm font-medium text-destructive">{form.errors.episode_number}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="overflow-hidden rounded-2xl border-none bg-white p-6 shadow-sm sm:p-8">
                            <h2 className="mb-6 font-display text-lg font-black tracking-tight text-zinc-900">Content</h2>

                            <div className="space-y-6">
                                {/* Description */}
                                <div>
                                    <Label htmlFor="description" className="text-sm font-bold text-zinc-700">
                                        Description
                                    </Label>
                                    <Textarea
                                        id="description"
                                        value={form.data.description}
                                        onChange={(e) => form.setData("description", e.target.value)}
                                        className="mt-2 min-h-[120px] border-none bg-zinc-50 ring-1 ring-zinc-200 focus:ring-2 focus:ring-primary"
                                        rows={4}
                                        placeholder="Brief description of this episode..."
                                    />
                                    <p className="mt-1.5 text-xs text-zinc-400">Provide a compelling description to attract listeners.</p>
                                    {form.errors.description && (
                                        <p className="mt-1.5 text-sm font-medium text-destructive">{form.errors.description}</p>
                                    )}
                                </div>

                                {/* Show Notes */}
                                <div>
                                    <Label htmlFor="show_notes" className="text-sm font-bold text-zinc-700">
                                        Show Notes
                                    </Label>
                                    <Textarea
                                        id="show_notes"
                                        value={form.data.show_notes}
                                        onChange={(e) => form.setData("show_notes", e.target.value)}
                                        className="mt-2 min-h-[200px] border-none bg-zinc-50 ring-1 ring-zinc-200 focus:ring-2 focus:ring-primary"
                                        rows={8}
                                        placeholder="Detailed show notes, links, timestamps, etc..."
                                    />
                                    {form.errors.show_notes && (
                                        <p className="mt-1.5 text-sm font-medium text-destructive">{form.errors.show_notes}</p>
                                    )}
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
                                {form.processing ? "Uploading..." : "Upload Episode"}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.visit(`/local-voices/podcasts/${podcast.slug}`)}
                                disabled={form.processing}
                                className="rounded-xl"
                            >
                                Cancel
                            </Button>
                        </div>
                        <p className="text-sm text-zinc-400">
                            The episode will be saved as a draft. You can publish it from the podcast page.
                        </p>
                    </form>
                </div>
            </div>
        </LocationProvider>
    );
}
